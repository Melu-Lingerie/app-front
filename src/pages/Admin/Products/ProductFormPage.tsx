import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Upload, Trash2, Loader2 } from 'lucide-react';
import {
    AdminHeader,
    AdminButton,
    AdminInput,
    AdminSelect,
    AdminTextarea,
} from '../components';
import { useFormValidation, validators } from '../../../hooks/useFormValidation';
import { AdminProductService } from '@/api/services/AdminProductService';
import { AdminCategoryService } from '@/api/services/AdminCategoryService';
import type { CategoryAdminResponseDto } from '@/api/services/AdminCategoryService';
import { MediaService } from '@/api';
import type { ProductAdminResponseDto, ProductStatus, ProductType } from '@/api/services/AdminProductService';

interface VariantFormData {
    id?: number;
    colorName: string;
    size: string;
    stockQuantity: number;
    isAvailable: boolean;
    price: number;
    sortOrder: number;
    mediaIds: number[];
    mediaUrls: string[];
}

interface FormData {
    name: string;
    description: string;
    articleNumber: string;
    categoryId: number;
    subcategoryId?: number;
    collectionId?: number;
    productType: ProductType;
    basePrice: number;
    promoPrice?: number;
    status: ProductStatus;
    material: string;
    careInstructions: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    mainMediaId?: number;
    mainMediaUrl?: string;
    variants: VariantFormData[];
}

const BRA_SIZES = ['70B', '75A', '75B', '75C', '80B', '80C'];

const productTypeOptions = [
    { value: 'STANDARD', label: 'Стандартный' },
    { value: 'SET', label: 'Комплект' },
];

const statusOptions = [
    { value: 'AVAILABLE', label: 'В наличии' },
    { value: 'NOT_AVAILABLE', label: 'Нет в наличии' },
    { value: 'NEW', label: 'Новинка' },
    { value: 'SOON', label: 'Скоро' },
];

const defaultFormData: FormData = {
    name: '',
    description: '',
    articleNumber: '',
    categoryId: 0,
    subcategoryId: undefined,
    productType: 'STANDARD',
    basePrice: 0,
    status: 'AVAILABLE',
    material: '',
    careInstructions: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    variants: [],
};

const validationRules = {
    name: [
        validators.required('Название товара обязательно'),
        validators.minLength(2, 'Минимум 2 символа'),
    ],
    articleNumber: [
        validators.required('Артикул обязателен'),
    ],
    basePrice: [
        validators.required('Укажите цену'),
        validators.positive('Цена должна быть положительной'),
    ],
    categoryId: [
        validators.positive('Выберите категорию'),
    ],
};

