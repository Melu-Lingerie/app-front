import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdminHeader, AdminButton, AdminInput, AdminSelect, AdminTextarea } from '../components';
import { AdminLoyaltyService } from '@/api/services/AdminLoyaltyService';
import type { LoyaltyTier } from '@/api/models/LoyaltyDto';

const TIER_OPTIONS = [
    { value: 'FIRST_SPOONFUL', label: 'First Spoonful' },
    { value: 'SWEET_MOMENT', label: 'Sweet Moment' },
    { value: 'SECRET_PLEASURE', label: 'Secret Pleasure' },
];

interface RewardFormData {
    name: string;
    description: string;
    imageUrl: string;
    crumbsCost: string;
    minTier: LoyaltyTier;
    stock: string;
    isActive: boolean;
}

const defaultForm: RewardFormData = {
    name: '',
    description: '',
    imageUrl: '',
    crumbsCost: '',
    minTier: 'FIRST_SPOONFUL',
    stock: '',
    isActive: true,
};

export function LoyaltyRewardFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [form, setForm] = useState<RewardFormData>(defaultForm);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isEditing && id) {
            setIsLoading(true);
            AdminLoyaltyService.getRewards()
                .then((rewards) => {
                    const reward = rewards.find((r) => r.id === Number(id));
                    if (reward) {
                        setForm({
                            name: reward.name,
                            description: reward.description ?? '',
                            imageUrl: reward.imageUrl ?? '',
                            crumbsCost: String(reward.crumbsCost),
                            minTier: reward.minTier,
                            stock: reward.stock !== null ? String(reward.stock) : '',
                            isActive: reward.isActive,
                        });
                    }
                })
                .finally(() => setIsLoading(false));
        }
    }, [id, isEditing]);

    const updateField = <K extends keyof RewardFormData>(key: K, value: RewardFormData[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        if (!form.name || !form.crumbsCost) return;

        setIsSaving(true);
        try {
            const payload = {
                name: form.name,
                description: form.description || undefined,
                imageUrl: form.imageUrl || undefined,
                crumbsCost: parseFloat(form.crumbsCost),
                minTier: form.minTier,
                stock: form.stock ? parseInt(form.stock, 10) : undefined,
                isActive: form.isActive,
            };

            if (isEditing && id) {
                await AdminLoyaltyService.updateReward(Number(id), payload);
            } else {
                await AdminLoyaltyService.createReward(payload);
            }
            navigate('/admin/loyalty/rewards');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div>
                <AdminHeader title="Загрузка..." subtitle="" />
                <div className="h-40 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
            </div>
        );
    }

    return (
        <div>
            <AdminHeader
                title={isEditing ? 'Редактировать награду' : 'Создать награду'}
                subtitle={isEditing ? `ID: ${id}` : 'Заполните данные'}
                actions={
                    <AdminButton
                        variant="ghost"
                        icon={<ArrowLeft size={18} />}
                        onClick={() => navigate('/admin/loyalty/rewards')}
                    >
                        Назад
                    </AdminButton>
                }
            />

            <div className="space-y-8">
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold dark:text-white mb-4">Основная информация</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <AdminInput
                            label="Название"
                            value={form.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            placeholder="Название награды"
                        />
                        <AdminInput
                            label="URL изображения"
                            value={form.imageUrl}
                            onChange={(e) => updateField('imageUrl', e.target.value)}
                            placeholder="https://..."
                        />
                        <AdminInput
                            label="Стоимость (крошки)"
                            type="number"
                            value={form.crumbsCost}
                            onChange={(e) => updateField('crumbsCost', e.target.value)}
                            placeholder="10"
                        />
                        <AdminSelect
                            label="Минимальный уровень"
                            options={TIER_OPTIONS}
                            value={form.minTier}
                            onChange={(e) => updateField('minTier', e.target.value as LoyaltyTier)}
                        />
                        <AdminInput
                            label="Остаток (пусто = безлимитно)"
                            type="number"
                            value={form.stock}
                            onChange={(e) => updateField('stock', e.target.value)}
                            placeholder="Безлимитно"
                        />
                        <div className="flex items-center gap-3 pt-6">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) => updateField('isActive', e.target.checked)}
                                className="w-4 h-4 accent-black dark:accent-white"
                                id="isActive"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium dark:text-white cursor-pointer">
                                Активна
                            </label>
                        </div>
                    </div>
                    <div className="mt-4">
                        <AdminTextarea
                            label="Описание"
                            value={form.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            placeholder="Описание награды"
                            rows={3}
                        />
                    </div>
                </section>

                <div className="flex items-center gap-3 pb-8">
                    <AdminButton onClick={handleSubmit} disabled={isSaving || !form.name || !form.crumbsCost}>
                        {isSaving ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Создать'}
                    </AdminButton>
                    <AdminButton variant="outline" onClick={() => navigate('/admin/loyalty/rewards')}>
                        Отмена
                    </AdminButton>
                </div>
            </div>
        </div>
    );
}
