/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductVariantMediaCardDto } from './ProductVariantMediaCardDto';
/**
 * Вариант товара для карточки (цвет/размер и атрибуты наличия)
 */
export type ProductVariantCardDto = {
    /**
     * ID варианта товара
     */
    id: number;
    /**
     * Название цвета
     */
    colorName: string;
    /**
     * Размер
     */
    size: string;
    /**
     * Остаток на складе
     */
    stockQuantity: number;
    /**
     * Доплата к базовой цене для данного варианта
     */
    price: number;
    /**
     * Признак доступности к заказу
     */
    isAvailable: boolean;
    /**
     * Порядок отображения варианта
     */
    sortOrder: number;
    productVariantMedia: Array<ProductVariantMediaCardDto>;
};

