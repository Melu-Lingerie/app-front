import api from '@/axios/api';

export type ChangePasswordRequestDto = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export class AuthApiService {
    static async changePassword(dto: ChangePasswordRequestDto): Promise<void> {
        await api.post('/auth/change-password', dto);
    }
}
