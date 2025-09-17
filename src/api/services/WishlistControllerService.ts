/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WishlistAddFacadeRequestDto } from '../models/WishlistAddFacadeRequestDto';
import type { WishlistAddFacadeResponseDto } from '../models/WishlistAddFacadeResponseDto';
import type { WishlistGetFacadeResponseDto } from '../models/WishlistGetFacadeResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WishlistControllerService {
    /**
     * @param wishlistId
     * @param requestBody
     * @returns WishlistAddFacadeResponseDto OK
     * @throws ApiError
     */
    public static addItemToWishlist(
        wishlistId: number,
        requestBody: WishlistAddFacadeRequestDto,
    ): CancelablePromise<WishlistAddFacadeResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/wishlist/{wishlistId}/items',
            path: {
                'wishlistId': wishlistId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param wishlistId
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static removeItemsFromWishlist(
        wishlistId: number,
        requestBody: Array<number>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/wishlist/{wishlistId}/items',
            path: {
                'wishlistId': wishlistId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param wishlistId
     * @returns WishlistGetFacadeResponseDto OK
     * @throws ApiError
     */
    public static getWishlist(
        wishlistId: number,
    ): CancelablePromise<WishlistGetFacadeResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/wishlist/{wishlistId}',
            path: {
                'wishlistId': wishlistId,
            },
        });
    }
    /**
     * @param wishlistId
     * @returns number OK
     * @throws ApiError
     */
    public static clearWishlist(
        wishlistId: number,
    ): CancelablePromise<number> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/wishlist/{wishlistId}',
            path: {
                'wishlistId': wishlistId,
            },
        });
    }
}
