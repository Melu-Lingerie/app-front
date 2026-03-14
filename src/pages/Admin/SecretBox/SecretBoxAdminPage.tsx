import { useState, useEffect, useRef } from 'react';
import { Loader2, Plus, Upload, X } from 'lucide-react';
import {
    AdminHeader,
    AdminButton,
    AdminInput,
    AdminTextarea,
} from '../components';
import api from '@/axios/api';
import { MediaService } from '@/api';

type PlanStyle = { id?: number; name: string; sortOrder: number };
type PlanColor = { id?: number; name: string; hexCode: string; sortOrder: number };

type SecretBoxPlanForm = {
    id?: number;
    name: string;
    articleNumber: string;
    price: number;
    description: string;
    heroImageUrl: string;
    heroTitle: string;
    heroSubtitle: string;
    whatIncluded: string;
    paymentDeliveryInfo: string;
    isActive: boolean;
    styles: PlanStyle[];
    colors: PlanColor[];
};

const defaultForm: SecretBoxPlanForm = {
    name: '',
    articleNumber: '',
    price: 0,
    description: '',
    heroImageUrl: '',
    heroTitle: '',
    heroSubtitle: '',
    whatIncluded: '',
    paymentDeliveryInfo: '',
    isActive: true,
    styles: [],
    colors: [],
};

