import api from '@/axios/api';

export type NotificationSettingsDto = {
    smsNewCollections: boolean;
    smsSale: boolean;
    smsPersonalOffers: boolean;
    smsDeliveryStatus: boolean;
    pushNewArrivals: boolean;
    pushSale: boolean;
    pushPersonalOffers: boolean;
    pushDeliveryStatus: boolean;
};

export class NotificationSettingsService {
    static async get(): Promise<NotificationSettingsDto> {
        const { data } = await api.get('/users/notification-settings');
        return data;
    }

    static async update(dto: NotificationSettingsDto): Promise<NotificationSettingsDto> {
        const { data } = await api.put('/users/notification-settings', dto);
        return data;
    }
}
