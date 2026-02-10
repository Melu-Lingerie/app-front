import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
    AdminHeader,
    AdminButton,
    AdminInput,
    AdminTextarea,
    MediaUploader,
} from '../components';
import type { UploadedMedia } from '../components';
import { useFormValidation, validators } from '@/hooks/useFormValidation';
import { useNotifications } from '@/hooks/useNotifications';
import { AdminBackstageService } from '@/api/services/AdminBackstageService';

interface BackstageFormData {
    title: string;
    description: string;
    mediaId?: number;
    isActive: boolean;
}

const defaultFormData: BackstageFormData = {
    title: '',
    description: '',
    isActive: true,
};

const validationRules = {
    title: [
        validators.required('Заголовок обязателен'),
        validators.maxLength(200, 'Максимум 200 символов'),
    ],
};

export function BackstageFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { addNotification } = useNotifications();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState<BackstageFormData>(defaultFormData);
    const [media, setMedia] = useState<UploadedMedia[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const {
        getFieldError,
        setFieldTouched,
        validateForm,
    } = useFormValidation(validationRules, formData);

    const fetchBackstage = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            const backstage = await AdminBackstageService.getBackstage(Number(id));
            setFormData({
                title: backstage.title,
                description: backstage.description || '',
                mediaId: backstage.mediaId,
                isActive: backstage.isActive,
            });
            if (backstage.mediaUrl && backstage.mediaId) {
                setMedia([{ id: String(backstage.mediaId), url: backstage.mediaUrl }]);
            }
        } catch (error) {
            console.error('Error fetching backstage:', error);
            addNotification('Ошибка загрузки', 'error');
        } finally {
            setLoading(false);
        }
    }, [id, addNotification]);

    useEffect(() => {
        if (isEditing) {
            fetchBackstage();
        }
    }, [isEditing, fetchBackstage]);

    const updateField = <K extends keyof BackstageFormData>(
        field: K,
        value: BackstageFormData[K]
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
                await AdminBackstageService.updateBackstage(Number(id), {
                    title: formData.title,
                    description: formData.description || undefined,
                    mediaId: formData.mediaId,
                    isActive: formData.isActive,
                });
                addNotification('Бэкстейдж обновлён', 'success');
            } else {
                await AdminBackstageService.createBackstage({
                    title: formData.title,
                    description: formData.description || undefined,
                    mediaId: formData.mediaId,
                    isActive: formData.isActive,
                });
                addNotification('Бэкстейдж создан', 'success');
            }

            navigate('/admin/backstages');
        } catch (error) {
            console.error('Error saving backstage:', error);
            addNotification('Ошибка сохранения', 'error');
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
                title={isEditing ? 'Редактирование бэкстейджа' : 'Новый бэкстейдж'}
                subtitle="Фото или видео со съёмок"
                actions={
                    <AdminButton
                        variant="ghost"
                        icon={<ArrowLeft size={18} />}
                        onClick={() => navigate('/admin/backstages')}
                    >
                        Назад
                    </AdminButton>
                }
            />

            <div className="space-y-6">
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Основная информация
                    </h2>

                    <div className="space-y-4">
                        <AdminInput
                            label="Заголовок"
                            placeholder="Название бэкстейджа"
                            value={formData.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            onBlur={() => setFieldTouched('title')}
                            error={getFieldError('title')}
                        />

                        <AdminTextarea
                            label="Описание"
                            placeholder="Краткое описание (необязательно)"
                            value={formData.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="mt-6">
                        <MediaUploader
                            label="Фото или видео"
                            value={media}
                            onChange={handleMediaChange}
                            maxFiles={1}
                            accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Поддерживаемые форматы: JPG, PNG, WebP, MP4, WebM, MOV (до 50 МБ)
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
                                Активен (отображается на сайте)
                            </span>
                        </label>
                    </div>
                </section>

                <div className="flex flex-wrap items-center gap-3 pb-8">
                    <AdminButton onClick={handleSubmit} disabled={saving}>
                        {saving ? 'Сохранение...' : 'Сохранить'}
                    </AdminButton>
                    <AdminButton
                        variant="outline"
                        onClick={() => navigate('/admin/backstages')}
                    >
                        Отмена
                    </AdminButton>
                </div>
            </div>
        </div>
    );
}
