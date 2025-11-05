/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Ответ с обновленными токенами
 */
export type RefreshResponseDto = {
    /**
     * Новый access токен
     */
    accessToken?: string;
    /**
     * Время жизни access токена в секундах
     */
    accessTokenExpiresIn?: number;
    /**
     * Новый refresh токен
     */
    refreshToken?: string;
    /**
     * Время жизни refresh токена в секундах
     */
    refreshTokenExpiresIn?: number;
};

