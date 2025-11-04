/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type LoginResponseDto = {
    userId?: number;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: 'GUEST' | 'CUSTOMER' | 'CONTENT_MANAGER' | 'SUPPORT' | 'ADMIN';
    status?: 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'PENDING_VERIFICATION' | 'UNREGISTERED';
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresIn?: number;
    refreshTokenExpiresIn?: number;
};

