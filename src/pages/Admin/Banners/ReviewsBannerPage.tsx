import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';
import {
    AdminHeader,
    AdminButton,
    AdminBadge,
    AdminModal,
} from '../components';
import { AdminBannerService } from '@/api/services/AdminBannerService';
import type { BannerAdminResponseDto } from '@/api/services/AdminBannerService';

export function ReviewsBannerPage() {
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
            const data = await AdminBannerService.getAllBanners('REVIEWS');
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

    return (
        <div>
            <AdminHeader
                title="Баннеры страницы отзывов"
                subtitle="Hero-изображения для /reviews"
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
                            onClick={() => navigate('/admin/banners/new?placement=REVIEWS')}
                        >
                            Добавить баннер
                        </AdminButton>
                    </div>
                }
            />

            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
                    {error}
                    <button onClick={fetchBanners} className="ml-4 underline hover:no-underline">
                        Повторить
                    </button>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300" style={{ width: '120px' }}>Превью</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Заголовок</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Статус</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Обновлен</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300" style={{ width: '140px' }}>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        Загрузка...
                                    </td>
                                </tr>
                            ) : banners.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        Баннеров пока нет. Добавьте первый баннер для страницы отзывов.
                                    </td>
                                </tr>
                            ) : (
                                banners.map((banner) => (
                                    <tr
                                        key={banner.id}
                                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/admin/banners/${banner.id}/edit`)}
                                    >
                                        <td className="px-4 py-3 text-sm" style={{ width: '120px' }}>
                                            <div className="w-24 h-12 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                                                {banner.mediaUrl ? (
                                                    <img src={banner.mediaUrl} alt={banner.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                                                        Нет фото
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            <div className="font-medium">{banner.title}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <AdminBadge variant={banner.isActive ? 'success' : 'warning'}>
                                                {banner.isActive ? 'Активен' : 'Неактивен'}
                                            </AdminBadge>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {new Date(banner.updatedAt).toLocaleDateString('ru-RU')}
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ width: '140px' }}>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/admin/banners/${banner.id}/edit`); }}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Редактировать"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleActive(banner); }}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title={banner.isActive ? 'Деактивировать' : 'Активировать'}
                                                >
                                                    {banner.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setBannerToDelete(banner); setDeleteModalOpen(true); }}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-red-500"
                                                    title="Удалить"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AdminModal
                isOpen={deleteModalOpen}
                onClose={() => { setDeleteModalOpen(false); setBannerToDelete(null); }}
                title="Удалить баннер?"
            >
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        Вы уверены, что хотите удалить баннер "{bannerToDelete?.title}"?
                    </p>
                    <div className="flex justify-end gap-3">
                        <AdminButton variant="outline" onClick={() => { setDeleteModalOpen(false); setBannerToDelete(null); }}>
                            Отмена
                        </AdminButton>
                        <AdminButton variant="primary" onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                            Удалить
                        </AdminButton>
                    </div>
                </div>
            </AdminModal>
        </div>
    );
}
