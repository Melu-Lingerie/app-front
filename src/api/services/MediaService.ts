/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PresignUploadResponseDto } from '../models/PresignUploadResponseDto';
import type { UploadMediaResponseDto } from '../models/UploadMediaResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import type { ApiRequestOptions } from '../core/ApiRequestOptions';
import { request as __request } from '../core/request';
export class MediaService {
    /**
     * Загрузить медиафайл
     * Принимает файл в формате multipart/form-data и возвращает метаданные загруженного ресурса. Заголовок X-Request-Id используется для трассировки запросов.
     * @param xRequestId Идентификатор запроса для трассировки (UUID). Если не задан, может быть сгенерирован на стороне сервера.
     * @param formData
     * @returns UploadMediaResponseDto Файл успешно загружен
     * @throws ApiError
     */
    public static uploadMedia(
        xRequestId?: string,
        formData?: {
            /**
             * Загружаемый файл
             */
            file: Blob;
        },
     options?: Partial<ApiRequestOptions>): CancelablePromise<UploadMediaResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/media/upload',
            headers: {
                'X-Request-Id': xRequestId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Неверный формат запроса или отсутствует файл`,
                415: `Неподдерживаемый тип содержимого (ожидается multipart/form-data)`,
                500: `Внутренняя ошибка сервера при загрузке файла`,
            },
        });
    }

    public static presignUpload(
        body: { fileName: string; contentType: string; fileSize: number },
    ): CancelablePromise<PresignUploadResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/media/presign',
            body: body,
            mediaType: 'application/json',
            errors: {
                400: `Неверные параметры файла`,
                500: `Внутренняя ошибка сервера`,
            },
        });
    }

    public static confirmUpload(
        body: { key: string; bucket: string; fileName: string; contentType: string; fileSize: number },
    ): CancelablePromise<UploadMediaResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/media/confirm-upload',
            body: body,
            mediaType: 'application/json',
            errors: {
                400: `Неверные параметры`,
                500: `Внутренняя ошибка сервера`,
            },
        });
    }
}
