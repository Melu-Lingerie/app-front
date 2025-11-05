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
import type { ResendCodeRequestDto } from '../models/ResendCodeRequestDto';
import type { ResendCodeResponseDto } from '../models/ResendCodeResponseDto';
import type { ResetPasswordRequestDto } from '../models/ResetPasswordRequestDto';
import type { VerifyEmailRequestDto } from '../models/VerifyEmailRequestDto';
import type { VerifyEmailResponseDto } from '../models/VerifyEmailResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import type { ApiRequestOptions } from '../core/ApiRequestOptions';
import { request as __request } from '../core/request';
export class Service {
    /**
     * Подтверждение email
     * Верификация email адреса с помощью кода, отправленного при регистрации
     * @param requestBody
     * @returns VerifyEmailResponseDto Email успешно подтвержден, пользователь активирован
     * @throws ApiError
     */
    public static verifyEmail(
        requestBody: VerifyEmailRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<VerifyEmailResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/auth/verify-email',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Неверный код или истек срок действия`,
            },
        });
    }
    /**
     * Установка нового пароля
     * Подтверждение сброса пароля с помощью кода и установка нового пароля
     * @param requestBody
     * @returns string Пароль успешно изменен
     * @throws ApiError
     */
    public static resetPassword(
        requestBody: ResetPasswordRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<Record<string, string>> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/auth/reset-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Неверный код или истек срок действия`,
            },
        });
    }
    /**
     * Повторная отправка кода подтверждения
     * Отправка нового кода подтверждения на email, если предыдущий код истек или был утерян
     * @param requestBody
     * @returns ResendCodeResponseDto Код успешно отправлен повторно
     * @throws ApiError
     */
    public static resendCode(
        requestBody: ResendCodeRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<ResendCodeResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/auth/resend-code',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Email не найден или уже подтвержден`,
            },
        });
    }
    /**
     * Регистрация нового пользователя
     * Создание нового аккаунта пользователя. После регистрации на email будет отправлен код подтверждения. Требуется sessionId в cookie.
     * @param sessionId ID сессии из cookie
     * @param requestBody
     * @returns RegisterResponseDto Код подтверждения отправлен на email
     * @throws ApiError
     */
    public static register(
        sessionId: string,
        requestBody: RegisterRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<RegisterResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/auth/register',
            cookies: {
                'sessionId': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Некорректные данные или email уже зарегистрирован`,
            },
        });
    }
    /**
     * Обновление access токена
     * Получение нового access токена с помощью refresh токена
     * @param requestBody
     * @returns RefreshResponseDto Токен успешно обновлен
     * @throws ApiError
     */
    public static refresh(
        requestBody: RefreshRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<RefreshResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/auth/refresh-token',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Невалидный refresh токен`,
            },
        });
    }
    /**
     * Выход из системы
     * Выход из системы на текущем устройстве. Удаляет refresh токен для текущей сессии.
     * @param requestBody
     * @returns string Успешный выход из системы
     * @throws ApiError
     */
    public static logout(
        requestBody: LogoutRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<Record<string, string>> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/auth/logout',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Невалидный refresh токен`,
            },
        });
    }
    /**
     * Выход из системы на всех устройствах
     * Выход из системы на всех устройствах пользователя. Удаляет все refresh токены.
     * @param requestBody
     * @returns string Успешный выход из системы на всех устройствах
     * @throws ApiError
     */
    public static logoutAll(
        requestBody: LogoutRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<Record<string, string>> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/auth/logout-all',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Невалидный refresh токен`,
            },
        });
    }
    /**
     * Вход в систему
     * Аутентификация пользователя по email и паролю. Возвращает токены и sessionId.
     * @param requestBody
     * @returns LoginResponseDto Успешная аутентификация
     * @throws ApiError
     */
    public static login(
        requestBody: LoginRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<LoginResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Неверные учетные данные`,
                401: `Не авторизован`,
            },
        });
    }
    /**
     * Запрос на сброс пароля
     * Инициирует процесс восстановления пароля. Отправляет код подтверждения на email.
     * @param requestBody
     * @returns ForgotPasswordResponseDto Код для сброса пароля отправлен на email
     * @throws ApiError
     */
    public static forgotPassword(
        requestBody: ForgotPasswordRequestDto,
     options?: Partial<ApiRequestOptions>): CancelablePromise<ForgotPasswordResponseDto> {
        return __request(OpenAPI, { ...options,
            method: 'POST',
            url: '/auth/forgot-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Пользователь с таким email не найден`,
            },
        });
    }
}
