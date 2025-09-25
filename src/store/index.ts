import { configureStore, createAsyncThunk } from '@reduxjs/toolkit';
import cartReducer, { fetchCart } from './cartSlice';
import wishlistReducer, { fetchWishlist } from './wishlistSlice';

// ✅ thunk для инициализации приложения
export const initApp = createAsyncThunk<void, void, { state: RootState }>(
    'app/init',
    async (_, { getState, dispatch }) => {
        const { cart, wishlist } = getState();

        // Загружаем корзину, если есть cartId
        if (cart.cartId) {
            await dispatch(fetchCart(cart.cartId));
        }

        // Загружаем wishlist, если есть wishlistId
        if (wishlist.wishlistId) {
            await dispatch(fetchWishlist(Number(wishlist.wishlistId)));
        }
    }
);

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        wishlist: wishlistReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
