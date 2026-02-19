import { request } from '@/axios/request';

export interface MoySkladProductMapping {
    id: number;
    productId: number;
    productVariantId: number | null;
    moySkladProductId: string;
    moySkladVariantId: string | null;
    articleNumber: string;
    lastSyncAt: string;
    syncStatus: 'SYNCED' | 'PENDING' | 'ERROR';
}

export interface MoySkladOrderMapping {
    id: number;
    orderId: number;
    moySkladOrderId: string;
    orderNumber: string;
    lastSyncAt: string;
    syncStatus: 'SYNCED' | 'PENDING' | 'ERROR';
}

export class AdminMoySkladService {
    public static async syncStock(): Promise<void> {
        return request({ method: 'POST', url: '/api/v1/admin/moysklad/sync/stock' });
    }

    public static async syncProducts(): Promise<void> {
        return request({ method: 'POST', url: '/api/v1/admin/moysklad/sync/products' });
    }

    public static async syncProduct(productId: number): Promise<void> {
        return request({ method: 'POST', url: `/api/v1/admin/moysklad/sync/products/${productId}` });
    }

    public static async syncOrder(orderId: number): Promise<void> {
        return request({ method: 'POST', url: `/api/v1/admin/moysklad/sync/orders/${orderId}` });
    }

    public static async getMappings(): Promise<MoySkladProductMapping[]> {
        return request({ method: 'GET', url: '/api/v1/admin/moysklad/mappings' });
    }
}
