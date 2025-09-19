/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Параметры устройства клиента
 */
export type DeviceInfoDto = {
    /**
     * Тип устройства клиента
     */
    deviceType: 'MOBILE' | 'DESKTOP' | 'TABLET';
    /**
     * IPv4-адрес клиента
     */
    ipAddress?: string;
    /**
     * Имя устройства
     */
    deviceName?: string;
    /**
     * Версия ОС
     */
    osVersion?: string;
    /**
     * Название браузера
     */
    browserName?: string;
    /**
     * Версия браузера
     */
    browserVersion?: string;
    /**
     * Ширина экрана в пикселях
     */
    screenWidth?: number;
    /**
     * Высота экрана в пикселях
     */
    screenHeight?: number;
    /**
     * Плотность экрана (DPR, device pixel ratio)
     */
    screenDensity?: number;
};

