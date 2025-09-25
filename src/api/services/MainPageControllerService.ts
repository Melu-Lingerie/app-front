/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BannerMainPageFacadeDto } from '../models/BannerMainPageFacadeDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MainPageControllerService {
    /**
     * @returns BannerMainPageFacadeDto OK
     * @throws ApiError
     */
    public static toBannerMainPageFacadeDto(): CancelablePromise<Array<BannerMainPageFacadeDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/main-page/banner',
        });
    }
}
