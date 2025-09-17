/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Pageable } from '../models/Pageable';
import type { ProductCardResponse } from '../models/ProductCardResponse';
import type { ProductCatalogResponseDto } from '../models/ProductCatalogResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProductsService {
    /**
     * Получить карточку товара
     * Возвращает детальную информацию по карточке товара по идентификатору.
     * @param productId Идентификатор товара
     * @returns ProductCardResponse Карточка товара
     * @throws ApiError
     */
    public static getProductCardInfo(
        productId: number,
    ): CancelablePromise<ProductCardResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/products/{productId}',
            path: {
                'productId': productId,
            },
            errors: {
                400: `Некорректный идентификатор`,
                404: `Товар не найден`,
            },
        });
    }
    /**
     * Получить каталог товаров
     * Возвращает страницу элементов каталога с фильтрами по цене, категориям, размерам и цветам; поддерживает пагинацию и сортировку.
     * @param pageable
     * @param name Имя товара
     * @param minPrice Минимальная цена фильтра
     * @param maxPrice Максимальная цена фильтра
     * @param categories
     * @param sizes
     * @param sizesOfBraWithCups
     * @param colors
     * @param productStatus запрашиваемый статус продукта
     * @returns ProductCatalogResponseDto Страница элементов каталога
     * @throws ApiError
     */
    public static getCatalog(
        pageable: Pageable,
        name?: string,
        minPrice?: number,
        maxPrice?: number,
        categories?: Array<number>,
        sizes?: Array<string>,
        sizesOfBraWithCups?: Array<string>,
        colors?: Array<string>,
        productStatus?: 'NOT_AVAILABLE' | 'AVAILABLE' | 'NEW' | 'SOON',
    ): CancelablePromise<ProductCatalogResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/products/catalog',
            query: {
                'name': name,
                'minPrice': minPrice,
                'maxPrice': maxPrice,
                'categories': categories,
                'sizes': sizes,
                'sizesOfBraWithCups': sizesOfBraWithCups,
                'colors': colors,
                'productStatus': productStatus,
                'pageable': pageable,
            },
            errors: {
                400: `Некорректные параметры запроса`,
                500: `Внутренняя ошибка сервера`,
            },
        });
    }
}
