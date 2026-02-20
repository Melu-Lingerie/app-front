/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BannerMainPageFacadeDto } from '../models/BannerMainPageFacadeDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import type { ApiRequestOptions } from '../core/ApiRequestOptions';
import { request as __request } from '../core/request';
export class MainPageControllerService {
    /**
     * @returns BannerMainPageFacadeDto OK
     * @throws ApiError
     */
    public static toBannerMainPageFacadeDto( options?: Partial<ApiRequestOptions>): CancelablePromise<Array<BannerMainPageFacadeDto>> {
        return __request(OpenAPI, { ...options,
            method: 'GET',
            url: '/main-page/banner',
        });
    }

    public static getBannersByPlacement(placement: string, options?: Partial<ApiRequestOptions>): CancelablePromise<Array<BannerMainPageFacadeDto>> {
        return __request(OpenAPI, { ...options,
            method: 'GET',
            url: '/main-page/banner/{placement}',
            path: { placement },
        });
    }
}
