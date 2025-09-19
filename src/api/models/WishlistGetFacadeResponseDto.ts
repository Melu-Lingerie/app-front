/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WishlistItemGetResponseDto } from './WishlistItemGetResponseDto';
/**
 * Ответ на получение списка желаний: элементы и их количество
 */
export type WishlistGetFacadeResponseDto = {
    items: Array<WishlistItemGetResponseDto>;
    /**
     * Общее количество элементов в списке
     */
    itemsCount: number;
};

