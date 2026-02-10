import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, RefreshCw, Film } from 'lucide-react';
import {
    AdminHeader,
    AdminTable,
    AdminButton,
    AdminBadge,
    AdminModal,
} from '../components';
import type { Column } from '../components';
import { AdminBackstageService } from '@/api/services/AdminBackstageService';
import type { BackstageAdminResponseDto } from '@/api/services/AdminBackstageService';

export function BackstagesListPage() {
    const navigate = useNavigate();
    const [backstages, setBackstages] = useState<BackstageAdminResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<BackstageAdminResponseDto | null>(null);

    const fetchBackstages = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await AdminBackstageService.getAllBackstages();
            setBackstages(data);
        } catch (err) {
            console.error('Error fetching backstages:', err);
            setError('Не удалось загрузить бэкстейджи');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBackstages();
    }, [fetchBackstages]);

    const handleDelete = async () => {
        if (!itemToDelete) return;

        try {
            await AdminBackstageService.deleteBackstage(itemToDelete.id);
            setBackstages(backstages.filter(b => b.id !== itemToDelete.id));
        } catch (err) {
            console.error('Error deleting backstage:', err);
            alert('Ошибка удаления');
        } finally {
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handleToggleActive = async (item: BackstageAdminResponseDto) => {
        try {
            await AdminBackstageService.updateBackstage(item.id, { isActive: !item.isActive });
            setBackstages(backstages.map(b =>
                b.id === item.id ? { ...b, isActive: !b.isActive } : b
            ));
        } catch (err) {
            console.error('Error toggling backstage:', err);
            alert('Ошибка изменения статуса');
        }
    };

    const columns: Column<BackstageAdminResponseDto>[] = [
        {
            key: 'sortOrder',
            title: '#',
            width: '60px',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-gray-400 cursor-grab" />
                    <span>{item.sortOrder}</span>
                </div>
            ),
        },
        {
            key: 'preview',
            title: 'Превью',
            width: '120px',
            render: (item) => (
                <div className="w-24 h-16 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden relative">
                    {item.mediaUrl ? (
                        item.mediaType === 'VIDEO' ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                                <Film size={20} className="text-gray-500 dark:text-gray-400" />
                            </div>
                        ) : (
                            <img
                                src={item.mediaUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                        )
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                            Нет медиа
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'title',
            title: 'Заголовок',
            sortable: true,
            render: (item) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{item.title}</div>
                    {item.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{item.description}</div>
                    )}
                    {item.mediaType && (
                        <span className="text-[10px] text-gray-400 uppercase">{item.mediaType}</span>
                    )}
                </div>
            ),
        },
        {
            key: 'isActive',
            title: 'Статус',
            render: (item) => (
                <AdminBadge variant={item.isActive ? 'success' : 'warning'}>
                    {item.isActive ? 'Активен' : 'Неактивен'}
                </AdminBadge>
            ),
        },
        {
            key: 'updatedAt',
            title: 'Обновлен',
            render: (item) => new Date(item.updatedAt).toLocaleDateString('ru-RU'),
        },
        {
            key: 'actions',
            title: 'Действия',
            width: '140px',
            render: (item) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/backstages/${item.id}/edit`);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Редактировать"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(item);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title={item.isActive ? 'Деактивировать' : 'Активировать'}
                    >
                        {item.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
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
                title="Управление бэкстейджами"
                subtitle="Фото и видео со съёмок"
                actions={
                    <div className="flex gap-2">
                        <AdminButton
                            variant="outline"
                            icon={<RefreshCw size={18} />}
                            onClick={fetchBackstages}
                        >
                            Обновить
                        </AdminButton>
                        <AdminButton
                            icon={<Plus size={18} />}
                            onClick={() => navigate('/admin/backstages/new')}
                        >
                            Добавить
                        </AdminButton>
                    </div>
                }
            />

            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
                    {error}
                    <button
                        onClick={fetchBackstages}
                        className="ml-4 underline hover:no-underline"
                    >
                        Повторить
                    </button>
                </div>
            )}

            <AdminTable
                columns={columns}
                data={backstages}
                getRowId={(item) => item.id}
                onRowClick={(item) => navigate(`/admin/backstages/${item.id}/edit`)}
                loading={loading}
            />

            <AdminModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setItemToDelete(null);
                }}
                title="Удалить бэкстейдж?"
            >
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        Вы уверены, что хотите удалить "{itemToDelete?.title}"?
                        Это действие нельзя отменить.
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
                        >
                            Удалить
                        </AdminButton>
                    </div>
                </div>
            </AdminModal>
        </div>
    );
}
