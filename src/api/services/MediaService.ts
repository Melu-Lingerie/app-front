/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UploadMediaResponseDto } from '../models/UploadMediaResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
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
    ): CancelablePromise<UploadMediaResponseDto> {
        return __request(OpenAPI, {
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
}
