import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Upload, Trash2 } from 'lucide-react';
import {
    AdminHeader,
    AdminButton,
    AdminInput,
    AdminSelect,
    AdminTextarea,
} from '../components';
import { useFormValidation, validators } from '../../../hooks/useFormValidation';
import type { ProductFormData, ProductType, ProductStatus } from './types';
import { mockCategories, mockCollections, mockProducts } from './mockData';

const productTypeOptions = [
    { value: 'bustier', label: 'Бюстгальтер' },
    { value: 'panties', label: 'Трусы' },
    { value: 'body', label: 'Боди' },
    { value: 'set', label: 'Комплект' },
];

const statusOptions = [
    { value: 'active', label: 'Активен' },
    { value: 'inactive', label: 'Неактивен' },
];

const defaultFormData: ProductFormData = {
    name: '',
    description: '',
    articleNumber: '',
    categoryId: 0,
    productType: 'panties',
    basePrice: 0,
    stockQuantity: 0,
    status: 'active',
    colors: [],
    sizes: [],
    mainPhotos: [],
    additionalPhotos: [],
    relatedProductIds: [],
    accessoryProductIds: [],
};

const validationRules = {
    name: [
        validators.required('Название товара обязательно'),
        validators.minLength(2, 'Минимум 2 символа'),
    ],
    articleNumber: [
        validators.required('Артикул обязателен'),
    ],
    categoryId: [
        {
            validate: (value: unknown) => Number(value) > 0,
            message: 'Выберите категорию',
        },
    ],
    basePrice: [
        validators.required('Укажите цену'),
        validators.positive('Цена должна быть положительной'),
    ],
    stockQuantity: [
        validators.min(0, 'Остаток не может быть отрицательным'),
    ],
};

