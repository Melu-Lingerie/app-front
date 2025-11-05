import Cookies from 'js-cookie';
import {clearUser, setAuthenticated, setUserData} from './userSlice';
import { createAsyncThunk, configureStore } from '@reduxjs/toolkit';
import cartReducer, { fetchCart } from './cartSlice';
import wishlistReducer, { fetchWishlist } from './wishlistSlice';
import appReducer from './appSlice';
import userReducer from './userSlice';
import {Service, UserManagementService} from '@/api';

/**
 * Инициализация приложения:
 * - Проверка refreshToken
 * - Обновление accessToken при необходимости
 * - Загрузка корзины и избранного
 */
export const initApp = createAsyncThunk<void, void, { state: RootState }>(
    'app/init',
    async (_, { getState, dispatch }) => {
        const { cart, wishlist } = getState();

        const tasks: Array<Promise<unknown>> = [];

        /**
         * 1️⃣ Проверка refreshToken и обновление токена
         */
        const refreshToken = Cookies.get('refreshToken');
        if (refreshToken) {
            dispatch(setAuthenticated(true));
            const refreshPromise = Service.refresh({ refreshToken })
                .then((res) => {
                    if (res.accessToken) {

                        // Сохраняем новый refreshToken
                        if (res.refreshToken && res.refreshTokenExpiresIn) {
                            Cookies.set('refreshToken', res.refreshToken, {
                                expires: res.refreshTokenExpiresIn / 86400, // секунды → дни
                                secure: true,
                                sameSite: 'strict',
                            });
                        }

                        // Сохраняем accessToken в Redux
                        dispatch(
                            setUserData({
                                accessToken: res.accessToken!,
                            })
                        );

                        return UserManagementService.getCurrentUserInfo()
                            .then((data) => {
                                dispatch(setUserData(data));
                            })
                            .catch((err) => {
                                console.error('Ошибка получения информации о пользователе:', err);
                            });
                    }
                })
                .catch(() => {
                    Cookies.remove('refreshToken');
                    dispatch(clearUser());
                });

            // Добавляем в очередь
            tasks.push(refreshPromise);
        } else {
            dispatch(clearUser());
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

export const store = configureStore({
    reducer: {
        app: appReducer,
        cart: cartReducer,
        wishlist: wishlistReducer,
        user: userReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;