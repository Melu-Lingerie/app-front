/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductVariantCardDto } from './ProductVariantCardDto';
/**
 * Карточка товара
 */
export type ProductCardResponse = {
    /**
     * ID продукта
     */
    productId: number;
    /**
     * Название
     */
    name: string;
    /**
     * Артикул/ID
     */
    articleNumber: string;
    /**
     * Описание товара
     */
    description: string;
    /**
     * Состав материалов
     */
    structure: string;
    /**
     * Оценка товара
     */
    score: number;
    /**
     * Описания способов ухода за изделием
     */
    care: string;
    /**
     * ID категории товара
     */
    categoryId: number;
    productVariants: Array<ProductVariantCardDto>;
};

