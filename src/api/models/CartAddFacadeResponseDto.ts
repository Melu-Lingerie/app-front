/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CartTotalsDto } from './CartTotalsDto';
/**
 * Результат изменения корзины (добавление/увеличение/уменьшение)
 */
export type CartAddFacadeResponseDto = {
    /**
     * Идентификатор позиции в корзине
     */
    cartItemId: number;
    /**
     * Итоговое количество данной позиции после операции
     */
    finalQuantity: number;
    /**
     * Итоговая стоимость позиции (количество × цена за единицу)
     */
    itemTotalPrice: number;
    /**
     * Агрегированные итоги по корзине (сумма, скидки, доставка и т.д.)
     */
    cartTotals: CartTotalsDto;
    /**
     * Тип выполненной операции над корзиной
     */
    operation: 'ITEM_ADDED' | 'QUANTITY_INCREASED' | 'QUANTITY_UPDATED';
};

