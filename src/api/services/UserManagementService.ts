/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserCreateFacadeRequestDto } from '../models/UserCreateFacadeRequestDto';
import type { UserCreateFacadeResponseDto } from '../models/UserCreateFacadeResponseDto';
import type { UserInfoResponseDto } from '../models/UserInfoResponseDto';
import type { UserUpdateFacadeRequestDto } from '../models/UserUpdateFacadeRequestDto';
import type { UserUpdateFacadeResponseDto } from '../models/UserUpdateFacadeResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import type { ApiRequestOptions } from '../core/ApiRequestOptions';
import { request as __request } from '../core/request';
export class UserManagementService {
    /**
     * Обновить данные текущего пользователя
     * Обновляет личные данные авторизованного пользователя
     * @param requestBody
     * @returns UserUpdateFacadeResponseDto OK
     * @throws ApiError
     */
    public static updateCurrentUser(
        requestBody: UserUpdateFacadeRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<UserUpdateFacadeResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'PUT',
            url: '/users/profile',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Создать гостевого пользователя
     * Создает нового гостевого пользователя с уникальной сессией
     * @param sessionId
     * @param requestBody
     * @returns UserCreateFacadeResponseDto OK
     * @throws ApiError
     */
    public static createGuestUser(
        sessionId: string,
        requestBody: UserCreateFacadeRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<UserCreateFacadeResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/users/guests',
            cookies: {
                'sessionId': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns string OK
     * @throws ApiError
     */
    public static test( options?: Partial<ApiRequestOptions>): CancelablePromise<string> {
        return __request(OpenAPI, { ...options,
            method: 'GET',
            url: '/users/test',
        });
    }
    /**
     * Получить информацию о текущем пользователе
     * Возвращает данные авторизованного пользователя
     * @returns UserInfoResponseDto OK
     * @throws ApiError
     */
    public static getCurrentUserInfo( options?: Partial<ApiRequestOptions>): CancelablePromise<UserInfoResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'GET',
            url: '/users/info',
        });
    }
}
