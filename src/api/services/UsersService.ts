/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserCreateFacadeRequestDto } from '../models/UserCreateFacadeRequestDto';
import type { UserCreateFacadeResponseDto } from '../models/UserCreateFacadeResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Создать гостевого пользователя
     * Создаёт гостевого пользователя, связывая его с текущей клиентской сессией (cookie sessionId). Если пользователь уже существует для данной сессии, возвращает существующую запись.
     * @param sessionId Идентификатор клиентской сессии (cookie)
     * @param requestBody Данные для создания гостевого пользователя
     * @returns UserCreateFacadeResponseDto Гостевой пользователь уже существует (идемпотентный результат)
     * @throws ApiError
     */
    public static createGuestUser(
        sessionId: string,
        requestBody: UserCreateFacadeRequestDto,
    ): CancelablePromise<UserCreateFacadeResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/guests',
            cookies: {
                'sessionId': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Некорректные данные запроса`,
                401: `Недостаточно прав или некорректная сессия`,
                500: `Внутренняя ошибка сервера`,
            },
        });
    }
}
