/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CalculateDeliveryRequestDto, TariffResponseDto, DeliveryPointResponseDto } from '../models/DeliveryDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import type { ApiRequestOptions } from '../core/ApiRequestOptions';
import { request as __request } from '../core/request';

export class DeliveryService {
    /**
     * Calculate delivery cost
     * Returns available tariffs with delivery cost calculation
     * @param requestBody Delivery calculation request
     * @returns TariffResponseDto[] Available tariffs
     * @throws ApiError
     */
    public static calculateDeliveryCost(
        requestBody: CalculateDeliveryRequestDto,
        options?: Partial<ApiRequestOptions>
    ): CancelablePromise<TariffResponseDto[]> {
        return __request(OpenAPI, {
            ...options,
            method: 'POST',
            url: '/delivery/calculate',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: 'Invalid request data',
            },
        });
    }

    /**
     * Get delivery points by city
     * Returns list of CDEK delivery points for the specified city
     * @param city City name
     * @returns DeliveryPointResponseDto[] Delivery points
     * @throws ApiError
     */
    public static getDeliveryPointsByCity(
        city: string,
        options?: Partial<ApiRequestOptions>
    ): CancelablePromise<DeliveryPointResponseDto[]> {
        return __request(OpenAPI, {
            ...options,
            method: 'GET',
            url: '/delivery/points/city/{city}',
            path: {
                city: encodeURIComponent(city),
            },
        });
    }

    /**
     * Get delivery points by city and type
     * Returns list of CDEK delivery points for the specified city and type
     * @param city City name
     * @param type Point type (PVZ or POSTAMAT)
     * @returns DeliveryPointResponseDto[] Delivery points
     * @throws ApiError
     */
    public static getDeliveryPointsByCityAndType(
        city: string,
        type: 'PVZ' | 'POSTAMAT',
        options?: Partial<ApiRequestOptions>
    ): CancelablePromise<DeliveryPointResponseDto[]> {
        return __request(OpenAPI, {
            ...options,
            method: 'GET',
            url: '/delivery/points/city/{city}/type/{type}',
            path: {
                city: encodeURIComponent(city),
                type,
            },
        });
    }

    /**
     * Get delivery point by code
     * Returns delivery point info by its CDEK code
     * @param code CDEK point code
     * @returns DeliveryPointResponseDto Delivery point info
     * @throws ApiError
     */
    public static getDeliveryPointByCode(
        code: string,
        options?: Partial<ApiRequestOptions>
    ): CancelablePromise<DeliveryPointResponseDto> {
        return __request(OpenAPI, {
            ...options,
            method: 'GET',
            url: '/delivery/points/code/{code}',
            path: {
                code,
            },
            errors: {
                404: 'Delivery point not found',
            },
        });
    }

    /**
     * Search delivery points
     * Search delivery points by city name query
     * @param query Search query
     * @returns DeliveryPointResponseDto[] Search results
     * @throws ApiError
     */
    public static searchDeliveryPoints(
        query: string,
        options?: Partial<ApiRequestOptions>
    ): CancelablePromise<DeliveryPointResponseDto[]> {
        return __request(OpenAPI, {
            ...options,
            method: 'GET',
            url: '/delivery/points/search',
            query: {
                query,
            },
        });
    }
}
