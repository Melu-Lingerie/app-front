import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import {
    WishlistService,
    type WishlistGetFacadeResponseDto,
    type WishlistItemGetFacadeResponseDto
} from '@/api';
import type { RootState } from './index.ts';

interface WishlistState {
    wishlistId: string | null;
    items: WishlistItemGetFacadeResponseDto[];
    itemsCount: number;
    loading: boolean;
    error: string | null;
}

const initialState: WishlistState = {
    wishlistId: null,
    items: [],
    itemsCount: 0,
    loading: false,
    error: null,
};

// ✅ Получить список wishlist
export const fetchWishlist = createAsyncThunk<
    WishlistGetFacadeResponseDto,
    number,
    { rejectValue: string }
>('wishlist/fetchWishlist', async (wishlistId, { rejectWithValue }) => {
    try {
        return await WishlistService.getWishlist(wishlistId);
    } catch (e: any) {
        return rejectWithValue(e?.message || 'Ошибка загрузки избранного');
    }
});

// ✅ Toggle (добавить или удалить товар)
export const toggleWishlistItem = createAsyncThunk<
    void,
    { wishlistId: number; productId: number },
    { rejectValue: string; state: RootState }
>('wishlist/toggleWishlistItem', async ({ wishlistId, productId }, { getState, dispatch, rejectWithValue }) => {
    try {
        const state = getState();
        const existingItem = state.wishlist.items.find((i) => i.productCatalogResponseDto?.productId === productId);

        if (existingItem?.id) {
            // 🔴 удаляем
            await WishlistService.removeItemFromWishlist(wishlistId, existingItem.id);
        } else {
            // 🟢 добавляем
            await WishlistService.addItemToWishlist(wishlistId, { productId });
        }

        // 🔄 обновляем список
        await dispatch(fetchWishlist(wishlistId));
    } catch (e: any) {
        return rejectWithValue(e?.message || 'Ошибка при обновлении избранного');
    }
});

// Очистить весь wishlist
export const clearWishlistAsync = createAsyncThunk<
    void,
    number,
    { rejectValue: string }
>('wishlist/clearWishlistAsync', async (wishlistId, { rejectWithValue }) => {
    try {
        await WishlistService.clearWishlist(wishlistId);
    } catch (e: any) {
        return rejectWithValue(e?.message || 'Ошибка при очистке избранного');
    }
});

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        setWishlistId: (state, action: PayloadAction<string>) => {
            state.wishlistId = action.payload;
        },
        clearWishlist: (state) => {
            state.wishlistId = null;
            state.items = [];
            state.itemsCount = 0;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.itemsCount = action.payload.itemsCount;
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Ошибка';
            })
            .addCase(toggleWishlistItem.pending, (state) => {
                state.loading = true;
            })
            .addCase(toggleWishlistItem.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(toggleWishlistItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Ошибка';
            })
            .addCase(clearWishlistAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(clearWishlistAsync.fulfilled, (state) => {
                state.loading = false;
                state.items = [];
                state.itemsCount = 0;
            })
            .addCase(clearWishlistAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Ошибка';
            });
    },
});

export const { setWishlistId, clearWishlist } = wishlistSlice.actions;

// ✅ Селекторы
export const selectWishlistId = (state: RootState) => state.wishlist.wishlistId;
export const selectWishlistItems = (state: RootState) => state.wishlist.items;
export const selectWishlistCount = (state: RootState) => state.wishlist.itemsCount;
export const selectWishlistLoading = (state: RootState) => state.wishlist.loading;

export default wishlistSlice.reducer;
