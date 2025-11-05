/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Ответ на запрос восстановления пароля
 */
export type ForgotPasswordResponseDto = {
    /**
     * Сообщение о результате
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

