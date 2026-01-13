import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
    AdminHeader,
    AdminButton,
    AdminInput,
    AdminSelect,
} from '../components';
import { useFormValidation, validators } from '../../../hooks/useFormValidation';
import type { PromoCodeFormData, DiscountType } from './types';
import { AdminPromoCodeService } from '../../../api/services/AdminPromoCodeService';

const discountTypeOptions = [
    { value: 'PERCENTAGE', label: 'Процент (%)' },
    { value: 'FIXED', label: 'Фиксированная сумма (₽)' },
];

const defaultFormData: PromoCodeFormData = {
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minOrderAmount: undefined,
    maxDiscountAmount: undefined,
    maxUses: undefined,
    maxUsesPerUser: undefined,
    validFrom: '',
    validTo: '',
    isActive: true,
};

const validationRules = {
    code: [
        validators.required('Код промокода обязателен'),
        validators.minLength(3, 'Минимум 3 символа'),
    ],
    discountValue: [
        validators.required('Укажите размер скидки'),
        validators.positive('Скидка должна быть положительной'),
    ],
};

export function PromotionFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState<PromoCodeFormData>(defaultFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isEditing && id) {
            setIsLoading(true);
            AdminPromoCodeService.getPromoCode(Number(id))
                .then((promo) => {
                    setFormData({
                        code: promo.code,
                        description: promo.description || '',
                        discountType: promo.discountType,
                        discountValue: promo.discountValue,
                        minOrderAmount: promo.minOrderAmount || undefined,
                        maxDiscountAmount: promo.maxDiscountAmount || undefined,
                        maxUses: promo.maxUses || undefined,
                        maxUsesPerUser: promo.maxUsesPerUser || undefined,
                        validFrom: promo.validFrom ? promo.validFrom.split('T')[0] : '',
                        validTo: promo.validTo ? promo.validTo.split('T')[0] : '',
                        isActive: promo.isActive,
                    });
                })
                .catch((error) => {
                    console.error('Failed to load promo code:', error);
                    navigate('/admin/promotions');
                })
                .finally(() => setIsLoading(false));
        }
    }, [id, isEditing, navigate]);

    const {
        getFieldError,
        setFieldTouched,
        validateForm,
    } = useFormValidation(validationRules, formData);

    const updateField = <K extends keyof PromoCodeFormData>(
        field: K,
        value: PromoCodeFormData[K]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!validateForm(formData)) {
            return;
        }

        setIsSaving(true);
        try {
            const requestData = {
                ...formData,
                validFrom: formData.validFrom ? `${formData.validFrom}T00:00:00` : undefined,
                validTo: formData.validTo ? `${formData.validTo}T23:59:59` : undefined,
            };

            if (isEditing && id) {
                await AdminPromoCodeService.updatePromoCode(Number(id), requestData);
            } else {
                await AdminPromoCodeService.createPromoCode(requestData);
            }
            navigate('/admin/promotions');
        } catch (error) {
            console.error('Failed to save promo code:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Загрузка...</div>
            </div>
        );
    }

    return (
        <div>
            <AdminHeader
                title={isEditing ? 'Редактирование промокода' : 'Создание промокода'}
                subtitle={isEditing ? `Код: ${formData.code}` : 'Новый промокод'}
                actions={
                    <AdminButton
                        variant="ghost"
                        icon={<ArrowLeft size={18} />}
                        onClick={() => navigate('/admin/promotions')}
                    >
                        Назад
                    </AdminButton>
                }
            />

            <div className="space-y-6">
                {/* Основные настройки */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Основные настройки</h2>
                    <div className="grid grid-cols-4 gap-4">
                        <AdminInput
                            label="Код промокода"
                            placeholder="SUMMER2024"
                            value={formData.code}
                            onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                            onBlur={() => setFieldTouched('code')}
                            error={getFieldError('code')}
                            disabled={isEditing}
                        />
                        <AdminSelect
                            label="Тип скидки"
                            options={discountTypeOptions}
                            value={formData.discountType}
                            onChange={(e) => updateField('discountType', e.target.value as DiscountType)}
                        />
                        <AdminInput
                            label={formData.discountType === 'PERCENTAGE' ? 'Размер скидки (%)' : 'Размер скидки (₽)'}
                            type="number"
                            placeholder={formData.discountType === 'PERCENTAGE' ? '20' : '500'}
                            value={formData.discountValue || ''}
                            onChange={(e) => updateField('discountValue', Number(e.target.value))}
                            onBlur={() => setFieldTouched('discountValue')}
                            error={getFieldError('discountValue')}
                        />
                        <AdminInput
                            label="Мин. сумма заказа (₽)"
                            type="number"
                            placeholder="3000"
                            value={formData.minOrderAmount || ''}
                            onChange={(e) => updateField('minOrderAmount', e.target.value ? Number(e.target.value) : undefined)}
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-4">
                        <div className="col-span-2">
                            <AdminInput
                                label="Описание"
                                placeholder="Скидка на летнюю коллекцию"
                                value={formData.description || ''}
                                onChange={(e) => updateField('description', e.target.value)}
                            />
                        </div>
                        {formData.discountType === 'PERCENTAGE' && (
                            <AdminInput
                                label="Макс. скидка (₽)"
                                type="number"
                                placeholder="1000"
                                value={formData.maxDiscountAmount || ''}
                                onChange={(e) => updateField('maxDiscountAmount', e.target.value ? Number(e.target.value) : undefined)}
                            />
                        )}
                    </div>
                </section>

                {/* Лимиты и даты */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Лимиты и период действия</h2>
                    <div className="grid grid-cols-4 gap-4">
                        <AdminInput
                            label="Макс. использований (всего)"
                            type="number"
                            placeholder="1000"
                            value={formData.maxUses || ''}
                            onChange={(e) => updateField('maxUses', e.target.value ? Number(e.target.value) : undefined)}
                        />
                        <AdminInput
                            label="Макс. на пользователя"
                            type="number"
                            placeholder="1"
                            value={formData.maxUsesPerUser || ''}
                            onChange={(e) => updateField('maxUsesPerUser', e.target.value ? Number(e.target.value) : undefined)}
                        />
                        <AdminInput
                            label="Дата начала"
                            type="date"
                            value={formData.validFrom || ''}
                            onChange={(e) => updateField('validFrom', e.target.value)}
                        />
                        <AdminInput
                            label="Дата окончания"
                            type="date"
                            value={formData.validTo || ''}
                            onChange={(e) => updateField('validTo', e.target.value)}
                        />
                    </div>
                </section>

                {/* Footer Actions */}
                <div className="flex items-center gap-3 pb-8">
                    <AdminButton onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </AdminButton>
                    <AdminButton
                        variant="secondary"
                        onClick={() => navigate('/admin/promotions')}
                    >
                        Отмена
                    </AdminButton>
                </div>
            </div>
        </div>
    );
}
