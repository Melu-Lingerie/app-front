import { useState, useEffect, useCallback } from 'react';
import { Trash2, RefreshCw, Film } from 'lucide-react';
import {
    AdminHeader,
    AdminTable,
    AdminButton,
    AdminBadge,
    AdminModal,
} from '../components';
import type { Column } from '../components';
import { AdminMediaService } from '@/api/services/AdminMediaService';
import type { MediaAdminResponseDto } from '@/api/services/AdminMediaService';

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

export function MediaListPage() {
    const [media, setMedia] = useState<MediaAdminResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<MediaAdminResponseDto | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchMedia = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await AdminMediaService.getAllMedia();
            setMedia(data);
        } catch (err) {
            console.error('Error fetching media:', err);
            setError('Не удалось загрузить медиафайлы');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const handleDelete = async () => {
        if (!itemToDelete) return;

        try {
            setDeleting(true);
            await AdminMediaService.deleteMedia(itemToDelete.id);
            setMedia(media.filter(m => m.id !== itemToDelete.id));
        } catch (err) {
            console.error('Error deleting media:', err);
            alert('Ошибка удаления');
        } finally {
            setDeleting(false);
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const columns: Column<MediaAdminResponseDto>[] = [
        {
            key: 'preview',
            title: 'Превью',
            width: '80px',
            render: (item) => (
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                    {item.mediaType === 'VIDEO' ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                            <Film size={20} className="text-gray-500 dark:text-gray-400" />
                        </div>
                    ) : (
                        <img
                            src={item.s3Url}
                            alt={item.fileName}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
            ),
        },
        {
            key: 'fileName',
            title: 'Имя файла',
            sortable: true,
            render: (item) => (
                <div className="max-w-[200px]">
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate" title={item.fileName}>
                        {item.fileName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.mimeType}</div>
                </div>
            ),
        },
        {
            key: 'mediaType',
            title: 'Тип',
            width: '100px',
            render: (item) => (
                <AdminBadge variant={item.mediaType === 'VIDEO' ? 'info' : 'default'}>
                    {item.mediaType === 'VIDEO' ? 'Видео' : 'Фото'}
                </AdminBadge>
            ),
        },
        {
            key: 'fileSize',
            title: 'Размер',
            width: '100px',
            render: (item) => (
                <span className="text-gray-600 dark:text-gray-400">
                    {formatFileSize(item.fileSize)}
                </span>
            ),
        },
        {
            key: 'isActive',
            title: 'Статус',
            width: '100px',
            render: (item) => (
                <AdminBadge variant={item.isActive ? 'success' : 'warning'}>
                    {item.isActive ? 'Активен' : 'Удалён'}
                </AdminBadge>
            ),
        },
        {
            key: 'createdAt',
            title: 'Дата загрузки',
            width: '120px',
            render: (item) => new Date(item.createdAt).toLocaleDateString('ru-RU'),
        },
        {
            key: 'actions',
            title: 'Действия',
            width: '80px',
            render: (item) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setItemToDelete(item);
                            setDeleteModalOpen(true);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-red-500"
                        title="Удалить"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <AdminHeader
                title="Управление медиафайлами"
                subtitle="Фото и видео в S3 хранилище"
                actions={
                    <AdminButton
                        variant="outline"
                        icon={<RefreshCw size={18} />}
                        onClick={fetchMedia}
                    >
                        Обновить
                    </AdminButton>
                }
            />

            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
                    {error}
                    <button
                        onClick={fetchMedia}
                        className="ml-4 underline hover:no-underline"
                    >
                        Повторить
                    </button>
                </div>
            )}

            <AdminTable
                columns={columns}
                data={media}
                getRowId={(item) => item.id}
                loading={loading}
            />

            <AdminModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setItemToDelete(null);
                }}
                title="Удалить медиафайл?"
            >
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        Вы уверены, что хотите удалить "{itemToDelete?.fileName}"?
                        Файл будет удалён из S3 хранилища. Это действие нельзя отменить.
                    </p>
                    <div className="flex justify-end gap-3">
                        <AdminButton
                            variant="outline"
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setItemToDelete(null);
                            }}
                        >
                            Отмена
                        </AdminButton>
                        <AdminButton
                            variant="primary"
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600"
                            disabled={deleting}
                        >
                            {deleting ? 'Удаление...' : 'Удалить'}
                        </AdminButton>
                    </div>
                </div>
            </AdminModal>
        </div>
    );
}
