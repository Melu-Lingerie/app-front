/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WishlistAddFacadeRequestDto } from '../models/WishlistAddFacadeRequestDto';
import type { WishlistAddFacadeResponseDto } from '../models/WishlistAddFacadeResponseDto';
import type { WishlistGetFacadeResponseDto } from '../models/WishlistGetFacadeResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import type { ApiRequestOptions } from '../core/ApiRequestOptions';
import { request as __request } from '../core/request';
export class WishlistService {
    /**
     * Добавить товар в список избранных товаров
     * Добавляет товар в список избранных товаров пользователя
     * @param wishlistId Идентификатор списка избранных товаров
     * @param requestBody
     * @returns WishlistAddFacadeResponseDto Товар успешно добавлен в список избранных товаров
     * @throws ApiError
     */
    public static addItemToWishlist(
        wishlistId: number,
        requestBody: WishlistAddFacadeRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<WishlistAddFacadeResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/wishlist/{wishlistId}/items',
            path: {
                'wishlistId': wishlistId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Некорректные данные товара`,
                404: `Список избранных товаров или товар не найдены`,
                409: `Товар уже есть в списке избранных или достигнут лимит`,
            },
        });
    }
    /**
     * Удалить товары из списка избранных товаров
     * Удаляет один или несколько товаров из списка избранных товаров
     * @param wishlistId Идентификатор списка избранных товаров
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static removeItemsFromWishlist(
        wishlistId: number,
        requestBody: Array<number>,
     options?: Partial<ApiRequestOptions>): CancelablePromise<void> {
        return __request(OpenAPI, { ...options,
            method: 'DELETE',
            url: '/wishlist/{wishlistId}/items',
            path: {
                'wishlistId': wishlistId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Некорректный список идентификаторов`,
                404: `Список желаний не найден`,
            },
        });
    }
    /**
     * Получить список избранных товаров
     * Возвращает список избранных товаров по идентификатору
     * @param wishlistId Идентификатор списка избранных товаров
     * @returns WishlistGetFacadeResponseDto Список избранных товаров успешно получен
     * @throws ApiError
     */
    public static getWishlist(
        wishlistId: number,
     options?: Partial<ApiRequestOptions>): CancelablePromise<WishlistGetFacadeResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'GET',
            url: '/wishlist/{wishlistId}',
            path: {
                'wishlistId': wishlistId,
            },
            errors: {
                400: `Некорректный ID списка избранных товаров`,
                404: `Список избранных товаров не найден`,
            },
        });
    }
    /**
     * Очистить список избранных товаров
     * Удаляет все товары из списка избранных товаров
     * @param wishlistId Идентификатор списка избранных товаров
     * @returns number Список избранных товаров успешно очищен
     * @throws ApiError
     */
    public static clearWishlist(
        wishlistId: number,
     options?: Partial<ApiRequestOptions>): CancelablePromise<number> {
        return __request(OpenAPI, { ...options,
            method: 'DELETE',
            url: '/wishlist/{wishlistId}',
            path: {
                'wishlistId': wishlistId,
            },
            errors: {
                404: `Список избранных товаров не найден`,
            },
        });
    }
}
