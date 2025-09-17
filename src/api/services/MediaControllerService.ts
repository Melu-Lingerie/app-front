/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UploadMediaResponseDto } from '../models/UploadMediaResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MediaControllerService {
    /**
     * @param xRequestId
     * @param formData
     * @returns UploadMediaResponseDto OK
     * @throws ApiError
     */
    public static uploadMedia(
        xRequestId: string,
        formData?: {
            file: Blob;
        },
    ): CancelablePromise<UploadMediaResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/media/upload',
            headers: {
                'X-Request-Id': xRequestId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
