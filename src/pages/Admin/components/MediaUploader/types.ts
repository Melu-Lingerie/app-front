export interface UploadedMedia {
    id: string;
    url: string;
    file?: File;
}

export interface MediaUploaderProps {
    label?: string;
    value: UploadedMedia[];
    onChange: (media: UploadedMedia[]) => void;
    maxFiles?: number;
    accept?: string;
    disabled?: boolean;
    error?: string;
}

export interface MediaItemProps {
    media: UploadedMedia;
    onRemove: () => void;
    disabled?: boolean;
}
