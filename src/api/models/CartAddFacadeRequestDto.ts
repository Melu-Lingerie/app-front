/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Данные товара для добавления в корзину
 */
export type CartAddFacadeRequestDto = {
    /**
     * Идентификатор товара
     */
    productId: number;
    /**
     * Идентификатор варианта товара (цвет/размер)
     */
    variantId: number;
    /**
     * Запрашиваемое количество единиц
     */
    quantity: number;
};

