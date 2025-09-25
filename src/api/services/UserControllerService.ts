/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserCreateFacadeRequestDto } from '../models/UserCreateFacadeRequestDto';
import type { UserCreateFacadeResponseDto } from '../models/UserCreateFacadeResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserControllerService {
    /**
     * @param sessionId
     * @param requestBody
     * @returns UserCreateFacadeResponseDto OK
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
        });
    }
}
