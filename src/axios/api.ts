import axios, {
    type AxiosError,
    type InternalAxiosRequestConfig,
    CanceledError,
} from 'axios';
import { store } from '@/store';
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
    headers: { 'Content-Type': 'application/json' },
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

 //  Request: отменяем ПРЕДЫДУЩИЙ, новый отправляем
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
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
    const state = store.getState();
    const token = state.user?.accessToken;

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
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
    (error: unknown) => {
        const cfg = (error as AxiosError<unknown>)?.config as
            | InternalAxiosRequestConfig
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

        if (error instanceof CanceledError || axios.isCancel?.(error) || isAbortError(error)) {
            // Мягко реджектим как отмену (с явным тип-параметром)
            return Promise.reject(new CanceledError<unknown>('Canceled'));
        }

        return Promise.reject(error);
    }
);

export default api;
