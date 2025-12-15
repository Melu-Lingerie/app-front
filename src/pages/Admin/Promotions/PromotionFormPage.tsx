import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import {
    AdminHeader,
    AdminButton,
    AdminInput,
    AdminSelect,
} from '../components';
import { useFormValidation, validators } from '../../../hooks/useFormValidation';
import type { PromotionFormData, PromotionType, DiscountType, PromotionScope, CustomerGroup, PromotionStatus } from './types';
import { mockPromotions, mockLoyaltySettings } from './mockData';

const typeOptions = [
    { value: 'internal', label: 'Внутренняя' },
    { value: 'for_client', label: 'Для клиента' },
];

const discountTypeOptions = [
    { value: 'percent', label: 'Процент (%)' },
    { value: 'fixed_amount', label: 'Фиксированная сумма' },
    { value: 'gift', label: 'Подарок' },
];

const scopeOptions = [
    { value: 'all_order', label: 'На весь заказ' },
    { value: 'categories', label: 'На определенные категории' },
    { value: 'products', label: 'На конкретные товары' },
];

const customerGroupOptions = [
    { value: 'all', label: 'Все клиенты' },
    { value: 'new_only', label: 'Только новые' },
];

const statusOptions = [
    { value: 'active', label: 'Активна' },
    { value: 'scheduled', label: 'Запланирована' },
    { value: 'paused', label: 'Приостановлена' },
];

const defaultFormData: PromotionFormData = {
    name: '',
    type: 'for_client',
    discountType: 'percent',
    discountValue: 0,
    scope: 'all_order',
    customerGroup: 'all',
    startDate: '',
    endDate: '',
    status: 'active',
    promoCodes: [],
};

const validationRules = {
    name: [
        validators.required('Название акции обязательно'),
        validators.minLength(2, 'Минимум 2 символа'),
    ],
    discountValue: [
        validators.required('Укажите размер скидки'),
        validators.positive('Скидка должна быть положительной'),
    ],
    startDate: [
        validators.required('Укажите дату начала'),
    ],
    endDate: [
        validators.required('Укажите дату окончания'),
    ],
};

