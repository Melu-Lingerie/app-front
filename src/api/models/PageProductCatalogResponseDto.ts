/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PageableObject } from './PageableObject';
import type { ProductCatalogResponseDto } from './ProductCatalogResponseDto';
import type { SortObject } from './SortObject';
export type PageProductCatalogResponseDto = {
    totalPages?: number;
    totalElements?: number;
    pageable?: PageableObject;
    numberOfElements?: number;
    size?: number;
    content?: Array<ProductCatalogResponseDto>;
    number?: number;
    sort?: SortObject;
    first?: boolean;
    last?: boolean;
    empty?: boolean;
};

