import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, GripVertical } from 'lucide-react';
import {
    AdminHeader,
    AdminButton,
    AdminInput,
    AdminSelect,
} from '../components';
import api from '@/axios/api';

type MixMatchStep = {
    id?: number;
    stepOrder: number;
    title: string;
    subtitle: string;
    slug: string;
    categoryId: number;
    displayType: 'CAROUSEL' | 'GRID';
    isRequired: boolean;
    isActive: boolean;
};

type Category = { id: number; name: string };

const displayTypeOptions = [
    { value: 'CAROUSEL', label: 'Карусель' },
    { value: 'GRID', label: 'Сетка' },
];

export function MixMatchAdminPage() {
    const [steps, setSteps] = useState<MixMatchStep[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingStep, setEditingStep] = useState<MixMatchStep | null>(null);

    const loadSteps = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/mix-match/steps');
            setSteps(data);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        loadSteps();
        api.get('/admin/categories').then(res => setCategories(res.data)).catch(() => {});
    }, [loadSteps]);

    const handleNew = () => {
        setEditingStep({
            stepOrder: steps.length + 1,
            title: '',
            subtitle: '',
            slug: '',
            categoryId: 0,
            displayType: 'GRID',
            isRequired: true,
            isActive: true,
        });
    };

    const handleEdit = (step: MixMatchStep) => {
        setEditingStep({ ...step });
    };

    const handleDelete = async (stepId: number) => {
        if (!confirm('Удалить этот шаг?')) return;
        try {
            await api.delete(`/admin/mix-match/steps/${stepId}`);
            await loadSteps();
        } catch {
            alert('Не удалось удалить');
        }
    };

    const handleSave = async () => {
        if (!editingStep) return;
        setSaving(true);
        try {
            if (editingStep.id) {
                await api.put(`/admin/mix-match/steps/${editingStep.id}`, editingStep);
            } else {
                await api.post('/admin/mix-match/steps', editingStep);
            }
            await loadSteps();
            setEditingStep(null);
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
    if (editingStep) {
        return (
            <div>
                <AdminHeader
                    title={editingStep.id ? 'Редактирование шага' : 'Новый шаг'}
                    actions={<AdminButton variant="ghost" onClick={() => setEditingStep(null)}>Назад</AdminButton>}
                />

                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AdminInput label="Заголовок" value={editingStep.title} onChange={(e) => setEditingStep({ ...editingStep, title: e.target.value })} />
                        <AdminInput label="Подзаголовок" value={editingStep.subtitle} onChange={(e) => setEditingStep({ ...editingStep, subtitle: e.target.value })} />
                        <AdminInput label="Slug" placeholder="например: bra" value={editingStep.slug} onChange={(e) => setEditingStep({ ...editingStep, slug: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <AdminSelect
                            label="Категория"
                            placeholder="Выберите"
                            options={categories.map(c => ({ value: String(c.id), label: c.name }))}
                            value={editingStep.categoryId ? String(editingStep.categoryId) : ''}
                            onChange={(e) => setEditingStep({ ...editingStep, categoryId: Number(e.target.value) })}
                        />
                        <AdminSelect
                            label="Тип отображения"
                            options={displayTypeOptions}
                            value={editingStep.displayType}
                            onChange={(e) => setEditingStep({ ...editingStep, displayType: e.target.value as 'CAROUSEL' | 'GRID' })}
                        />
                        <AdminInput label="Порядок" type="number" value={editingStep.stepOrder} onChange={(e) => setEditingStep({ ...editingStep, stepOrder: Number(e.target.value) })} />
                        <div className="flex items-end gap-4 pb-1">
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                <input type="checkbox" checked={editingStep.isRequired} onChange={(e) => setEditingStep({ ...editingStep, isRequired: e.target.checked })} />
                                Обязательный
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                <input type="checkbox" checked={editingStep.isActive} onChange={(e) => setEditingStep({ ...editingStep, isActive: e.target.checked })} />
                                Активен
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <AdminButton onClick={handleSave} disabled={saving}>
                            {saving ? 'Сохранение...' : 'Сохранить'}
                        </AdminButton>
                        <AdminButton variant="outline" onClick={() => setEditingStep(null)}>Отмена</AdminButton>
                    </div>
                </section>
            </div>
        );
    }

    // List view
    return (
        <div>
            <AdminHeader
                title="Mix & Match"
                subtitle="Управление шагами конструктора"
                actions={
                    <AdminButton icon={<Plus size={18} />} onClick={handleNew}>
                        Новый шаг
                    </AdminButton>
                }
            />

            <div className="space-y-3">
                {steps.length === 0 && (
                    <div className="text-center py-12 text-gray-500">Нет шагов</div>
                )}
                {[...steps].sort((a, b) => a.stepOrder - b.stepOrder).map((step) => (
                    <div
                        key={step.id}
                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center gap-3">
                            <GripVertical size={16} className="text-gray-400" />
                            <div>
                                <p className="font-medium">{step.stepOrder}. {step.title}</p>
                                <p className="text-sm text-gray-500">
                                    slug: {step.slug} | {step.displayType} | {step.isRequired ? 'обязательный' : 'опциональный'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(step)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Pencil size={16} /></button>
                            <button onClick={() => step.id && handleDelete(step.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