export function PromotionFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const existingPromotion = isEditing
        ? mockPromotions.find((p) => p.id === Number(id))
        : null;

    const [formData, setFormData] = useState<PromotionFormData>(() => {
        if (existingPromotion) {
            return {
                ...defaultFormData,
                name: existingPromotion.name,
                type: existingPromotion.type,
                discountType: existingPromotion.discountType,
                discountValue: existingPromotion.discountValue,
                minOrderAmount: existingPromotion.minOrderAmount,
                scope: existingPromotion.scope,
                customerGroup: existingPromotion.customerGroup,
                usageLimitTotal: existingPromotion.usageLimitTotal,
                usageLimitPerCustomer: existingPromotion.usageLimitPerCustomer,
                startDate: existingPromotion.startDate,
                endDate: existingPromotion.endDate,
                status: existingPromotion.status,
            };
        }
        return defaultFormData;
    });

    const [loyaltySettings, setLoyaltySettings] = useState(mockLoyaltySettings);
    const [newPromoCode, setNewPromoCode] = useState('');

    const {
        getFieldError,
        setFieldTouched,
        validateForm,
    } = useFormValidation(validationRules, formData);

    const updateField = <K extends keyof PromotionFormData>(
        field: K,
        value: PromotionFormData[K]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const addPromoCode = () => {
        if (newPromoCode.trim()) {
            updateField('promoCodes', [
                ...formData.promoCodes,
                { code: newPromoCode.trim() },
            ]);
            setNewPromoCode('');
        }
    };

    const removePromoCode = (index: number) => {
        updateField(
            'promoCodes',
            formData.promoCodes.filter((_, i) => i !== index)
        );
    };

    const handleSubmit = () => {
        if (!validateForm(formData)) {
            return;
        }
        console.log('Submit form:', formData);
        console.log('Loyalty settings:', loyaltySettings);
        navigate('/admin/promotions');
    };

    return (
        <div>
            <AdminHeader
                title="Управление промо-акциями и скидками"
                subtitle="Форма создания / редактирования акции"
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

            <div className="space-y-8">
                {/* Основные настройки */}
                <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4">Основные настройки</h2>
                    <div className="grid grid-cols-4 gap-4">
                        <AdminInput
                            label="Название акции"
                            placeholder="Введите название"
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            onBlur={() => setFieldTouched('name')}
                            error={getFieldError('name')}
                        />
                        <AdminSelect
                            label="Тип скидки"
                            options={discountTypeOptions}
                            value={formData.discountType}
                            onChange={(e) =>
                                updateField('discountType', e.target.value as DiscountType)
                            }
                        />
                        <AdminInput
                            label="Размер скидки"
                            type="number"
                            placeholder="20%"
                            value={formData.discountValue || ''}
                            onChange={(e) =>
                                updateField('discountValue', Number(e.target.value))
                            }
                            onBlur={() => setFieldTouched('discountValue')}
                            error={getFieldError('discountValue')}
                        />
                        <AdminInput
                            label="Минимальная сумма заказа"
                            type="number"
                            placeholder="3 990 ₽"
                            value={formData.minOrderAmount || ''}
                            onChange={(e) =>
                                updateField(
                                    'minOrderAmount',
                                    e.target.value ? Number(e.target.value) : undefined
                                )
                            }
                        />
                    </div>
                </section>

                {/* Условия применения */}
                <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4">Условия применения</h2>
                    <div className="grid grid-cols-5 gap-4">
                        <AdminSelect
                            label="Область действия"
                            options={scopeOptions}
                            value={formData.scope}
                            onChange={(e) =>
                                updateField('scope', e.target.value as PromotionScope)
                            }
                        />
                        <AdminSelect
                            label="Группы клиентов"
                            options={customerGroupOptions}
                            value={formData.customerGroup}
                            onChange={(e) =>
                                updateField('customerGroup', e.target.value as CustomerGroup)
                            }
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Лимиты использования
                            </label>
                            <div className="space-y-2">
                                <AdminInput
                                    placeholder="В общем 1300 раз"
                                    type="number"
                                    value={formData.usageLimitTotal || ''}
                                    onChange={(e) =>
                                        updateField(
                                            'usageLimitTotal',
                                            e.target.value ? Number(e.target.value) : undefined
                                        )
                                    }
                                />
                                <AdminInput
                                    placeholder="На клиента 1 раз"
                                    type="number"
                                    value={formData.usageLimitPerCustomer || ''}
                                    onChange={(e) =>
                                        updateField(
                                            'usageLimitPerCustomer',
                                            e.target.value ? Number(e.target.value) : undefined
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Даты активности
                            </label>
                            <div className="flex items-center gap-2">
                                <AdminInput
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => updateField('startDate', e.target.value)}
                                    onBlur={() => setFieldTouched('startDate')}
                                    error={getFieldError('startDate')}
                                />
                                <span className="text-gray-400">→</span>
                                <AdminInput
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => updateField('endDate', e.target.value)}
                                    onBlur={() => setFieldTouched('endDate')}
                                    error={getFieldError('endDate')}
                                />
                            </div>
                        </div>
                        <AdminSelect
                            label="Статус"
                            options={statusOptions}
                            value={formData.status}
                            onChange={(e) =>
                                updateField('status', e.target.value as PromotionStatus)
                            }
                        />
                    </div>
                </section>

                {/* Промокоды */}
                <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4">Промокоды</h2>
                    <div className="grid grid-cols-5 gap-4">
                        <div>
                            <AdminInput
                                label="Код"
                                placeholder="Придумайте код"
                                value={newPromoCode}
                                onChange={(e) => setNewPromoCode(e.target.value)}
                            />
                        </div>
                        <div>
                            <AdminSelect
                                label="Привязка к акции"
                                options={[{ value: 'current', label: 'Акция из списка' }]}
                                placeholder="Акция из списка"
                            />
                            <AdminInput
                                placeholder="Поиск по названию акции"
                                showSearchIcon
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Лимиты использования
                            </label>
                            <div className="space-y-2">
                                <AdminInput placeholder="В общем 1300 раз" type="number" />
                                <AdminInput placeholder="На клиента 1 раз" type="number" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Даты активности
                            </label>
                            <div className="flex items-center gap-2">
                                <AdminInput type="date" />
                                <span className="text-gray-400">→</span>
                                <AdminInput type="date" />
                            </div>
                        </div>
                        <AdminSelect
                            label="Статус"
                            options={[
                                { value: 'active', label: 'Активна' },
                                { value: 'inactive', label: 'Неактивна' },
                            ]}
                        />
                    </div>

                    <div className="mt-4">
                        <AdminButton variant="secondary" onClick={addPromoCode}>
                            Добавить промокод
                        </AdminButton>
                    </div>

                    {/* Список добавленных промокодов */}
                    {formData.promoCodes.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {formData.promoCodes.map((promo, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                                >
                                    {promo.code}
                                    <button onClick={() => removePromoCode(index)}>
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </section>

                {/* Накопительная система */}
                <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        Накопительная система (Настройки правил)
                    </h2>
                    <div className="grid grid-cols-4 gap-4">
                        <AdminInput
                            label="Процент от суммы заказа"
                            placeholder="Придумайте код"
                            value={loyaltySettings.percentFromOrder}
                            onChange={(e) =>
                                setLoyaltySettings((prev) => ({
                                    ...prev,
                                    percentFromOrder: Number(e.target.value),
                                }))
                            }
                        />
                        <div>
                            <AdminSelect
                                label="Минимальная сумма"
                                options={[{ value: 'list', label: 'Акция из списка' }]}
                            />
                            <AdminInput
                                placeholder="Поиск по названию акции"
                                showSearchIcon
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Срок действия баллов
                            </label>
                            <div className="flex items-center gap-2">
                                <AdminInput
                                    type="date"
                                    value=""
                                    onChange={() => {}}
                                />
                                <span className="text-gray-400">→</span>
                                <AdminInput
                                    type="date"
                                    value=""
                                    onChange={() => {}}
                                />
                            </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-500">
                                Курс баллов к рублю (1 балл = X руб.)
                            </div>
                            <div className="font-medium">
                                1 балл = {loyaltySettings.pointsToRubleRate} руб.
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer Actions */}
                <div className="flex items-center gap-3 pb-8">
                    <AdminButton onClick={handleSubmit}>Сохранить</AdminButton>
                    <AdminButton variant="secondary" onClick={handleSubmit}>
                        Сохранить и добавить ещё
                    </AdminButton>
                </div>
            </div>
        </div>
    );
}
