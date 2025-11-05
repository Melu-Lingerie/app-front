/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddressCreateFacadeRequestDto } from '../models/AddressCreateFacadeRequestDto';
import type { AddressFacadeResponseDto } from '../models/AddressFacadeResponseDto';
import type { AddressUpdateFacadeRequestDto } from '../models/AddressUpdateFacadeRequestDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import type { ApiRequestOptions } from '../core/ApiRequestOptions';
import { request as __request } from '../core/request';
export class AddressManagementService {
    /**
     * Получить адрес по ID
     * Возвращает конкретный адрес пользователя по его ID
     * @param addressId
     * @returns AddressFacadeResponseDto OK
     * @throws ApiError
     */
    public static getAddressById(
        addressId: number,
     options?: Partial<ApiRequestOptions>): CancelablePromise<AddressFacadeResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'GET',
            url: '/addresses/{addressId}',
            path: {
                'addressId': addressId,
            },
        });
    }
    /**
     * Обновить адрес
     * Обновляет существующий адрес доставки
     * @param addressId
     * @param requestBody
     * @returns AddressFacadeResponseDto OK
     * @throws ApiError
     */
    public static updateAddress(
        addressId: number,
        requestBody: AddressUpdateFacadeRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<AddressFacadeResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'PUT',
            url: '/addresses/{addressId}',
            path: {
                'addressId': addressId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Удалить адрес
     * Удаляет адрес доставки по ID
     * @param addressId
     * @returns any OK
     * @throws ApiError
     */
    public static deleteAddress(
        addressId: number,
     options?: Partial<ApiRequestOptions>): CancelablePromise<any> {
        return __request(OpenAPI, { ...options,
            method: 'DELETE',
            url: '/addresses/{addressId}',
            path: {
                'addressId': addressId,
            },
        });
    }
    /**
     * Получить все адреса текущего пользователя
     * Возвращает список всех адресов доставки пользователя
     * @returns AddressFacadeResponseDto OK
     * @throws ApiError
     */
    public static getAllAddresses( options?: Partial<ApiRequestOptions>): CancelablePromise<Array<AddressFacadeResponseDto>> {
        return __request(OpenAPI, { ...options,
            method: 'GET',
            url: '/addresses',
        });
    }
    /**
     * Создать новый адрес
     * Создаёт новый адрес доставки для текущего пользователя
     * @param requestBody
     * @returns AddressFacadeResponseDto OK
     * @throws ApiError
     */
    public static createAddress(
        requestBody: AddressCreateFacadeRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<AddressFacadeResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/addresses',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Получить адреса по названию
     * Возвращает адреса пользователя с определённым названием (например: 'Дом', 'Работа', 'Дача')
     * @param addressLabel
     * @returns AddressFacadeResponseDto OK
     * @throws ApiError
     */
    public static getAddressesByLabel(
        addressLabel: string,
     options?: Partial<ApiRequestOptions>): CancelablePromise<Array<AddressFacadeResponseDto>> {
        return __request(OpenAPI, { ...options,
            method: 'GET',
            url: '/addresses/label/{addressLabel}',
            path: {
                'addressLabel': addressLabel,
            },
        });
    }
    /**
     * Получить адрес по умолчанию
     * Возвращает адрес доставки по умолчанию
     * @returns AddressFacadeResponseDto OK
     * @throws ApiError
     */
    public static getDefaultAddress( options?: Partial<ApiRequestOptions>): CancelablePromise<AddressFacadeResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'GET',
            url: '/addresses/default',
        });
    }
}