export function ProductFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState<FormData>(defaultFormData);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [categories, setCategories] = useState<CategoryAdminResponseDto[]>([]);

    // Determine if the selected category is a bra category
    const isBraCategory = (() => {
        const selected = categories.find((c) => c.id === formData.categoryId);
        if (selected?.name?.toLowerCase().includes('бра')) return true;
        if (formData.subcategoryId) {
            const sub = categories.find((c) => c.id === formData.subcategoryId);
            if (sub?.name?.toLowerCase().includes('бра')) return true;
        }
        return false;
    })();

    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

    const [newColor, setNewColor] = useState('');
    const [newSize, setNewSize] = useState('');
    const [uploadingMain, setUploadingMain] = useState(false);
    const [uploadingVariant, setUploadingVariant] = useState<number | null>(null);
    const mainPhotoInputRef = useRef<HTMLInputElement>(null);
    const variantPhotoInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

    // Load categories
    useEffect(() => {
        AdminCategoryService.getAllCategories()
            .then(setCategories)
            .catch((err) => console.error('Failed to load categories:', err));
    }, []);

    // Load product data when editing
    useEffect(() => {
        if (isEditing && id) {
            loadProduct(Number(id));
        }
    }, [id, isEditing]);

    const loadProduct = async (productId: number) => {
        setLoading(true);
        setError(null);
        try {
            const product = await AdminProductService.getProduct(productId);
            setFormData(mapProductToFormData(product));
        } catch (err) {
            console.error('Failed to load product:', err);
            setError('Не удалось загрузить товар');
        } finally {
            setLoading(false);
        }
    };

    const mapProductToFormData = (product: ProductAdminResponseDto): FormData => {
        // Determine if the product's category is a subcategory
        const productCategory = categories.find((c) => c.id === product.categoryId);
        const isSubcategory = productCategory?.parentId;

        return {
            name: product.name || '',
            description: product.description || '',
            articleNumber: product.articleNumber || '',
            categoryId: isSubcategory ? productCategory.parentId! : (product.categoryId || 0),
            subcategoryId: isSubcategory ? product.categoryId : undefined,
            collectionId: product.collectionId,
            productType: product.productType || 'STANDARD',
            basePrice: product.basePrice || 0,
            promoPrice: product.promoPrice,
            status: product.status || 'AVAILABLE',
            material: product.material || '',
            careInstructions: product.careInstructions || '',
            metaTitle: product.metaTitle || '',
            metaDescription: product.metaDescription || '',
            metaKeywords: product.metaKeywords || '',
            mainMediaId: product.mainMediaId,
            mainMediaUrl: product.mainMediaUrl,
            variants: product.variants?.map(v => ({
                id: v.id,
                colorName: v.colorName || '',
                size: v.size || '',
                stockQuantity: v.stockQuantity || 0,
                isAvailable: v.isAvailable ?? true,
                price: v.price || 0,
                sortOrder: v.sortOrder || 0,
                mediaIds: v.media?.map(m => m.mediaId) || [],
                mediaUrls: v.media?.map(m => m.mediaUrl).filter(Boolean) as string[] || [],
            })) || [],
        };
    };

    const {
        getFieldError,
        setFieldTouched,
        validateForm,
    } = useFormValidation(validationRules, formData);

    const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!validateForm(formData)) {
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const requestData = {
                name: formData.name,
                articleNumber: formData.articleNumber,
                description: formData.description || undefined,
                categoryId: formData.subcategoryId || formData.categoryId,
                collectionId: formData.collectionId,
                basePrice: formData.basePrice,
                promoPrice: formData.promoPrice,
                material: formData.material || undefined,
                careInstructions: formData.careInstructions || undefined,
                status: formData.status,
                productType: formData.productType,
                mainMediaId: formData.mainMediaId,
                metaTitle: formData.metaTitle || undefined,
                metaDescription: formData.metaDescription || undefined,
                metaKeywords: formData.metaKeywords || undefined,
                variants: formData.variants.map(v => ({
                    id: v.id,
                    colorName: v.colorName || undefined,
                    size: v.size || undefined,
                    stockQuantity: v.stockQuantity,
                    isAvailable: v.isAvailable,
                    price: v.price,
                    sortOrder: v.sortOrder,
                    mediaIds: v.mediaIds,
                })),
            };

            if (isEditing && id) {
                await AdminProductService.updateProduct(Number(id), requestData);
            } else {
                await AdminProductService.createProduct(requestData as any);
            }

            navigate('/admin/products');
        } catch (err) {
            console.error('Failed to save product:', err);
            setError('Не удалось сохранить товар');
        } finally {
            setSaving(false);
        }
    };

    // Variant management
    const addVariant = () => {
        const newVariant: VariantFormData = {
            colorName: newColor,
            size: newSize,
            stockQuantity: 0,
            isAvailable: true,
            price: formData.basePrice,
            sortOrder: formData.variants.length,
            mediaIds: [],
            mediaUrls: [],
        };
        updateField('variants', [...formData.variants, newVariant]);
        setNewColor('');
        setNewSize('');
    };

    const updateVariant = (index: number, updates: Partial<VariantFormData>) => {
        const newVariants = [...formData.variants];
        newVariants[index] = { ...newVariants[index], ...updates };
        updateField('variants', newVariants);
    };

    const removeVariant = (index: number) => {
        updateField('variants', formData.variants.filter((_, i) => i !== index));
    };

    const handleMainPhotoUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploadingMain(true);
        try {
            const response = await MediaService.uploadMedia(undefined, { file: files[0] });
            updateField('mainMediaId', response.mediaId);
            updateField('mainMediaUrl', response.url || '');
        } catch (err) {
            console.error('Upload error:', err);
            setError('Не удалось загрузить фото');
        } finally {
            setUploadingMain(false);
            if (mainPhotoInputRef.current) mainPhotoInputRef.current.value = '';
        }
    };

    const handleVariantPhotoUpload = async (variantIndex: number, files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploadingVariant(variantIndex);
        try {
            const uploaded: { id: number; url: string }[] = [];
            for (const file of Array.from(files)) {
                const response = await MediaService.uploadMedia(undefined, { file });
                uploaded.push({ id: response.mediaId!, url: response.url || '' });
            }
            const variant = formData.variants[variantIndex];
            updateVariant(variantIndex, {
                mediaIds: [...variant.mediaIds, ...uploaded.map((m) => m.id)],
                mediaUrls: [...variant.mediaUrls, ...uploaded.map((m) => m.url)],
            });
        } catch (err) {
            console.error('Upload error:', err);
            setError('Не удалось загрузить фото варианта');
        } finally {
            setUploadingVariant(null);
            const input = variantPhotoInputRefs.current[variantIndex];
            if (input) input.value = '';
        }
    };

    const removeVariantPhoto = (variantIndex: number, mediaIndex: number) => {
        const variant = formData.variants[variantIndex];
        updateVariant(variantIndex, {
            mediaIds: variant.mediaIds.filter((_, i) => i !== mediaIndex),
            mediaUrls: variant.mediaUrls.filter((_, i) => i !== mediaIndex),
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div>
            <AdminHeader
                title={isEditing ? 'Редактирование товара' : 'Новый товар'}
                subtitle={isEditing ? `ID: ${id}` : 'Заполните данные товара'}
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

            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
                    {error}
                </div>
            )}

            <div className="space-y-8">
                {/* Основное */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Основное</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <AdminInput
                            label="Название товара"
                            placeholder="Название товара"
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            onBlur={() => setFieldTouched('name')}
                            error={getFieldError('name')}
                        />
                        <AdminInput
                            label="Артикул"
                            placeholder="Артикул"
                            value={formData.articleNumber}
                            onChange={(e) => updateField('articleNumber', e.target.value)}
                            onBlur={() => setFieldTouched('articleNumber')}
                            error={getFieldError('articleNumber')}
                        />
                        <AdminSelect
                            label="Категория"
                            placeholder="Выберите категорию"
                            options={categories
                                .filter((c) => !c.parentId)
                                .map((c) => ({ value: String(c.id), label: c.name }))}
                            value={formData.categoryId ? String(formData.categoryId) : ''}
                            onChange={(e) => {
                                updateField('categoryId', Number(e.target.value));
                                updateField('subcategoryId', undefined);
                            }}
                            error={getFieldError('categoryId')}
                        />
                        {(() => {
                            const selectedParent = categories.find((c) => c.id === formData.categoryId);
                            const subcats = selectedParent?.children?.length
                                ? selectedParent.children
                                : categories.filter((c) => c.parentId === formData.categoryId);
                            if (subcats && subcats.length > 0) {
                                return (
                                    <AdminSelect
                                        label="Подкатегория"
                                        placeholder="Выберите подкатегорию"
                                        options={subcats.map((sc) => ({ value: String(sc.id), label: sc.name }))}
                                        value={formData.subcategoryId ? String(formData.subcategoryId) : ''}
                                        onChange={(e) => updateField('subcategoryId', Number(e.target.value))}
                                    />
                                );
                            }
                            return null;
                        })()}
                        <AdminSelect
                            label="Статус"
                            options={statusOptions}
                            value={formData.status}
                            onChange={(e) => updateField('status', e.target.value as ProductStatus)}
                        />
                    </div>

                    <div className="mt-4">
                        <AdminTextarea
                            label="Описание"
                            placeholder="Описание товара"
                            value={formData.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            rows={8}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <AdminInput
                            label="Базовая цена"
                            type="number"
                            placeholder="0"
                            value={formData.basePrice || ''}
                            onChange={(e) => updateField('basePrice', Number(e.target.value))}
                            onBlur={() => setFieldTouched('basePrice')}
                            error={getFieldError('basePrice')}
                        />
                        <AdminInput
                            label="Акционная цена"
                            type="number"
                            placeholder="0"
                            value={formData.promoPrice || ''}
                            onChange={(e) => updateField('promoPrice', e.target.value ? Number(e.target.value) : undefined)}
                        />
                        <AdminSelect
                            label="Тип товара"
                            options={productTypeOptions}
                            value={formData.productType}
                            onChange={(e) => updateField('productType', e.target.value as ProductType)}
                        />
                    </div>
                </section>

                {/* Медиа - Главное фото */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Главное фото</h2>
                    <div className="flex items-start gap-4">
                        {formData.mainMediaUrl ? (
                            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                <img
                                    src={formData.mainMediaUrl}
                                    alt="Главное фото"
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() => setLightboxUrl(formData.mainMediaUrl!)}
                                />
                                <button
                                    onClick={() => {
                                        updateField('mainMediaId', undefined);
                                        updateField('mainMediaUrl', undefined);
                                    }}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => mainPhotoInputRef.current?.click()}
                                className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
                            >
                                {uploadingMain ? (
                                    <Loader2 size={24} className="text-gray-400 animate-spin" />
                                ) : (
                                    <>
                                        <Upload size={24} className="text-gray-400 dark:text-gray-500" />
                                        <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">Загрузить</span>
                                    </>
                                )}
                            </div>
                        )}
                        <input
                            ref={mainPhotoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleMainPhotoUpload(e.target.files)}
                            className="hidden"
                        />
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            <p>Рекомендуемый размер: 800x800px</p>
                            <p>Формат: JPG, PNG, WebP</p>
                            {formData.mainMediaId && (
                                <p className="mt-2">Media ID: {formData.mainMediaId}</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Варианты товара */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Варианты товара ({formData.variants.length})
                    </h2>

                    {/* Add variant form */}
                    <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <AdminInput
                            placeholder="Цвет"
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            className="w-32"
                        />
                        {isBraCategory ? (
                            <AdminSelect
                                placeholder="Размер"
                                options={BRA_SIZES.map((s) => ({ value: s, label: s }))}
                                value={newSize}
                                onChange={(e) => setNewSize(e.target.value)}
                            />
                        ) : (
                            <AdminInput
                                placeholder="Размер"
                                value={newSize}
                                onChange={(e) => setNewSize(e.target.value)}
                                className="w-24"
                            />
                        )}
                        <AdminButton
                            variant="outline"
                            size="sm"
                            icon={<Plus size={16} />}
                            onClick={addVariant}
                        >
                            Добавить вариант
                        </AdminButton>
                    </div>

                    {/* Variants list */}
                    <div className="space-y-4">
                        {formData.variants.map((variant, index) => (
                            <div
                                key={variant.id || index}
                                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {variant.colorName || 'Без цвета'} / {variant.size || 'Без размера'}
                                    </span>
                                    <button
                                        onClick={() => removeVariant(index)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                                    <AdminInput
                                        label="Цвет"
                                        value={variant.colorName}
                                        onChange={(e) => updateVariant(index, { colorName: e.target.value })}
                                    />
                                    {isBraCategory ? (
                                        <AdminSelect
                                            label="Размер"
                                            placeholder="Размер"
                                            options={BRA_SIZES.map((s) => ({ value: s, label: s }))}
                                            value={variant.size}
                                            onChange={(e) => updateVariant(index, { size: e.target.value })}
                                        />
                                    ) : (
                                        <AdminInput
                                            label="Размер"
                                            value={variant.size}
                                            onChange={(e) => updateVariant(index, { size: e.target.value })}
                                        />
                                    )}
                                    <AdminInput
                                        label="Остаток"
                                        type="number"
                                        value={variant.stockQuantity}
                                        onChange={(e) => updateVariant(index, { stockQuantity: Number(e.target.value) })}
                                    />
                                    <AdminInput
                                        label="Цена"
                                        type="number"
                                        value={variant.price}
                                        onChange={(e) => updateVariant(index, { price: Number(e.target.value) })}
                                    />
                                </div>

                                {/* Variant photos */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Фото варианта ({variant.mediaUrls.length})
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {variant.mediaUrls.map((url, mediaIndex) => (
                                            <div
                                                key={mediaIndex}
                                                className="relative w-20 h-20 rounded-lg overflow-hidden group border border-gray-200 dark:border-gray-700"
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Фото ${mediaIndex + 1}`}
                                                    className="w-full h-full object-cover cursor-pointer"
                                                    onClick={() => setLightboxUrl(url)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariantPhoto(index, mediaIndex)}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <div
                                            onClick={() => variantPhotoInputRefs.current[index]?.click()}
                                            className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
                                        >
                                            {uploadingVariant === index ? (
                                                <Loader2 size={16} className="text-gray-400 animate-spin" />
                                            ) : (
                                                <>
                                                    <Upload size={16} className="text-gray-400 dark:text-gray-500" />
                                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Добавить</span>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            ref={(el) => { variantPhotoInputRefs.current[index] = el; }}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => handleVariantPhotoUpload(index, e.target.files)}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {formData.variants.length === 0 && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                Нет вариантов. Добавьте цвет и размер выше.
                            </div>
                        )}
                    </div>
                </section>

                {/* Атрибуты */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Атрибуты</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AdminTextarea
                            label="Состав / Материал"
                            placeholder="Укажите состав товара"
                            value={formData.material}
                            onChange={(e) => updateField('material', e.target.value)}
                            rows={3}
                        />
                        <AdminTextarea
                            label="Уход"
                            placeholder="Инструкции по уходу"
                            value={formData.careInstructions}
                            onChange={(e) => updateField('careInstructions', e.target.value)}
                            rows={3}
                        />
                    </div>
                </section>

                {/* SEO */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">SEO</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AdminInput
                            label="Мета-заголовок"
                            placeholder="Заголовок для поисковиков"
                            value={formData.metaTitle}
                            onChange={(e) => updateField('metaTitle', e.target.value)}
                        />
                        <AdminInput
                            label="Мета-описание"
                            placeholder="Описание для поисковиков"
                            value={formData.metaDescription}
                            onChange={(e) => updateField('metaDescription', e.target.value)}
                        />
                        <AdminInput
                            label="Ключевые слова"
                            placeholder="Через запятую"
                            value={formData.metaKeywords}
                            onChange={(e) => updateField('metaKeywords', e.target.value)}
                        />
                    </div>
                </section>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center gap-3 pb-8">
                    <AdminButton onClick={handleSubmit} disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 size={16} className="animate-spin mr-2" />
                                Сохранение...
                            </>
                        ) : (
                            'Сохранить'
                        )}
                    </AdminButton>
                    <AdminButton
                        variant="outline"
                        onClick={() => navigate('/admin/products')}
                    >
                        Отмена
                    </AdminButton>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
                    onClick={() => setLightboxUrl(null)}
                >
                    <button
                        onClick={() => setLightboxUrl(null)}
                        className="absolute top-4 right-4 p-2 text-white hover:text-gray-300"
                    >
                        <X size={28} />
                    </button>
                    <img
                        src={lightboxUrl}
                        alt="Увеличенное фото"
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
