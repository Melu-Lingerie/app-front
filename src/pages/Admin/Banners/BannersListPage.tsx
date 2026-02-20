import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, RefreshCw } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    AdminHeader,
    AdminButton,
    AdminBadge,
    AdminModal,
} from '../components';
import { AdminBannerService } from '@/api/services/AdminBannerService';
import type { BannerAdminResponseDto } from '@/api/services/AdminBannerService';

function SortableRow({
    banner,
    onEdit,
    onToggleActive,
    onDelete,
}: {
    banner: BannerAdminResponseDto;
    onEdit: (banner: BannerAdminResponseDto) => void;
    onToggleActive: (banner: BannerAdminResponseDto) => void;
    onDelete: (banner: BannerAdminResponseDto) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: banner.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
            onClick={() => onEdit(banner)}
        >
            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100" style={{ width: '60px' }}>
                <div className="flex items-center gap-2">
                    <button
                        className="touch-none cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        onClick={(e) => e.stopPropagation()}
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical size={16} className="text-gray-400" />
                    </button>
                    <span>{banner.order}</span>
                </div>
            </td>
            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100" style={{ width: '120px' }}>
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
            </td>
            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{banner.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{banner.url}</div>
                </div>
            </td>
            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                <AdminBadge variant={banner.isActive ? 'success' : 'warning'}>
                    {banner.isActive ? 'Активен' : 'Неактивен'}
                </AdminBadge>
            </td>
            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                {new Date(banner.updatedAt).toLocaleDateString('ru-RU')}
            </td>
            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100" style={{ width: '140px' }}>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(banner);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Редактировать"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleActive(banner);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title={banner.isActive ? 'Деактивировать' : 'Активировать'}
                    >
                        {banner.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(banner);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-red-500"
                        title="Удалить"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

export function BannersListPage() {
    const navigate = useNavigate();
    const [banners, setBanners] = useState<BannerAdminResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [bannerToDelete, setBannerToDelete] = useState<BannerAdminResponseDto | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor),
    );

    const fetchBanners = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await AdminBannerService.getAllBanners('MAIN');
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

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = banners.findIndex(b => b.id === active.id);
        const newIndex = banners.findIndex(b => b.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const previousBanners = banners;
        const reordered = arrayMove(banners, oldIndex, newIndex);
        setBanners(reordered);

        try {
            await AdminBannerService.reorderBanners({
                bannerIds: reordered.map(b => b.id),
            });
        } catch (err) {
            console.error('Error reordering banners:', err);
            setBanners(previousBanners);
            alert('Ошибка сохранения порядка');
        }
    };

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

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300" style={{ width: '60px' }}>#</th>
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
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        Загрузка...
                                    </td>
                                </tr>
                            ) : banners.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        Нет данных
                                    </td>
                                </tr>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={banners.map(b => b.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {banners.map((banner) => (
                                            <SortableRow
                                                key={banner.id}
                                                banner={banner}
                                                onEdit={(b) => navigate(`/admin/banners/${b.id}/edit`)}
                                                onToggleActive={handleToggleActive}
                                                onDelete={(b) => {
                                                    setBannerToDelete(b);
                                                    setDeleteModalOpen(true);
                                                }}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
