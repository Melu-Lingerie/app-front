import { configureStore, createAsyncThunk } from '@reduxjs/toolkit';
import cartReducer, { fetchCart } from './cartSlice';
import wishlistReducer, { fetchWishlist } from './wishlistSlice';
import appReducer from './appSlice';

// ✅ thunk для инициализации приложения
export const initApp = createAsyncThunk<void, void, { state: RootState }>(
    'app/init',
    async (_, { getState, dispatch }) => {
        const { cart, wishlist } = getState();

        if (cart.cartId) {
            await dispatch(fetchCart(cart.cartId));
        }

        if (wishlist.wishlistId) {
            await dispatch(fetchWishlist(Number(wishlist.wishlistId)));
        }
    }
);

export const store = configureStore({
    reducer: {
        app: appReducer,
        cart: cartReducer,
        wishlist: wishlistReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
