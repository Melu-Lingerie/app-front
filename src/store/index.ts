import {clearUser, setAuthenticated, setUserData, setUserId} from './userSlice';
import { createAsyncThunk, configureStore } from '@reduxjs/toolkit';
import cartReducer, { fetchCart, setCartId } from './cartSlice';
import wishlistReducer, { fetchWishlist, setWishlistId } from './wishlistSlice';
import appReducer from './appSlice';
import userReducer from './userSlice';
import loyaltyReducer from './loyaltySlice';
import {Service, UserManagementService} from '@/api';

/**
 * Инициализация приложения:
 * - Проверка refreshToken
 * - Обновление accessToken при необходимости
 * - Загрузка корзины и избранного
 */
export const initApp = createAsyncThunk<void, {userId: number; skipSilentRefresh?: boolean}, { state: RootState }>(
    'app/init',
    async ({userId, skipSilentRefresh}, { getState, dispatch }) => {
        const { cart, wishlist, user } = getState();

        const tasks: Array<Promise<unknown>> = [];

        /**
         * 1️⃣ Проверка refreshToken и обновление токена
         */
        const now = Date.now();

        // Сначала полностью определяем статус аутентификации (валидный токен / рефреш / гость)
        if (user.accessToken && user.accessTokenExpiresAt && user.accessTokenExpiresAt > now) {
            // Валидный accessToken → отмечаем и подтягиваем профиль
            dispatch(setAuthenticated(true));
            localStorage.setItem('wasAuthed', '1');
            dispatch(setUserId(userId));
            try {
                const data = await UserManagementService.getCurrentUserInfo();
                dispatch(setUserData(data));
            } catch (err) {
                console.error('Ошибка получения информации о пользователе:', err);
            }
        } else if (user.isAuthenticated || skipSilentRefresh !== true) {
            // Пробуем тихий refresh по httpOnly-куке
            try {
                const res = await Service.refresh();
                if (!res?.accessToken) throw new Error('No accessToken in refresh response');
                const accessTokenExpiresAt = typeof res.accessTokenExpiresIn === 'number'
                    ? Date.now() + res.accessTokenExpiresIn * 1000
                    : undefined;
                dispatch(setAuthenticated(true));
                dispatch(setUserData({
                    userId,
                    accessToken: res.accessToken!,
                    accessTokenExpiresAt: accessTokenExpiresAt ?? null,
                }));
                localStorage.setItem('wasAuthed', '1');
                try {
                    const data = await UserManagementService.getCurrentUserInfo();
                    dispatch(setUserData(data));
                } catch (err) {
                    console.error('Ошибка получения информации о пользователе:', err);
                }
            } catch {
                // refresh не получился — приводим к гостю
                dispatch(clearUser());
                dispatch(setUserId(userId));
                localStorage.setItem('wasAuthed', '0');
            }
        } else {
            // Гость и silent refresh запрещён — не пытаемся рефрешить вовсе
            dispatch(clearUser());
            dispatch(setUserId(userId));
            localStorage.setItem('wasAuthed', '0');
        }

        /**
         * 2️⃣ Добавляем загрузку корзины и wishlist
         */
        if (cart.cartId) {
            tasks.push(dispatch(fetchCart(cart.cartId)).unwrap());
        }

        if (wishlist.wishlistId) {
            tasks.push(dispatch(fetchWishlist(Number(wishlist.wishlistId))).unwrap());
        }

        /**
         * 3️⃣ Дожидаемся всех задач
         */
        if (tasks.length > 0) {
            await Promise.allSettled(tasks);
        }

        /**
         * 4️⃣ Теперь можно рендерить приложение
         * (например, app.initialized = true)
         */
    }
);

/**
 * Принудительный логаут и реинициализация гостевой сессии
 * Используется из axios-интерцепторов при провале refresh
 */
const SESSION_COOKIE_NAME = 'sessionId';

const setCookie = (name: string, value: string, days: number) => {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; Secure; SameSite=Lax`;
};

const detectDeviceInfo = async () => {
    const ua = navigator.userAgent;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const screenDensity = (window as any).devicePixelRatio || 1;

    let deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET' = 'DESKTOP';
    if (/Mobi|Android/i.test(ua)) deviceType = 'MOBILE';
    else if (/Tablet|iPad/i.test(ua)) deviceType = 'TABLET';

    let browserName = 'Unknown';
    let browserVersion = '';
    if (ua.includes('Chrome')) {
        browserName = 'Chrome';
        browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1] || '';
    } else if (ua.includes('Firefox')) {
        browserName = 'Firefox';
        browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1] || '';
    } else if (ua.includes('Safari')) {
        browserName = 'Safari';
        browserVersion = ua.match(/Version\/([0-9.]+)/)?.[1] || '';
    }

    let osVersion = 'Unknown';
    if (ua.includes('Windows')) osVersion = 'Windows';
    else if (ua.includes('Mac')) osVersion = 'MacOS';
    else if (ua.includes('Android')) osVersion = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) osVersion = 'iOS';

    const deviceName = (navigator as any).userAgentData?.platform
        ? (navigator as any).userAgentData.platform.slice(0, 100)
        : (navigator.userAgent || 'Unknown').slice(0, 100);

    return {
        deviceType,
        ipAddress: undefined as string | undefined,
        deviceName,
        osVersion,
        browserName,
        browserVersion,
        screenWidth,
        screenHeight,
        screenDensity,
    };
};

export const logoutAndReinit = createAsyncThunk<void, { callServerLogout?: boolean } | undefined, { state: RootState }>(
    'app/logoutAndReinit',
    async (arg, { dispatch }) => {
        localStorage.setItem('wasAuthed', '0');
        const callServerLogout = arg?.callServerLogout !== false;
        try {
            // 1) сервер сам прочитает httpOnly refresh-куку
            if (callServerLogout) {
                await Service.logout();
            }
        } catch {}

        // 2) чистим пользователя
        dispatch(clearUser());

        // 3) создаём гостевую сессию
        const newSid = (crypto as any).randomUUID?.() || Math.random().toString(36).slice(2);
        setCookie(SESSION_COOKIE_NAME, newSid, 30);

        // 4) регистрируем гостя на сервере и инициализируем приложение
        try {
            const deviceInfo = await detectDeviceInfo();
            const res = await fetch('/api/v1/users/guests', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceInfo }),
            });
            const data = res.ok ? await res.json() : {};

            if (data?.cartId) {
                dispatch(setCartId(data.cartId));
            }
            if (data?.wishlistId) {
                dispatch(setWishlistId(data.wishlistId));
            }
            await dispatch(initApp({ userId: data?.userId ?? 0, skipSilentRefresh: true }));
        } catch {
            // как минимум, сбросим приложение в "чистое" состояние
        }
    }
);

export const store = configureStore({
    reducer: {
        app: appReducer,
        cart: cartReducer,
        wishlist: wishlistReducer,
        user: userReducer,
        loyalty: loyaltyReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;