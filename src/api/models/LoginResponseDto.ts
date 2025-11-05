/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Ответ на успешный вход в систему
 */
export type LoginResponseDto = {
    /**
     * ID пользователя
     */
    userId?: number;
    /**
     * ID сессии пользователя
     */
    sessionId?: string;
    /**
     * Email пользователя
     */
    email?: string;
    /**
     * Имя пользователя
     */
    firstName?: string;
    /**
     * Фамилия пользователя
     */
    lastName?: string;
    /**
     * Роль пользователя
     */
    role?: 'GUEST' | 'CUSTOMER' | 'CONTENT_MANAGER' | 'SUPPORT' | 'ADMIN';
    /**
     * Статус пользователя
     */
    status?: 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'PENDING_VERIFICATION' | 'UNREGISTERED';
    /**
     * Access токен для авторизации запросов
     */
    accessToken?: string;
    /**
     * Refresh токен для обновления access токена
     */
    refreshToken?: string;
    /**
     * Время жизни access токена в секундах
     */
    accessTokenExpiresIn?: number;
    /**
     * Время жизни refresh токена в секундах
     */
    refreshTokenExpiresIn?: number;
};

