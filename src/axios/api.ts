import axios, {
    type AxiosError,
    type InternalAxiosRequestConfig,
    CanceledError,
} from 'axios';
import { store, logoutAndReinit } from '@/store';
import qs from 'qs';
import {isAbortError} from '@/utils/utils.ts';

 //  Активные запросы по ключу (для отмены ПРЕДЫДУЩЕГО)
const pendingRequests = new Map<string, AbortController>();

 //  Метаданные запроса без мутации config
type DedupeMeta = { key: string; controller: AbortController };
const requestMeta = new WeakMap<InternalAxiosRequestConfig, DedupeMeta>();

 //  Инстанс axios
const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true,
    paramsSerializer: (params) =>
        qs.stringify(params, {
            arrayFormat: 'repeat',
            sort: (a, b) => a.localeCompare(b),
            skipNulls: true,
        }),
});

const isAbsoluteUrl = (u?: string) =>
    !!u && /^([a-z][a-z\d+\-.]*:)?\/\//i.test(u);

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && Object.getPrototypeOf(v) === Object.prototype;

const isBinaryLike = (val: unknown): boolean => {
    if (typeof ArrayBuffer !== 'undefined') {
        if (val instanceof ArrayBuffer) return true;
        if (ArrayBuffer.isView(val as unknown as ArrayBufferView)) return true;
    }
    if (typeof Blob !== 'undefined' && val instanceof Blob) return true;
    if (typeof FormData !== 'undefined' && val instanceof FormData) return true;
    return false;
};

// Стабильная сериализация для ключа (упорядочиваем ключи объектов, защищаемся от бинарных тел)
const stableStringify = (val: unknown): string => {
    if (val == null) return '';
    if (typeof val === 'string') return val;
    if (typeof val !== 'object') return JSON.stringify(val);
    if (isBinaryLike(val)) return '__binary__';

    const sortObj = (o: unknown): unknown => {
        if (Array.isArray(o)) return o.map((x) => sortObj(x));
        if (!isPlainObject(o)) return o;

        const obj = o as Record<string, unknown>;
        const sortedEntries = Object.keys(obj)
            .sort()
            .map<[string, unknown]>((k) => [k, sortObj(obj[k])]);
        return Object.fromEntries(sortedEntries) as Record<string, unknown>;
    };

    return JSON.stringify(sortObj(val));
};

