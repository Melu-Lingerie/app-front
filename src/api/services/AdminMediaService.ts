import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export type MediaAdminResponseDto = {
    id: number;
    fileName: string;
    mimeType: string;
    mediaType: string;
    fileSize: number;
    s3Url: string;
    s3Bucket: string;
    s3Key: string;
    isActive: boolean;
    createdAt: string;
};

export class AdminMediaService {
    public static getAllMedia(): CancelablePromise<MediaAdminResponseDto[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/media',
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
            },
        });
    }

    public static deleteMedia(id: number): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/admin/media/{id}',
            path: { id },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Media not found',
            },
        });
    }
}
