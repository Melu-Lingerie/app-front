import { createSlice } from '@reduxjs/toolkit';
import { initApp } from './index'; // твой thunk

interface AppState {
    initialized: boolean;
    error: string | null;
}

const initialState: AppState = {
    initialized: false,
    error: null,
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(initApp.pending, (state) => {
                state.initialized = false;
                state.error = null;
            })
            .addCase(initApp.fulfilled, (state) => {
                state.initialized = true;
            })
            .addCase(initApp.rejected, (state, action) => {
                state.initialized = true; // даже если упало — инициализация считается завершённой
                state.error = action.error.message ?? 'Ошибка инициализации';
            });
    },
});

export default appSlice.reducer;

// ✅ Селекторы
export const selectAppInitialized = (state: { app: AppState }) =>
    state.app.initialized;
export const selectAppError = (state: { app: AppState }) => state.app.error;