const joinUrl = (base: string, path: string) =>
    `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

const getRequestKey = (config: InternalAxiosRequestConfig): string => {
    const method = (config.method || 'GET').toUpperCase();
    const base = config.baseURL ?? '';
    const rawUrl = config.url ?? '';
    const url = isAbsoluteUrl(rawUrl) ? rawUrl : joinUrl(base, rawUrl);

    const query = config.params
        ? qs.stringify(config.params, {
            arrayFormat: 'repeat',
            sort: (a, b) => a.localeCompare(b),
            skipNulls: true,
        })
        : '';

    const hasBody = !['GET', 'HEAD'].includes(method);
    const body = hasBody && config.data != null ? stableStringify(config.data) : '';

    return `${method}::${url}::${query}::${body}`;
};

// --- Auth route bypass ------------------------------------------------------
const BYPASS_REFRESH_PATHS = [
    '/auth/refresh',
    '/auth/refresh-token',
    '/auth/logout',
    '/users/guests',
];

const shouldBypassAuth = (config: InternalAxiosRequestConfig): boolean => {
    const rawUrl = config.url ?? '';
    const base = config.baseURL ?? '';
    const full = isAbsoluteUrl(rawUrl)
        ? new URL(rawUrl)
        : new URL(joinUrl(base, rawUrl), window.location.origin);
    const p = full.pathname;
    return BYPASS_REFRESH_PATHS.some((x) => p.endsWith(x));
};

// --- Auth helpers -----------------------------------------------------------
const SKEW_MS = 45_000; // рефрешим токен немного заранее
let refreshInFlight: Promise<void> | null = null;

const COOL_DOWN_MS = 30_000; // не спамим рефрешем при отсутствии куки
let refreshHardFailedUntil = 0; // таймштамп, до которого рефреш отключён
let logoutInFlight: Promise<void> | null = null;

const triggerLogoutOnce = async (callServerLogout = true) => {
    if (!logoutInFlight) {
        logoutInFlight = (store.dispatch as any)(logoutAndReinit({ callServerLogout }));
        try { await logoutInFlight; } finally { logoutInFlight = null; }
    } else {
        await logoutInFlight;
    }
};

const doRefresh = async (): Promise<void> => {
    const res = await fetch('/api/v1/auth/refresh-token', {
        method: 'POST',
        credentials: 'include', // httpOnly-кука уйдёт сама
        headers: { 'Content-Type': 'application/json' },
    });

    let data: any = null;
    try { data = await res.json(); } catch {}

    if (!res.ok) {
        const err: any = new Error('Refresh failed');
        err.status = res.status;
        const msg = (data?.message || data?.error || data?.detail || '').toString().toLowerCase();
        if (res.status === 401 || res.status === 400) {
            // пытаемся понять, что куки нет
            if (msg.includes('cookie') && msg.includes('refresh')) {
                err.code = 'REFRESH_MISSING';
            } else {
                err.code = 'REFRESH_UNAVAILABLE';
            }
        } else {
            err.code = 'REFRESH_ERROR';
        }
        throw err;
    }

    if (!data?.accessToken) {
        const err: any = new Error('No accessToken in refresh response');
        err.code = 'REFRESH_INVALID';
        throw err;
    }

    const expiresAt = typeof data.accessTokenExpiresIn === 'number'
        ? Date.now() + data.accessTokenExpiresIn * 1000 - SKEW_MS
        : undefined;

    store.dispatch({
        type: 'user/setAuthenticated',
        payload: true,
    } as any);
    store.dispatch({
        type: 'user/setUserData',
        payload: {
            accessToken: data.accessToken,
            accessTokenExpiresAt: expiresAt ?? null,
        },
    } as any);
};

const ensureFreshToken = async (): Promise<void> => {
    const state = store.getState() as any;
    const user = state?.user;
    const now = Date.now();

    // Гостям/неаутентифицированным токен не нужен — ничего не делаем
    if (!user?.isAuthenticated) return;

    // Живой токен — выходим
    if (user?.accessToken && user?.accessTokenExpiresAt && user.accessTokenExpiresAt > now) return;

    // Если недавно падали — не спамим рефрешом
    if (now < refreshHardFailedUntil) throw new Error('REFRESH_UNAVAILABLE');

    if (!refreshInFlight) {
        refreshInFlight = doRefresh()
            .catch((e) => {
                // Запретим повторные попытки на время, чтобы не было бесконечного цикла
                refreshHardFailedUntil = Date.now() + COOL_DOWN_MS;
                throw e;
            })
            .finally(() => {
                refreshInFlight = null;
            });
    }
    await refreshInFlight;
};

//  Request: отменяем ПРЕДЫДУЩИЙ, новый отправляем
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    // For FormData, remove Content-Type so the browser sets multipart/form-data with boundary.
    // For non-FormData requests, default to application/json.
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    } else {
        if (!config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }
    }

    const key = getRequestKey(config);

    const prev = pendingRequests.get(key);
    if (prev) prev.abort();

    const controller = new AbortController();

    if (config.signal) {
        if (config.signal.aborted) {
            controller.abort();
        } else {
            config.signal.addEventListener?.('abort', () => controller.abort(), { once: true });
        }
    }

    config.signal = controller.signal;
    pendingRequests.set(key, controller);

    requestMeta.set(config, { key, controller });

    // 🔐 перед каждым запросом убеждаемся, что токен жив/обновлен (кроме bypass-маршрутов)
    const bypass = shouldBypassAuth(config);
    let proceedAsGuest = false;
    if (!bypass) {
        try {
            await ensureFreshToken();
        } catch (e) {
            const code = (e as any)?.code;
            const callServerLogout = code !== 'REFRESH_MISSING';
            await triggerLogoutOnce(callServerLogout);
            if (code === 'REFRESH_MISSING') {
                // рефреш-куки нет — не отменяем запрос, идём как гость
                proceedAsGuest = true;
            } else {
                // иные ошибки рефреша — отменяем запрос
                throw new CanceledError('Canceled');
            }
        }
    }

    const state = store.getState() as any;
    const token = (!bypass && !proceedAsGuest)
        ? (state.user?.accessToken as string | undefined)
        : undefined;

    if (token) {
        config.headers = config.headers || {};
        (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
});

//  Response: чистка и корректная отмена
api.interceptors.response.use(
    (response) => {
        const cfg = response.config as InternalAxiosRequestConfig;
        const meta = requestMeta.get(cfg);
        if (meta) {
            const current = pendingRequests.get(meta.key);
            if (current && current === meta.controller) {
                pendingRequests.delete(meta.key);
            }
            requestMeta.delete(cfg);
        }
        return response;
    },
    async (error: unknown) => {
        const cfg = (error as AxiosError<unknown>)?.config as
            | (InternalAxiosRequestConfig & { _retried?: boolean })
            | undefined;

        if (cfg) {
            const meta = requestMeta.get(cfg);
            if (meta) {
                const current = pendingRequests.get(meta.key);
                if (current && current === meta.controller) {
                    pendingRequests.delete(meta.key);
                }
                requestMeta.delete(cfg);
            }
        }

        if (
            (error as AxiosError)?.response?.status === 401 &&
            cfg &&
            !cfg._retried &&
            !shouldBypassAuth(cfg)
        ) {
            try {
                await ensureFreshToken();
                cfg._retried = true;
                const token = (store.getState() as any).user?.accessToken as string | undefined;
                if (token) {
                    cfg.headers = cfg.headers || {};
                    (cfg.headers as any).Authorization = `Bearer ${token}`;
                }
                return api.request(cfg);
            } catch (e) {
                const code = (e as any)?.code;
                const callServerLogout = code !== 'REFRESH_MISSING';
                await triggerLogoutOnce(callServerLogout);
                if (code === 'REFRESH_MISSING') {
                    // возвращаем исходную ошибку, чтобы логика могла обработать 401 как гостю
                    return Promise.reject(error);
                }
                return Promise.reject(new CanceledError('Canceled'));
            }
        }

        if (error instanceof CanceledError || axios.isCancel?.(error) || isAbortError(error)) {
            return Promise.reject(new CanceledError<unknown>('Canceled'));
        }

        return Promise.reject(error);
    }
);

export default api;
