/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Запрос на регистрацию нового пользователя
 */
export type RegisterRequestDto = {
    /**
     * Email пользователя
     */
    email: string;
    /**
     * Имя пользователя
     */
    firstName: string;
    /**
     * Отчество пользователя
     */
    middleName?: string;
    /**
     * Фамилия пользователя
     */
    lastName: string;
    /**
     * Номер телефона в формате +7XXXXXXXXXX
     */
    phoneNumber?: string;
    /**
     * Пароль (минимум 8 символов)
     */
    password: string;
    /**
     * ID пользователя (создается на предыдущем шаге)
     */
    userId: number;
};

