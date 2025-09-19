import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { CartService, type CartGetFacadeResponseDto } from '@/api';
import { type RootState } from './index';

// ---- Thunks ----

// Получить корзину
export const fetchCart = createAsyncThunk<CartGetFacadeResponseDto, number>(
    'cart/fetchCart',
    async (cartId) => {
        return await CartService.getCart(cartId);
    }
);

// Добавить товар
export const addItemToCart = createAsyncThunk<
    void,
    { cartId: number; productId: number; variantId: number }
>('cart/addItemToCart', async ({ cartId, productId, variantId }) => {
    await CartService.addItemToCart(cartId, {
        productId,
        variantId,
        quantity: 1,
    });
});

// Удалить товар
export const removeItemFromCart = createAsyncThunk<
    number,
    { cartId: number; itemId: number }
>('cart/removeItemFromCart', async ({ cartId, itemId }) => {
    await CartService.removeItemsFromCart(cartId, [itemId]);
    return itemId;
});

// Очистить корзину
export const clearCartApi = createAsyncThunk<void, number>(
    'cart/clearCart',
    async (cartId) => {
        await CartService.clearCart(cartId);
    }
);

// Обновить количество
export const updateItemQuantity = createAsyncThunk<
    { itemId: number; quantity: number },
    { cartId: number; itemId: number; quantity: number }
>('cart/updateItemQuantity', async ({ cartId, itemId, quantity }) => {
    await CartService.updateItemQuantity(cartId, itemId, quantity);
    return { itemId, quantity };
});

// ---- Slice ----
type CartState = {
    cartId: number | null;
    items: any[];
    itemsCount: number;
    totalAmount: number;
    loading: boolean;
    removingItemIds: number[];
    updatingItemIds: number[];
};

const initialState: CartState = {
    cartId: null,
    items: [],
    itemsCount: 0,
    totalAmount: 0,
    loading: false,
    removingItemIds: [],
    updatingItemIds: [],
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCartId: (state, action: PayloadAction<number>) => {
            state.cartId = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchCart
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items || [];
                state.itemsCount = action.payload.itemsCount || 0;
                state.totalAmount = action.payload.totalAmount || 0;
            })
            .addCase(fetchCart.rejected, (state) => {
                state.loading = false;
            })

            // removeItemFromCart
            .addCase(removeItemFromCart.pending, (state, action) => {
                state.removingItemIds.push(action.meta.arg.itemId);
            })
            .addCase(removeItemFromCart.fulfilled, (state, action) => {
                const itemId = action.payload;
                state.items = state.items.filter((i) => i.itemId !== itemId);
                state.itemsCount = state.items.length;
                state.totalAmount = state.items.reduce(
                    (sum, i) => sum + (i.totalPrice ?? 0),
                    0
                );
                state.removingItemIds = state.removingItemIds.filter((id) => id !== itemId);
            })
            .addCase(removeItemFromCart.rejected, (state, action) => {
                state.removingItemIds = state.removingItemIds.filter(
                    (id) => id !== action.meta.arg.itemId
                );
            })

            // clearCart
            .addCase(clearCartApi.fulfilled, (state) => {
                state.items = [];
                state.itemsCount = 0;
                state.totalAmount = 0;
            })

            // updateItemQuantity
            .addCase(updateItemQuantity.pending, (state, action) => {
                state.updatingItemIds.push(action.meta.arg.itemId);
            })
            .addCase(updateItemQuantity.fulfilled, (state, action) => {
                const { itemId, quantity } = action.payload;
                const item = state.items.find((i) => i.itemId === itemId);
                if (item) {
                    item.quantity = quantity;
                    item.totalPrice = (item.unitPrice ?? 0) * quantity;
                }
                state.itemsCount = state.items.reduce((sum, i) => sum + (i.quantity ?? 0), 0);
                state.totalAmount = state.items.reduce(
                    (sum, i) => sum + (i.totalPrice ?? 0),
                    0
                );
                state.updatingItemIds = state.updatingItemIds.filter((id) => id !== itemId);
            })
            .addCase(updateItemQuantity.rejected, (state, action) => {
                state.updatingItemIds = state.updatingItemIds.filter(
                    (id) => id !== action.meta.arg.itemId
                );
            });
    },
});

export const { setCartId } = cartSlice.actions;
export default cartSlice.reducer;

// Selectors
export const selectCart = (state: RootState) => state.cart;
