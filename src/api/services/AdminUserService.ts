import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

// Types
export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'DELETED';

export type AdminUserResponseDto = {
    id: number;
    email: string;
    phoneNumber?: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
};

export type PageAdminUserResponseDto = {
    content: AdminUserResponseDto[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
};

export type AdminUserRoleUpdateRequestDto = {
    role: UserRole;
};

export type AdminUserStatusUpdateRequestDto = {
    status: UserStatus;
};

export class AdminUserService {
    /**
     * Search users with filters
     */
    public static searchUsers(
        params: {
            email?: string;
            phoneNumber?: string;
            firstName?: string;
            lastName?: string;
            role?: UserRole;
            status?: UserStatus;
            page?: number;
            size?: number;
        } = {}
    ): CancelablePromise<PageAdminUserResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/users',
            query: {
                email: params.email,
                phoneNumber: params.phoneNumber,
                firstName: params.firstName,
                lastName: params.lastName,
                role: params.role,
                status: params.status,
                page: params.page ?? 0,
                size: params.size ?? 10,
            },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
            },
        });
    }

    /**
     * Get user by ID
     */
    public static getUser(userId: number): CancelablePromise<AdminUserResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/users/{userId}',
            path: { userId },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'User not found',
            },
        });
    }

    /**
     * Update user role
     */
    public static updateRole(
        userId: number,
        requestBody: AdminUserRoleUpdateRequestDto
    ): CancelablePromise<AdminUserResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/admin/users/{userId}/role',
            path: { userId },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: 'Invalid request',
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'User not found',
            },
        });
    }

    /**
     * Update user status
     */
    public static updateStatus(
        userId: number,
        requestBody: AdminUserStatusUpdateRequestDto
    ): CancelablePromise<AdminUserResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/admin/users/{userId}/status',
            path: { userId },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: 'Invalid request',
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'User not found',
            },
        });
    }

    /**
     * Force logout user (terminate all sessions)
     */
    public static forceLogout(userId: number): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/users/{userId}/logout',
            path: { userId },
            errors: {
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'User not found',
            },
        });
    }
}