export function ProductFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const existingProduct = isEditing
        ? mockProducts.find((p) => p.id === Number(id))
        : null;

    const [formData, setFormData] = useState<ProductFormData>(() => {
        if (existingProduct) {
            return {
                ...defaultFormData,
                name: existingProduct.name,
                description: existingProduct.description,
                articleNumber: existingProduct.articleNumber,
                categoryId: existingProduct.categoryId,
                collectionId: existingProduct.collectionId,
                productType: existingProduct.productType,
                basePrice: existingProduct.basePrice,
                promoPrice: existingProduct.promoPrice,
                stockQuantity: existingProduct.stockQuantity,
                status: existingProduct.status,
                material: existingProduct.material,
                careInstructions: existingProduct.careInstructions,
                metaTitle: existingProduct.metaTitle,
                metaDescription: existingProduct.metaDescription,
                metaKeywords: existingProduct.metaKeywords,
            };
        }
        return defaultFormData;
    });

    const [newColor, setNewColor] = useState('');
    const [newSize, setNewSize] = useState('');

    const {
        getFieldError,
        setFieldTouched,
        validateForm,
    } = useFormValidation(validationRules, formData);

    const updateField = <K extends keyof ProductFormData>(
        field: K,
        value: ProductFormData[K]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const addColor = () => {
        if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
            updateField('colors', [...formData.colors, newColor.trim()]);
            setNewColor('');
        }
    };

    const removeColor = (color: string) => {
        updateField(
            'colors',
            formData.colors.filter((c) => c !== color)
        );
    };

    const addSize = () => {
        if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
            updateField('sizes', [...formData.sizes, newSize.trim()]);
            setNewSize('');
        }
    };

    const removeSize = (size: string) => {
        updateField(
            'sizes',
            formData.sizes.filter((s) => s !== size)
        );
    };

    const handleSubmit = () => {
        if (!validateForm(formData)) {
            return;
        }
        console.log('Submit form:', formData);
        navigate('/admin/products');
    };

    return (
        <div>
            <AdminHeader
                title="Управление товарами"
                subtitle="Форма добавления / редактирования товара"
                actions={
                    <AdminButton
                        variant="ghost"
                        icon={<ArrowLeft size={18} />}
                        onClick={() => navigate('/admin/products')}
                    >
                        Назад
                    </AdminButton>
                }
            />

            <div className="space-y-8">
                {/* Основное */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Основное</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        <div className="col-span-1">
                            <AdminInput
                                label="Товар"
                                placeholder="Название товара"
                                value={formData.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                onBlur={() => setFieldTouched('name')}
                                error={getFieldError('name')}
                            />
                        </div>
                        <div className="col-span-1">
                            <AdminTextarea
                                label="Описание"
                                placeholder="Дайте описание товару"
                                value={formData.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="col-span-1">
                            <AdminInput
                                label="Артикул"
                                placeholder="Придумайте артикул"
                                value={formData.articleNumber}
                                onChange={(e) => updateField('articleNumber', e.target.value)}
                                onBlur={() => setFieldTouched('articleNumber')}
                                error={getFieldError('articleNumber')}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Автогенерация артикула
                            </p>
                        </div>
                        <div className="col-span-1">
                            <AdminSelect
                                label="Категория"
                                placeholder="Выберите категорию"
                                options={mockCategories.map((c) => ({
                                    value: String(c.id),
                                    label: c.name,
                                }))}
                                value={String(formData.categoryId)}
                                onChange={(e) =>
                                    updateField('categoryId', Number(e.target.value))
                                }
                                onBlur={() => setFieldTouched('categoryId')}
                                error={getFieldError('categoryId')}
                            />
                        </div>
                        <div className="col-span-1">
                            <AdminSelect
                                label="Коллекция"
                                placeholder="Выберите коллекцию"
                                options={mockCollections.map((c) => ({
                                    value: String(c.id),
                                    label: c.name,
                                }))}
                                value={String(formData.collectionId || '')}
                                onChange={(e) =>
                                    updateField(
                                        'collectionId',
                                        e.target.value ? Number(e.target.value) : undefined
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Тип модели
                        </label>
                        <div className="flex flex-wrap gap-4">
                            {productTypeOptions.map((option) => (
                                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="productType"
                                        value={option.value}
                                        checked={formData.productType === option.value}
                                        onChange={(e) =>
                                            updateField(
                                                'productType',
                                                e.target.value as ProductType
                                            )
                                        }
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
                        <AdminInput
                            label="Базовая цена"
                            type="number"
                            placeholder="Укажите цену товара"
                            value={formData.basePrice || ''}
                            onChange={(e) =>
                                updateField('basePrice', Number(e.target.value))
                            }
                            onBlur={() => setFieldTouched('basePrice')}
                            error={getFieldError('basePrice')}
                        />
                        <AdminInput
                            label="Акционная цена"
                            type="number"
                            placeholder="Укажите цену товара"
                            value={formData.promoPrice || ''}
                            onChange={(e) =>
                                updateField(
                                    'promoPrice',
                                    e.target.value ? Number(e.target.value) : undefined
                                )
                            }
                        />
                        <AdminInput
                            label="Остаток на складе"
                            type="number"
                            placeholder="250 шт"
                            value={formData.stockQuantity || ''}
                            onChange={(e) =>
                                updateField('stockQuantity', Number(e.target.value))
                            }
                            onBlur={() => setFieldTouched('stockQuantity')}
                            error={getFieldError('stockQuantity')}
                        />
                    </div>
                </section>

                {/* Атрибуты */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Атрибуты</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Размерная сетка
                            </label>
                            <AdminSelect
                                options={[
                                    { value: 'standard', label: 'Стандартная' },
                                    { value: 'plus', label: 'Plus Size' },
                                ]}
                                placeholder="Размерная сетка"
                            />
                            <a href="#" className="text-xs text-blue-600 dark:text-blue-400 mt-1 inline-block hover:underline">
                                Создать новую
                            </a>

                            {/* Sizes */}
                            <div className="mt-3">
                                <div className="flex gap-2 mb-2">
                                    <AdminInput
                                        placeholder="Размер"
                                        value={newSize}
                                        onChange={(e) => setNewSize(e.target.value)}
                                        className="flex-1"
                                    />
                                    <AdminButton
                                        variant="outline"
                                        size="sm"
                                        onClick={addSize}
                                    >
                                        <Plus size={16} />
                                    </AdminButton>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.sizes.map((size) => (
                                        <span
                                            key={size}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-gray-100"
                                        >
                                            {size}
                                            <button onClick={() => removeSize(size)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Цвета
                            </label>
                            <AdminSelect
                                options={[{ value: 'palette', label: 'Палитра цветов' }]}
                                placeholder="Палитра цветов"
                            />
                            <div className="mt-3">
                                <div className="flex gap-2 mb-2">
                                    <AdminInput
                                        placeholder="Введите название цвета"
                                        value={newColor}
                                        onChange={(e) => setNewColor(e.target.value)}
                                        className="flex-1"
                                    />
                                    <AdminButton
                                        variant="outline"
                                        size="sm"
                                        onClick={addColor}
                                    >
                                        <Plus size={16} />
                                    </AdminButton>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.colors.map((color) => (
                                        <span
                                            key={color}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-gray-100"
                                        >
                                            {color}
                                            <button onClick={() => removeColor(color)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <AdminTextarea
                                label="Состав"
                                placeholder="Укажите состав товара"
                                value={formData.material || ''}
                                onChange={(e) => updateField('material', e.target.value)}
                                rows={4}
                            />
                        </div>

                        <div>
                            <AdminTextarea
                                label="Уход"
                                placeholder="Опишите, как ухаживать за товаром"
                                value={formData.careInstructions || ''}
                                onChange={(e) =>
                                    updateField('careInstructions', e.target.value)
                                }
                                rows={4}
                            />
                        </div>
                    </div>
                </section>

                {/* Медиа */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Медиа</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Фото товара на странице</p>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Главные фотографии
                            </label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
                                    >
                                        <Upload size={20} className="text-gray-400 dark:text-gray-500" />
                                        <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center px-1">
                                            Загрузить
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Дополнительные фотографии
                            </label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
                                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                    <div
                                        key={i}
                                        className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
                                    >
                                        <Upload size={20} className="text-gray-400 dark:text-gray-500" />
                                        <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center px-1">
                                            Загрузить
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* SEO */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">SEO</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AdminInput
                            label="Мета-заголовок"
                            placeholder="Заголовок товара"
                            value={formData.metaTitle || ''}
                            onChange={(e) => updateField('metaTitle', e.target.value)}
                        />
                        <AdminInput
                            label="Мета-описание"
                            placeholder="Описание товара"
                            value={formData.metaDescription || ''}
                            onChange={(e) => updateField('metaDescription', e.target.value)}
                        />
                        <AdminTextarea
                            label="Ключевые слова"
                            placeholder="Укажите ключевые слова для товара"
                            value={formData.metaKeywords || ''}
                            onChange={(e) => updateField('metaKeywords', e.target.value)}
                            rows={3}
                        />
                    </div>
                </section>

                {/* Блок связанных элементов */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Блок связанных элементов</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Похожие товары
                            </label>
                            <AdminInput
                                placeholder="Поиск по названию, артикулу"
                                showSearchIcon
                            />
                            <div className="mt-2 space-y-2">
                                {['Название товара', 'Название товара', 'Название товара'].map(
                                    (name, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                                        >
                                            <span className="text-sm text-gray-900 dark:text-gray-100">{name}</span>
                                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Рекомендуемые аксессуары
                            </label>
                            <AdminInput
                                placeholder="Поиск по названию, артикулу"
                                showSearchIcon
                            />
                            <div className="mt-2 space-y-2">
                                {['Название товара', 'Название товара', 'Название товара'].map(
                                    (name, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                                        >
                                            <span className="text-sm text-gray-900 dark:text-gray-100">{name}</span>
                                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center gap-3 pb-8">
                    <AdminButton onClick={handleSubmit}>Сохранить</AdminButton>
                    <AdminButton variant="secondary" onClick={handleSubmit}>
                        Сохранить и добавить ещё
                    </AdminButton>
                    <AdminButton
                        variant="outline"
                        onClick={() => window.open(`/catalog/preview`, '_blank')}
                    >
                        Предпросмотр
                    </AdminButton>
                    <AdminSelect
                        options={statusOptions}
                        value={formData.status}
                        onChange={(e) =>
                            updateField('status', e.target.value as ProductStatus)
                        }
                        className="w-40"
                    />
                </div>
            </div>
        </div>
    );
}
