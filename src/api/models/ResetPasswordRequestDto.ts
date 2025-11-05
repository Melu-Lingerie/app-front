/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Запрос на сброс пароля
 */
export type ResetPasswordRequestDto = {
    /**
     * Email пользователя
     */
    email: string;
    /**
     * 6-значный код из email для подтверждения сброса пароля
     */
    code: string;
    /**
     * Новый пароль (минимум 8 символов)
     */
    newPassword: string;
};