export function SecretBoxAdminPage() {
    const [plans, setPlans] = useState<SecretBoxPlanForm[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SecretBoxPlanForm | null>(null);
    const [uploadingHero, setUploadingHero] = useState(false);
    const heroInputRef = useRef<HTMLInputElement>(null);

    // New style/color inputs
    const [newStyleName, setNewStyleName] = useState('');
    const [newColorName, setNewColorName] = useState('');
    const [newColorHex, setNewColorHex] = useState('#F8C6D7');

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/secret-box/plans');
            setPlans(data);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    const handleEdit = (plan: SecretBoxPlanForm) => {
        setEditingPlan({ ...plan, styles: [...(plan.styles || [])], colors: [...(plan.colors || [])] });
    };

    const handleNew = () => {
        setEditingPlan({ ...defaultForm });
    };

    const handleHeroUpload = async (files: FileList | null) => {
        if (!files || !files[0] || !editingPlan) return;
        setUploadingHero(true);
        try {
            const response = await MediaService.uploadMedia(undefined, { file: files[0] });
            setEditingPlan({ ...editingPlan, heroImageUrl: response.url || '' });
        } catch {
            alert('Не удалось загрузить фото');
        } finally {
            setUploadingHero(false);
            if (heroInputRef.current) heroInputRef.current.value = '';
        }
    };

    const addStyle = () => {
        if (!newStyleName.trim() || !editingPlan) return;
        setEditingPlan({
            ...editingPlan,
            styles: [...editingPlan.styles, { name: newStyleName.trim(), sortOrder: editingPlan.styles.length }],
        });
        setNewStyleName('');
    };

    const removeStyle = (idx: number) => {
        if (!editingPlan) return;
        setEditingPlan({ ...editingPlan, styles: editingPlan.styles.filter((_, i) => i !== idx) });
    };

    const addColor = () => {
        if (!newColorName.trim() || !editingPlan) return;
        setEditingPlan({
            ...editingPlan,
            colors: [...editingPlan.colors, { name: newColorName.trim(), hexCode: newColorHex, sortOrder: editingPlan.colors.length }],
        });
        setNewColorName('');
    };

    const removeColor = (idx: number) => {
        if (!editingPlan) return;
        setEditingPlan({ ...editingPlan, colors: editingPlan.colors.filter((_, i) => i !== idx) });
    };

    const handleSave = async () => {
        if (!editingPlan) return;
        setSaving(true);
        try {
            if (editingPlan.id) {
                await api.put(`/admin/secret-box/plans/${editingPlan.id}`, editingPlan);
            } else {
                await api.post('/admin/secret-box/plans', editingPlan);
            }
            await loadPlans();
            setEditingPlan(null);
        } catch {
            alert('Не удалось сохранить');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    // Editing view
    if (editingPlan) {
        return (
            <div>
                <AdminHeader
                    title={editingPlan.id ? 'Редактирование Secret Box' : 'Новый Secret Box'}
                    actions={
                        <AdminButton variant="ghost" onClick={() => setEditingPlan(null)}>
                            Назад
                        </AdminButton>
                    }
                />

                <div className="space-y-6">
                    {/* Basic info */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold mb-4">Основное</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <AdminInput label="Название" value={editingPlan.name} onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })} />
                            <AdminInput label="Артикул" value={editingPlan.articleNumber} onChange={(e) => setEditingPlan({ ...editingPlan, articleNumber: e.target.value })} />
                            <AdminInput label="Цена" type="number" value={editingPlan.price || ''} onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })} />
                        </div>
                        <div className="mt-4">
                            <AdminTextarea label="Описание" rows={4} value={editingPlan.description} onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })} />
                        </div>
                    </section>

                    {/* Hero */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold mb-4">Баннер (Hero)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <AdminInput label="Заголовок баннера" value={editingPlan.heroTitle} onChange={(e) => setEditingPlan({ ...editingPlan, heroTitle: e.target.value })} />
                            <AdminInput label="Подзаголовок" value={editingPlan.heroSubtitle} onChange={(e) => setEditingPlan({ ...editingPlan, heroSubtitle: e.target.value })} />
                        </div>

                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Фото баннера</label>
                        <div className="flex items-start gap-4">
                            {editingPlan.heroImageUrl ? (
                                <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <img src={editingPlan.heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setEditingPlan({ ...editingPlan, heroImageUrl: '' })}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => heroInputRef.current?.click()}
                                    className="w-48 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400"
                                >
                                    {uploadingHero ? (
                                        <Loader2 size={24} className="text-gray-400 animate-spin" />
                                    ) : (
                                        <>
                                            <Upload size={24} className="text-gray-400" />
                                            <span className="text-xs text-gray-400 mt-1">Загрузить</span>
                                        </>
                                    )}
                                </div>
                            )}
                            <input ref={heroInputRef} type="file" accept="image/*" onChange={(e) => handleHeroUpload(e.target.files)} className="hidden" />
                        </div>
                    </section>

                    {/* Styles */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold mb-4">Стили ({editingPlan.styles.length})</h3>
                        <div className="flex gap-2 mb-3">
                            <AdminInput placeholder="Название стиля" value={newStyleName} onChange={(e) => setNewStyleName(e.target.value)} className="w-48" />
                            <AdminButton variant="outline" size="sm" icon={<Plus size={16} />} onClick={addStyle}>Добавить</AdminButton>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {editingPlan.styles.map((s, i) => (
                                <div key={i} className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                                    {s.name}
                                    <button onClick={() => removeStyle(i)} className="text-red-500 hover:text-red-600 ml-1"><X size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Colors */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold mb-4">Цветовые гаммы ({editingPlan.colors.length})</h3>
                        <div className="flex gap-2 mb-3 items-end">
                            <AdminInput placeholder="Название цвета" value={newColorName} onChange={(e) => setNewColorName(e.target.value)} className="w-40" />
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Цвет</label>
                                <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                            </div>
                            <AdminButton variant="outline" size="sm" icon={<Plus size={16} />} onClick={addColor}>Добавить</AdminButton>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {editingPlan.colors.map((c, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                                    <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: c.hexCode }} />
                                    {c.name}
                                    <button onClick={() => removeColor(i)} className="text-red-500 hover:text-red-600"><X size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Content texts */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold mb-4">Тексты для страницы</h3>
                        <div className="space-y-4">
                            <AdminTextarea label="Что входит в подписку" rows={4} value={editingPlan.whatIncluded} onChange={(e) => setEditingPlan({ ...editingPlan, whatIncluded: e.target.value })} />
                            <AdminTextarea label="Оплата и доставка" rows={4} value={editingPlan.paymentDeliveryInfo} onChange={(e) => setEditingPlan({ ...editingPlan, paymentDeliveryInfo: e.target.value })} />
                        </div>
                    </section>

                    {/* Save */}
                    <div className="flex gap-3 pb-8">
                        <AdminButton onClick={handleSave} disabled={saving}>
                            {saving ? 'Сохранение...' : 'Сохранить'}
                        </AdminButton>
                        <AdminButton variant="outline" onClick={() => setEditingPlan(null)}>Отмена</AdminButton>
                    </div>
                </div>
            </div>
        );
    }

    // List view
    return (
        <div>
            <AdminHeader
                title="Secret Box"
                subtitle="Управление планами подписки"
                actions={
                    <AdminButton icon={<Plus size={18} />} onClick={handleNew}>
                        Новый план
                    </AdminButton>
                }
            />

            <div className="space-y-4">
                {plans.length === 0 && (
                    <div className="text-center py-12 text-gray-500">Нет планов подписки</div>
                )}
                {plans.map((plan: any) => (
                    <div
                        key={plan.id}
                        onClick={() => handleEdit(plan)}
                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-400 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            {plan.heroImageUrl && (
                                <img src={plan.heroImageUrl} alt={plan.name} className="w-16 h-16 object-cover rounded" />
                            )}
                            <div>
                                <p className="font-medium">{plan.name}</p>
                                <p className="text-sm text-gray-500">{plan.articleNumber} — {plan.price?.toLocaleString()} ₽</p>
                            </div>
                        </div>
                        <span className={`text-sm px-2 py-1 rounded ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {plan.isActive ? 'Активен' : 'Неактивен'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
