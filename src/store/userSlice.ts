import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    userId: number | null;
    role: 'GUEST' | 'CUSTOMER' | 'CONTENT_MANAGER' | 'SUPPORT' | 'ADMIN' | null;
    status:
        | 'ACTIVE'
        | 'INACTIVE'
        | 'BANNED'
        | 'PENDING_VERIFICATION'
        | 'UNREGISTERED'
        | null;
    accessToken: string | null;
    accessTokenExpiresAt: number | null;

    /** 🔐 Показывает, авторизован ли пользователь */
    isAuthenticated: boolean;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    middleName: string | null;
    phoneNumber: string | null;
    birthDate: string | null;
    addresses: import('@/api/models/AddressFacadeResponseDto').AddressFacadeResponseDto[];
}

const initialState: UserState = {
    userId: null,
    email: null,
    firstName: null,
    middleName: null,
    lastName: null,
    phoneNumber: null,
    birthDate: null,
    role: null,
    status: null,
    accessToken: null,
    accessTokenExpiresAt: null,
    isAuthenticated: false,
    addresses: [],
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserId(state, action: PayloadAction<number | null>) {
            state.userId = action.payload;
        },
        setUserData(state, action: PayloadAction<Partial<UserState>>) {
            Object.assign(state, action.payload);
        },
        setAddresses(state, action: PayloadAction<import('@/api/models/AddressFacadeResponseDto').AddressFacadeResponseDto[]>) {
            state.addresses = action.payload;
        },
        removeAddressById(state, action: PayloadAction<number>) {
            state.addresses = state.addresses.filter((addr) => addr.id !== action.payload);
        },
        setAuthenticated(state, action: PayloadAction<boolean>) {
            state.isAuthenticated = action.payload;
        },
        clearUser(state) {
            state.userId = null;
            state.email = null;
            state.firstName = null;
            state.middleName = null;
            state.lastName = null;
            state.phoneNumber = null;
            state.birthDate = null;
            state.addresses = [];
            state.role = null;
            state.status = null;
            state.accessToken = null;
            state.accessTokenExpiresAt = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setUserId, clearUser, setUserData, setAuthenticated, setAddresses, removeAddressById } = userSlice.actions;

export const selectUser = (state: { user: UserState }) => state.user;
export const selectUserId = (state: { user: UserState }) => state.user.userId;
export const selectAccessToken = (state: { user: UserState }) => state.user.accessToken;
export const selectIsAuthenticated = (state: { user: UserState }) =>
    state.user.isAuthenticated;

export default userSlice.reducer;