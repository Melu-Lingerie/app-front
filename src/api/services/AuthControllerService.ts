/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ForgotPasswordRequestDto } from '../models/ForgotPasswordRequestDto';
import type { ForgotPasswordResponseDto } from '../models/ForgotPasswordResponseDto';
import type { LoginRequestDto } from '../models/LoginRequestDto';
import type { LoginResponseDto } from '../models/LoginResponseDto';
import type { LogoutRequestDto } from '../models/LogoutRequestDto';
import type { RefreshRequestDto } from '../models/RefreshRequestDto';
import type { RefreshResponseDto } from '../models/RefreshResponseDto';
import type { RegisterRequestDto } from '../models/RegisterRequestDto';
import type { RegisterResponseDto } from '../models/RegisterResponseDto';
import type { ResetPasswordRequestDto } from '../models/ResetPasswordRequestDto';
import type { VerifyEmailRequestDto } from '../models/VerifyEmailRequestDto';
import type { VerifyEmailResponseDto } from '../models/VerifyEmailResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import type { ApiRequestOptions } from '../core/ApiRequestOptions';
import { request as __request } from '../core/request';
export class AuthControllerService {
    /**
     * @param requestBody
     * @returns VerifyEmailResponseDto OK
     * @throws ApiError
     */
    public static verifyEmail(
        requestBody: VerifyEmailRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<VerifyEmailResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/api/auth/verify-email',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns string OK
     * @throws ApiError
     */
    public static resetPassword(
        requestBody: ResetPasswordRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<Record<string, string>> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/api/auth/reset-password',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns string OK
     * @throws ApiError
     */
    public static resendCode(
        requestBody: Record<string, string>,
     options?: Partial<ApiRequestOptions>): CancelablePromise<Record<string, string>> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/api/auth/resend-code',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns RegisterResponseDto OK
     * @throws ApiError
     */
    public static register(
        requestBody: RegisterRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<RegisterResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/api/auth/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns RefreshResponseDto OK
     * @throws ApiError
     */
    public static refresh(
        requestBody: RefreshRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<RefreshResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/api/auth/refresh-token',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns string OK
     * @throws ApiError
     */
    public static logout(
        requestBody: LogoutRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<Record<string, string>> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/api/auth/logout',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns string OK
     * @throws ApiError
     */
    public static logoutAll(
        requestBody: LogoutRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<Record<string, string>> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/api/auth/logout-all',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param sessionId
     * @param requestBody
     * @returns LoginResponseDto OK
     * @throws ApiError
     */
    public static login(
        sessionId: string,
        requestBody: LoginRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<LoginResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/api/auth/login',
            cookies: {
                'sessionId': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ForgotPasswordResponseDto OK
     * @throws ApiError
     */
    public static forgotPassword(
        requestBody: ForgotPasswordRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<ForgotPasswordResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/api/auth/forgot-password',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
