/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Ответ с данными адреса доставки
 */
export type AddressFacadeResponseDto = {
    /**
     * ID адреса
     */
    id?: number;
    /**
     * ID пользователя
     */
    userId?: number;
    /**
     * Название адреса
     */
    addressLabel?: string;
    /**
     * Имя получателя
     */
    recipientFirstName?: string;
    /**
     * Фамилия получателя
     */
    recipientLastName?: string;
    /**
     * Email получателя
     */
    recipientEmail?: string;
    /**
     * Телефон получателя
     */
    recipientPhone?: string;
    /**
     * Адрес (улица, дом, квартира)
     */
    streetAddress?: string;
    /**
     * Город
     */
    city?: string;
    /**
     * Регион/область
     */
    region?: string;
    /**
     * Страна
     */
    country?: string;
    /**
     * Почтовый индекс
     */
    postalCode?: string;
    /**
     * Адрес по умолчанию
     */
    isDefault?: boolean;
    /**
     * Дата создания
     */
    createdAt?: string;
    /**
     * Дата последнего обновления
     */
    updatedAt?: string;
};

