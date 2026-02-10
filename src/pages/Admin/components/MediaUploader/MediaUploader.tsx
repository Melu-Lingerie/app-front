import { useCallback, useRef, useState } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { MediaService } from '@/api';
import type { MediaUploaderProps, UploadedMedia } from './types';

export function MediaUploader({
    label,
    value,
    onChange,
    maxFiles = 5,
    accept = 'image/*',
    disabled = false,
    error,
}: MediaUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleUpload = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0 || disabled) return;

        const remainingSlots = maxFiles - value.length;
        if (remainingSlots <= 0) {
            setUploadError(`Максимум ${maxFiles} файлов`);
            return;
        }

        const filesToUpload = Array.from(files).slice(0, remainingSlots);
        setUploading(true);
        setUploadError(null);

        try {
            const uploadedMedia: UploadedMedia[] = [];

            for (const file of filesToUpload) {
                // 1. Get presigned URL from backend
                const presign = await MediaService.presignUpload({
                    fileName: file.name,
                    contentType: file.type,
                    fileSize: file.size,
                });

                // 2. Upload file directly to S3
                const s3Response = await fetch(presign.presignedUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': file.type },
                    body: file,
                });

                if (!s3Response.ok) {
                    throw new Error(`S3 upload failed: ${s3Response.status}`);
                }

                // 3. Confirm upload to backend
                const response = await MediaService.confirmUpload({
                    key: presign.key,
                    bucket: presign.bucket,
                    fileName: file.name,
                    contentType: file.type,
                    fileSize: file.size,
                });

                uploadedMedia.push({
                    id: String(response.mediaId ?? ''),
                    url: response.url || presign.publicUrl || '',
                    file,
                });
            }

            onChange([...value, ...uploadedMedia]);
        } catch (err) {
            console.error('Upload error:', err);
            setUploadError('Ошибка при загрузке файла');
        } finally {
            setUploading(false);
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        }
    }, [disabled, maxFiles, onChange, value]);

    const handleRemove = useCallback((index: number) => {
        if (disabled) return;
        const newValue = [...value];
        newValue.splice(index, 1);
        onChange(newValue);
    }, [disabled, onChange, value]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (!disabled) {
            handleUpload(e.dataTransfer.files);
        }
    }, [disabled, handleUpload]);

    const handleClick = useCallback(() => {
        if (!disabled && inputRef.current) {
            inputRef.current.click();
        }
    }, [disabled]);

    const canAddMore = value.length < maxFiles;

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}

            <div className="flex flex-wrap gap-3">
                {/* Existing media items */}
                {value.map((media, index) => {
                    const isVideo = media.file?.type?.startsWith('video/') || media.url?.match(/\.(mp4|webm|ogg|mov)(\?|$)/i);
                    return (
                    <div
                        key={media.id}
                        className="relative w-20 h-20 rounded-lg overflow-hidden group border border-gray-200 dark:border-gray-700"
                    >
                        {isVideo ? (
                            <video
                                src={media.url}
                                muted
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={media.url}
                                alt={`Media ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        )}
                        {!disabled && (
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                    );
                })}

                {/* Upload button */}
                {canAddMore && (
                    <div
                        onClick={handleClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                            w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-gray-500'}
                            ${dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
                        `}
                    >
                        {uploading ? (
                            <Loader2 size={20} className="text-gray-400 animate-spin" />
                        ) : (
                            <>
                                <Upload size={20} className="text-gray-400 dark:text-gray-500" />
                                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center px-1">
                                    Загрузить
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={maxFiles > 1}
                onChange={(e) => handleUpload(e.target.files)}
                className="hidden"
                disabled={disabled}
            />

            {/* Error messages */}
            {(error || uploadError) && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle size={14} />
                    <span>{error || uploadError}</span>
                </div>
            )}

            {/* Info text */}
            <p className="text-xs text-gray-500 dark:text-gray-400">
                {value.length} из {maxFiles} файлов
            </p>
        </div>
    );
}
