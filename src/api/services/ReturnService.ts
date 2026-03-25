import { request as __request } from '../core/request';
import { OpenAPI } from '../core/OpenAPI';

export type CreateReturnRequest = {
    orderId: number;
    items: { orderItemId: number; quantity: number }[];
    reason: 'WRONG_SIZE' | 'WRONG_COLOR' | 'DEFECT' | 'NOT_AS_DESCRIBED' | 'OTHER';
    comment?: string;
};

export type CustomerReturnDto = {
    id: number;
    returnNumber: string;
    orderId: number;
    orderNumber?: string;
    status: string;
    reason: string;
    reasonDisplayName?: string;
    comment?: string;
    adminComment?: string;
    refundAmount?: number;
    cdekTrackingNumber?: string;
    createdAt: string;
};

export class ReturnService {

    public static async createReturn(request: CreateReturnRequest): Promise<CustomerReturnDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/returns',
            body: request,
        });
    }

    public static async getReturns(page: number = 0, size: number = 10): Promise<{
        content: CustomerReturnDto[];
        totalPages: number;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/returns',
            query: { page, size },
        });
    }

    public static async getReturn(id: number): Promise<CustomerReturnDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/returns/{id}',
            path: { id },
        });
    }
}
