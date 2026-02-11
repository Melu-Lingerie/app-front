import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
    AdminHeader,
    AdminButton,
    AdminInput,
    MediaUploader,
} from '../components';
import type { UploadedMedia } from '../components';
import { useFormValidation, validators } from '@/hooks/useFormValidation';
import type { BannerFormData } from './types';
import { useNotifications } from '@/hooks/useNotifications';
import { AdminBannerService } from '@/api/services/AdminBannerService';

const defaultFormData: BannerFormData = {
    title: '',
    url: '',
    isActive: true,
};

const validationRules = {
    title: [
        validators.required('Заголовок обязателен'),
        validators.maxLength(100, 'Максимум 100 символов'),
    ],
    url: [
        validators.required('URL обязателен'),
    ],
};

export function BannerFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { addNotification } = useNotifications();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState<BannerFormData>(defaultFormData);
    const [media, setMedia] = useState<UploadedMedia[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const {
        getFieldError,
        setFieldTouched,
        validateForm,
    } = useFormValidation(validationRules, formData);

    const fetchBanner = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            const banner = await AdminBannerService.getBanner(Number(id));
            setFormData({
                title: banner.title,
                url: banner.url,
                mediaId: banner.mediaId,
                order: banner.order,
                isActive: banner.isActive,
            });
            if (banner.mediaUrl && banner.mediaId) {
                setMedia([{ id: String(banner.mediaId), url: banner.mediaUrl }]);
            }
        } catch (error) {
            console.error('Error fetching banner:', error);
            addNotification('Ошибка загрузки баннера', 'error');
        } finally {
            setLoading(false);
        }
    }, [id, addNotification]);

    useEffect(() => {
        if (isEditing) {
            fetchBanner();
        }
    }, [isEditing, fetchBanner]);

    const updateField = <K extends keyof BannerFormData>(
        field: K,
        value: BannerFormData[K]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleMediaChange = (newMedia: UploadedMedia[]) => {
        setMedia(newMedia);
        if (newMedia.length > 0) {
            updateField('mediaId', Number(newMedia[0].id));
        } else {
            updateField('mediaId', undefined);
        }
    };

    const handleSubmit = async () => {
        if (!validateForm(formData)) {
            return;
        }

        try {
            setSaving(true);

            if (isEditing && id) {
                await AdminBannerService.updateBanner(Number(id), {
                    title: formData.title,
                    url: formData.url,
                    mediaId: formData.mediaId,
                    order: formData.order,
                    isActive: formData.isActive,
                });
                addNotification('Баннер обновлен', 'success');
            } else {
                await AdminBannerService.createBanner({
                    title: formData.title,
                    url: formData.url,
                    mediaId: formData.mediaId,
                    order: formData.order,
                    isActive: formData.isActive,
                });
                addNotification('Баннер создан', 'success');
            }

            navigate('/admin/banners');
        } catch (error) {
            console.error('Error saving banner:', error);
            addNotification('Ошибка сохранения баннера', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    return (
        <div>
            <AdminHeader
                title={isEditing ? 'Редактирование баннера' : 'Новый баннер'}
                subtitle="Баннер главной страницы"
                actions={
                    <AdminButton
                        variant="ghost"
                        icon={<ArrowLeft size={18} />}
                        onClick={() => navigate('/admin/banners')}
                    >
                        Назад
                    </AdminButton>
                }
            />

            <div className="space-y-6">
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Основная информация
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AdminInput
                            label="Заголовок"
                            placeholder="Введите заголовок баннера"
                            value={formData.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            onBlur={() => setFieldTouched('title')}
                            error={getFieldError('title')}
                        />

                        <AdminInput
                            label="URL ссылки"
                            placeholder="/catalog/collection"
                            value={formData.url}
                            onChange={(e) => updateField('url', e.target.value)}
                            onBlur={() => setFieldTouched('url')}
                            error={getFieldError('url')}
                        />
                    </div>

                    <div className="mt-6">
                        <MediaUploader
                            label="Изображение баннера"
                            value={media}
                            onChange={handleMediaChange}
                            maxFiles={1}
                            accept="image/*"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Рекомендуемый размер: 1920x800 пикселей
                        </p>
                    </div>

                    <div className="mt-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => updateField('isActive', e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 dark:border-gray-600"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Баннер активен
                            </span>
                        </label>
                    </div>
                </section>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center gap-3 pb-8">
                    <AdminButton onClick={handleSubmit} disabled={saving}>
                        {saving ? 'Сохранение...' : 'Сохранить'}
                    </AdminButton>
                    <AdminButton
                        variant="outline"
                        onClick={() => navigate('/admin/banners')}
                    >
                        Отмена
                    </AdminButton>
                </div>
            </div>
        </div>
    );
}
