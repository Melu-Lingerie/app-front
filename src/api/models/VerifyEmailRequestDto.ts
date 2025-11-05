/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Запрос на подтверждение email
 */
export type VerifyEmailRequestDto = {
    /**
     * Email пользователя
     */
    email: string;
    /**
     * 6-значный код подтверждения из email
     */
    code: string;
};

