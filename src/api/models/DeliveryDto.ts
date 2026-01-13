/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CalculateDeliveryRequestDto = {
    city: string;
    weight: number;
    length?: number;
    width?: number;
    height?: number;
};

export type TariffResponseDto = {
    tariffCode: number;
    tariffName: string;
    tariffDescription?: string;
    deliveryMode: string;
    deliverySum: number;
    periodMin: number;
    periodMax: number;
    calendarMin?: number;
    calendarMax?: number;
};

export type DeliveryPointResponseDto = {
    code: string;
    name: string;
    city: string;
    address: string;
    latitude: number;
    longitude: number;
    phone?: string;
    workTime?: string;
    type: 'PVZ' | 'POSTAMAT';
    haveCashless: boolean;
    haveCash: boolean;
    allowedCod: boolean;
    isDressingRoom: boolean;
    weightMin?: number;
    weightMax?: number;
};
