export interface Banner {
    id: number;
    title: string;
    url: string;
    mediaId?: number;
    mediaUrl?: string;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface BannerFormData {
    title: string;
    url: string;
    mediaId?: number;
    order?: number;
    isActive: boolean;
}
