import { useState, useEffect } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { AdminButton } from '../components';
import { AdminMediaService, type MediaAdminResponseDto } from '@/api/services/AdminMediaService';

interface MediaPickerModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (selected: { mediaId: number; url: string }[]) => void;
    existingMediaIds: number[];
    productMedia: { mediaId: number; url: string }[];
}

type Tab = 'product' | 'gallery';

export function MediaPickerModal({
    open,
    onClose,
    onSelect,
    existingMediaIds,
    productMedia,
}: MediaPickerModalProps) {
    const [tab, setTab] = useState<Tab>(productMedia.length > 0 ? 'product' : 'gallery');
    const [galleryMedia, setGalleryMedia] = useState<MediaAdminResponseDto[]>([]);
    const [galleryLoading, setGalleryLoading] = useState(false);
    const [galleryPage, setGalleryPage] = useState(0);
    const [galleryTotalPages, setGalleryTotalPages] = useState(0);
    const [selected, setSelected] = useState<Map<number, string>>(new Map());

    useEffect(() => {
        if (open) {
            setSelected(new Map());
            setGalleryMedia([]);
            setGalleryPage(0);
            const initialTab = productMedia.length > 0 ? 'product' : 'gallery';
            setTab(initialTab);
            if (initialTab === 'gallery') {
                loadGallery(0);
            }
        }
    }, [open]);

    useEffect(() => {
        if (open && tab === 'gallery' && galleryMedia.length === 0) {
            loadGallery(0);
        }
    }, [tab]);

    const loadGallery = async (page: number) => {
        setGalleryLoading(true);
        try {
            const result = await AdminMediaService.getAllMedia(page, 20);
            setGalleryMedia(prev => page === 0 ? result.content : [...prev, ...result.content]);
            setGalleryPage(page);
            setGalleryTotalPages(result.totalPages);
        } catch (err) {
            console.error('Failed to load gallery:', err);
        } finally {
            setGalleryLoading(false);
        }
    };

    const toggleSelect = (mediaId: number, url: string) => {
        if (existingMediaIds.includes(mediaId)) return;
        const next = new Map(selected);
        if (next.has(mediaId)) {
            next.delete(mediaId);
        } else {
            next.set(mediaId, url);
        }
        setSelected(next);
    };

    const handleConfirm = () => {
        const items = Array.from(selected.entries()).map(([mediaId, url]) => ({ mediaId, url }));
        onSelect(items);
        onClose();
    };

    if (!open) return null;

    const filteredProductMedia = productMedia.filter(m => !existingMediaIds.includes(m.mediaId));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Выбрать фото
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    {filteredProductMedia.length > 0 && (
                        <button
                            className={`px-4 py-2 text-sm font-medium ${
                                tab === 'product'
                                    ? 'border-b-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setTab('product')}
                        >
                            Фото товара
                        </button>
                    )}
                    <button
                        className={`px-4 py-2 text-sm font-medium ${
                            tab === 'gallery'
                                ? 'border-b-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setTab('gallery')}
                    >
                        Все медиа
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {tab === 'product' && (
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                            {filteredProductMedia.map((m) => (
                                <MediaThumbnail
                                    key={m.mediaId}
                                    url={m.url}
                                    isSelected={selected.has(m.mediaId)}
                                    isDisabled={false}
                                    onClick={() => toggleSelect(m.mediaId, m.url)}
                                />
                            ))}
                            {filteredProductMedia.length === 0 && (
                                <p className="col-span-full text-center text-gray-400 py-8">
                                    Нет доступных фото от других вариантов
                                </p>
                            )}
                        </div>
                    )}

                    {tab === 'gallery' && (
                        <>
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                {galleryMedia
                                    .filter((m) => m.mimeType?.startsWith('image/'))
                                    .map((m) => (
                                        <MediaThumbnail
                                            key={m.id}
                                            url={m.s3Url}
                                            isSelected={selected.has(m.id)}
                                            isDisabled={existingMediaIds.includes(m.id)}
                                            onClick={() => toggleSelect(m.id, m.s3Url)}
                                        />
                                    ))}
                            </div>
                            {galleryLoading && (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                </div>
                            )}
                            {!galleryLoading && galleryPage < galleryTotalPages - 1 && (
                                <div className="flex justify-center mt-4">
                                    <AdminButton
                                        variant="outline"
                                        size="sm"
                                        onClick={() => loadGallery(galleryPage + 1)}
                                    >
                                        Загрузить ещё
                                    </AdminButton>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-500">
                        Выбрано: {selected.size}
                    </span>
                    <div className="flex gap-2">
                        <AdminButton variant="outline" onClick={onClose}>
                            Отмена
                        </AdminButton>
                        <AdminButton onClick={handleConfirm} disabled={selected.size === 0}>
                            Добавить
                        </AdminButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MediaThumbnail({
    url,
    isSelected,
    isDisabled,
    onClick,
}: {
    url: string;
    isSelected: boolean;
    isDisabled: boolean;
    onClick: () => void;
}) {
    return (
        <div
            onClick={isDisabled ? undefined : onClick}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                isDisabled
                    ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-gray-700'
                    : isSelected
                    ? 'border-blue-500 ring-2 ring-blue-200 cursor-pointer'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 cursor-pointer'
            }`}
        >
            <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
            {isSelected && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                </div>
            )}
            {isDisabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="text-[10px] text-white bg-black/50 px-1 rounded">добавлено</span>
                </div>
            )}
        </div>
    );
}
