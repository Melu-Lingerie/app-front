export type PresignUploadResponseDto = {
    presignedUrl: string;
    key: string;
    bucket: string;
    publicUrl: string;
};
