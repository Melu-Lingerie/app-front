/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CartItemDetailsFacadeResponseDto } from './CartItemDetailsFacadeResponseDto';
/**
 * Содержимое корзины и агрегированные значения
 */
export type CartGetFacadeResponseDto = {
    items?: Array<CartItemDetailsFacadeResponseDto>;
    /**
     * Общее количество позиций в корзине
     */
    itemsCount: number;
    /**
     * Итоговая сумма по корзине
     */
    totalAmount: number;
};

