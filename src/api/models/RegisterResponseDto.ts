/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Ответ на регистрацию пользователя
 */
export type RegisterResponseDto = {
    /**
     * Сообщение о результате регистрации
     */
    message?: string;
    /**
     * Email, на который отправлен код
     */
    email?: string;
    /**
     * Время действия кода в минутах
     */
    codeExpiresInMinutes?: number;
};

