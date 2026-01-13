import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, RefreshCw } from 'lucide-react';
import {
    AdminHeader,
    AdminTable,
    AdminButton,
    AdminBadge,
    AdminModal,
} from '../components';
import type { Column } from '../components';
import { AdminBannerService } from '@/api/services/AdminBannerService';
import type { BannerAdminResponseDto } from '@/api/services/AdminBannerService';

export function BannersListPage() {
    const navigate = useNavigate();
    const [banners, setBanners] = useState<BannerAdminResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [bannerToDelete, setBannerToDelete] = useState<BannerAdminResponseDto | null>(null);

    const fetchBanners = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await AdminBannerService.getAllBanners();
            setBanners(data);
        } catch (err) {
            console.error('Error fetching banners:', err);
            setError('Не удалось загрузить баннеры');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBanners();
    }, [fetchBanners]);

    const handleDelete = async () => {
        if (!bannerToDelete) return;

        try {
            await AdminBannerService.deleteBanner(bannerToDelete.id);
            setBanners(banners.filter(b => b.id !== bannerToDelete.id));
        } catch (err) {
            console.error('Error deleting banner:', err);
            alert('Ошибка удаления баннера');
        } finally {
            setDeleteModalOpen(false);
            setBannerToDelete(null);
        }
    };

    const handleToggleActive = async (banner: BannerAdminResponseDto) => {
        try {
            await AdminBannerService.updateBanner(banner.id, { isActive: !banner.isActive });
            setBanners(banners.map(b =>
                b.id === banner.id ? { ...b, isActive: !b.isActive } : b
            ));
        } catch (err) {
            console.error('Error toggling banner:', err);
            alert('Ошибка изменения статуса');
        }
    };

    const columns: Column<BannerAdminResponseDto>[] = [
        {
            key: 'order',
            title: '#',
            width: '60px',
            render: (banner) => (
                <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-gray-400 cursor-grab" />
                    <span>{banner.order}</span>
                </div>
            ),
        },
        {
            key: 'preview',
            title: 'Превью',
            width: '120px',
            render: (banner) => (
                <div className="w-24 h-12 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                    {banner.mediaUrl ? (
                        <img
                            src={banner.mediaUrl}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                            Нет фото
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'title',
            title: 'Заголовок',
            sortable: true,
            render: (banner) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{banner.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{banner.url}</div>
                </div>
            ),
        },
        {
            key: 'isActive',
            title: 'Статус',
            render: (banner) => (
                <AdminBadge variant={banner.isActive ? 'success' : 'warning'}>
                    {banner.isActive ? 'Активен' : 'Неактивен'}
                </AdminBadge>
            ),
        },
        {
            key: 'updatedAt',
            title: 'Обновлен',
            render: (banner) => new Date(banner.updatedAt).toLocaleDateString('ru-RU'),
        },
        {
            key: 'actions',
            title: 'Действия',
            width: '140px',
            render: (banner) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/banners/${banner.id}/edit`);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Редактировать"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(banner);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title={banner.isActive ? 'Деактивировать' : 'Активировать'}
                    >
                        {banner.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setBannerToDelete(banner);
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
                title="Управление баннерами"
                subtitle="Баннеры главной страницы"
                actions={
                    <div className="flex gap-2">
                        <AdminButton
                            variant="outline"
                            icon={<RefreshCw size={18} />}
                            onClick={fetchBanners}
                        >
                            Обновить
                        </AdminButton>
                        <AdminButton
                            icon={<Plus size={18} />}
                            onClick={() => navigate('/admin/banners/new')}
                        >
                            Добавить баннер
                        </AdminButton>
                    </div>
                }
            />

            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
                    {error}
                    <button
                        onClick={fetchBanners}
                        className="ml-4 underline hover:no-underline"
                    >
                        Повторить
                    </button>
                </div>
            )}

            <AdminTable
                columns={columns}
                data={banners}
                getRowId={(banner) => banner.id}
                onRowClick={(banner) => navigate(`/admin/banners/${banner.id}/edit`)}
                loading={loading}
            />

            {/* Delete Confirmation Modal */}
            <AdminModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setBannerToDelete(null);
                }}
                title="Удалить баннер?"
            >
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        Вы уверены, что хотите удалить баннер "{bannerToDelete?.title}"?
                        Это действие нельзя отменить.
                    </p>
                    <div className="flex justify-end gap-3">
                        <AdminButton
                            variant="outline"
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setBannerToDelete(null);
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
