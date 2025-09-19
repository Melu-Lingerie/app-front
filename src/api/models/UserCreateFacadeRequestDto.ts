/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceInfoDto } from './DeviceInfoDto';
/**
 * Запрос на создание гостевого пользователя
 */
export type UserCreateFacadeRequestDto = {
    /**
     * Идентификатор клиентской сессии (если передаётся из клиента), формат UUID
     */
    sessionId?: string;
    /**
     * Информация об устройстве клиента
     */
    deviceInfo: DeviceInfoDto;
};

