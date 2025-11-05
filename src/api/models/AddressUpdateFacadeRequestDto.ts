/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Запрос на обновление адреса доставки
 */
export type AddressUpdateFacadeRequestDto = {
    /**
     * Название адреса
     */
    addressLabel: string;
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
    streetAddress: string;
    /**
     * Город
     */
    city: string;
    /**
     * Регион/область
     */
    region?: string;
    /**
     * Страна
     */
    country: string;
    /**
     * Почтовый индекс
     */
    postalCode?: string;
    /**
     * Адрес по умолчанию
     */
    isDefault?: boolean;
};

