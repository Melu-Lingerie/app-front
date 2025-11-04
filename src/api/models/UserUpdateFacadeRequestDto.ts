/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Запрос на обновление данных пользователя
 */
export type UserUpdateFacadeRequestDto = {
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
     * Email пользователя
     */
    email: string;
    /**
     * Номер телефона
     */
    phoneNumber?: string;
    /**
     * Дата рождения
     */
    birthDate?: string;
};

