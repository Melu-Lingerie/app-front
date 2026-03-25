import { request as __request } from '../core/request';
import { OpenAPI } from '../core/OpenAPI';

export type ReturnStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SHIPPED_BACK' | 'RECEIVED' | 'REFUNDED';
export type ReturnReason = 'WRONG_SIZE' | 'WRONG_COLOR' | 'DEFECT' | 'NOT_AS_DESCRIBED' | 'OTHER';

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
    WRONG_SIZE: 'Не подошёл размер',
    WRONG_COLOR: 'Не понравился цвет',
    DEFECT: 'Брак/дефект',
    NOT_AS_DESCRIBED: 'Не соответствует описанию',
    OTHER: 'Другое',
};

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
    PENDING: 'Ожидает',
    APPROVED: 'Одобрен',
    REJECTED: 'Отклонён',
    SHIPPED_BACK: 'В пути',
    RECEIVED: 'Получен',
    REFUNDED: 'Возвращены деньги',
};

export type ReturnItemResponseDto = {
    id: number;
    orderItemId: number;
    productName?: string;
    color?: string;
    size?: string;
    quantity: number;
    unitPrice?: number;
};

export type ReturnResponseDto = {
    id: number;
    returnNumber: string;
    orderId: number;
    orderNumber?: string;
    userId: number;
    status: ReturnStatus;
    reason: ReturnReason;
    reasonDisplayName?: string;
    comment?: string;
    adminComment?: string;
    refundAmount?: number;
    cdekTrackingNumber?: string;
    items: ReturnItemResponseDto[];
    createdAt: string;
    updatedAt: string;
};

export type ReturnListItemDto = {
    id: number;
    returnNumber: string;
    orderNumber?: string;
    customerName?: string;
    status: ReturnStatus;
    reason: ReturnReason;
    refundAmount?: number;
    createdAt: string;
};

export type PageReturnListItemDto = {
    content: ReturnListItemDto[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
};

export class AdminReturnService {

    public static async searchReturns(
        status?: ReturnStatus,
        page: number = 0,
        size: number = 20,
    ): Promise<PageReturnListItemDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/returns',
            query: {
                status,
                page,
                size,
            },
        });
    }

    public static async getReturn(id: number): Promise<ReturnResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/returns/{id}',
            path: { id },
        });
    }

    public static async approveReturn(id: number): Promise<ReturnResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/admin/returns/{id}/approve',
            path: { id },
        });
    }

    public static async rejectReturn(id: number, adminComment?: string): Promise<ReturnResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/admin/returns/{id}/reject',
            path: { id },
            body: adminComment,
        });
    }

    public static async receiveReturn(id: number): Promise<ReturnResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/admin/returns/{id}/receive',
            path: { id },
        });
    }

    public static async refundReturn(id: number): Promise<ReturnResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/admin/returns/{id}/refund',
            path: { id },
        });
    }
}
