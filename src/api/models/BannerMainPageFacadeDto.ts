/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Баннер на главной странице
 */
export type BannerMainPageFacadeDto = {
    /**
     * ID баннера
     */
    readonly id: number;
    /**
     * Заголовок баннера
     */
    title: string;
    /**
     * URL перехода по клику
     */
    url: string;
    /**
     * URL медиа (основное изображение баннера)
     */
    mediaUrl: string;
    /**
     * Порядок отображения (чем меньше — тем выше)
     */
    order: number;
};

