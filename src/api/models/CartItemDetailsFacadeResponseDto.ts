/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Детальная информация по позиции корзины
 */
export type CartItemDetailsFacadeResponseDto = {
    /**
     * Идентификатор позиции корзины
     */
    itemId: number;
    /**
     * Идентификатор товара
     */
    productId: number;
    /**
     * Идентификатор категории
     */
    categoryId: number;
    /**
     * Идентификатор варианта товара (цвет/размер)
     */
    variantId: number;
    /**
     * Количество единиц товара в позиции
     */
    quantity: number;
    /**
     * Цена за единицу товара
     */
    unitPrice: number;
    /**
     * Итоговая цена позиции (quantity × unitPrice)
     */
    totalPrice: number;
    /**
     * Дата/время добавления позиции (ISO-8601)
     */
    addedAt: string;
    /**
     * Наименование товара
     */
    productName: string;
    /**
     * Артикул товара (SKU)
     */
    productSku: string;
    /**
     * Цвет варианта
     */
    variantColor: string;
    /**
     * Размер варианта
     */
    variantSize: string;
    /**
     * URL изображения товара
     */
    imageUrl: string;
    /**
     * Признак, что товар в избранном
     */
    isFavorite: boolean;
};

