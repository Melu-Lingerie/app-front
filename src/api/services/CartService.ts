/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CartAddFacadeRequestDto } from '../models/CartAddFacadeRequestDto';
import type { CartAddFacadeResponseDto } from '../models/CartAddFacadeResponseDto';
import type { CartGetFacadeResponseDto } from '../models/CartGetFacadeResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import type { ApiRequestOptions } from '../core/ApiRequestOptions';
import { request as __request } from '../core/request';
export class CartService {
    /**
     * Обновить количество товара в корзине
     * Изменяет количество конкретного товара в корзине
     * @param cartId Идентификатор корзины
     * @param itemId Идентификатор товара в корзине
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static updateItemQuantity(
        cartId: number,
        itemId: number,
        requestBody: number,
     options?: Partial<ApiRequestOptions>): CancelablePromise<void> {
        return __request(OpenAPI, { ...options,
            method: 'PUT',
            url: '/cart/{cartId}/items/{itemId}/quantity',
            path: {
                'cartId': cartId,
                'itemId': itemId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Некорректное количество`,
                404: `Корзина или товар не найдены`,
            },
        });
    }
    /**
     * Добавить товар в корзину
     * Добавляет товар в корзину или увеличивает количество если товар уже есть в корзине
     * @param cartId Идентификатор корзины
     * @param requestBody
     * @returns CartAddFacadeResponseDto Товар успешно добавлен в корзину
     * @throws ApiError
     */
    public static addItemToCart(
        cartId: number,
        requestBody: CartAddFacadeRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<CartAddFacadeResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/cart/{cartId}/items',
            path: {
                'cartId': cartId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Некорректные данные товара`,
                404: `Корзина или товар не найдены`,
                409: `Корзина заполнена или превышен лимит количества`,
            },
        });
    }
    /**
     * Удалить товары из корзины
     * Удаляет указанные товары из корзины по списку их идентификаторов
     * @param cartId Идентификатор корзины
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static removeItemsFromCart(
        cartId: number,
        requestBody: Array<number>,
     options?: Partial<ApiRequestOptions>): CancelablePromise<void> {
        return __request(OpenAPI, { ...options,
            method: 'DELETE',
            url: '/cart/{cartId}/items',
            path: {
                'cartId': cartId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Некорректный список идентификаторов`,
                404: `Корзина не найдена`,
            },
        });
    }
    /**
     * Получить содержимое корзины
     * Возвращает все товары в корзине с общей суммой и количеством товаров
     * @param cartId Идентификатор корзины
     * @returns CartGetFacadeResponseDto Содержимое корзины успешно получено
     * @throws ApiError
     */
    public static getCart(
        cartId: number,
     options?: Partial<ApiRequestOptions>): CancelablePromise<CartGetFacadeResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'GET',
            url: '/cart/{cartId}',
            path: {
                'cartId': cartId,
            },
            errors: {
                400: `Некорректный ID корзины`,
                404: `Корзина не найдена`,
            },
        });
    }
    /**
     * Очистить корзину
     * Удаляет все товары из корзины
     * @param cartId Идентификатор корзины
     * @returns number Корзина успешно очищена. Возвращает количество удаленных товаров
     * @throws ApiError
     */
    public static clearCart(
        cartId: number,
     options?: Partial<ApiRequestOptions>): CancelablePromise<number> {
        return __request(OpenAPI, { ...options,
            method: 'DELETE',
            url: '/cart/{cartId}',
            path: {
                'cartId': cartId,
            },
            errors: {
                404: `Корзина не найдена`,
            },
        });
    }
}
