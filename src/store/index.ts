import { configureStore, createAsyncThunk } from '@reduxjs/toolkit';
import cartReducer, { fetchCart } from './cartSlice';
import wishlistReducer, { fetchWishlist } from './wishlistSlice';
import appReducer from './appSlice';

// ✅ thunk для инициализации приложения
export const initApp = createAsyncThunk<void, void, { state: RootState }>(
    'app/init',
    async (_, { getState, dispatch }) => {
        const { cart, wishlist } = getState();

        const tasks: Array<Promise<unknown>> = [];

        if (cart.cartId) {
            tasks.push(dispatch(fetchCart(cart.cartId)).unwrap());
        }

        if (wishlist.wishlistId) {
            tasks.push(dispatch(fetchWishlist(Number(wishlist.wishlistId))).unwrap());
        }

        if (tasks.length > 0) {
            await Promise.allSettled(tasks);
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
