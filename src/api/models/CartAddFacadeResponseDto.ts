/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CartTotalsDto } from './CartTotalsDto';
export type CartAddFacadeResponseDto = {
    cartItemId?: number;
    finalQuantity?: number;
    itemTotalPrice?: number;
    cartTotals?: CartTotalsDto;
    operation?: 'ITEM_ADDED' | 'QUANTITY_INCREASED' | 'QUANTITY_UPDATED';
};

