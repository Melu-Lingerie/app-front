/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Элемент каталога (упрощённая карточка товара)
 */
export type ProductCatalogResponseDto = {
    /**
     * ID продукта
     */
    productId?: number;
    /**
     * Название продукта
     */
    name?: string;
    /**
     * Итоговая цена
     */
    price?: number;
    /**
     * ссылка на медиа
     */
    s3url?: string;
    /**
     * Доступные цвета
     */
    colors?: Array<string>;
    productStatus?: 'NOT_AVAILABLE' | 'AVAILABLE' | 'NEW' | 'SOON';
};

