import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { AdminHeader, AdminButton, AdminTable, AdminBadge, AdminModal, AdminInput } from '../components';
import type { Column } from '../components';
import { AdminLoyaltyService } from '@/api/services/AdminLoyaltyService';
import type { TasteDayResponse } from '@/api/models/LoyaltyDto';

interface TasteDayForm {
    name: string;
    startDate: string;
    endDate: string;
    bonusPercent: string;
    isActive: boolean;
}

const defaultForm: TasteDayForm = {
    name: '',
    startDate: '',
    endDate: '',
    bonusPercent: '20',
    isActive: true,
};

export function TasteDaysPage() {
    const navigate = useNavigate();
    const [tasteDays, setTasteDays] = useState<TasteDayResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<TasteDayForm>(defaultForm);
    const [isSaving, setIsSaving] = useState(false);

    const fetchTasteDays = async () => {
        setIsLoading(true);
        try {
            const data = await AdminLoyaltyService.getTasteDays();
            setTasteDays(data);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasteDays();
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm(defaultForm);
        setShowModal(true);
    };

    const openEdit = (td: TasteDayResponse) => {
        setEditingId(td.id);
        setForm({
            name: td.name,
            startDate: td.startDate,
            endDate: td.endDate,
            bonusPercent: String(td.bonusPercent),
            isActive: td.isActive,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.startDate || !form.endDate) return;
        setIsSaving(true);
        try {
            const payload = {
                name: form.name,
                startDate: form.startDate,
                endDate: form.endDate,
                bonusPercent: parseFloat(form.bonusPercent),
                isActive: form.isActive,
            };
            if (editingId) {
                await AdminLoyaltyService.updateTasteDay(editingId, payload);
            } else {
                await AdminLoyaltyService.createTasteDay(payload);
            }
            setShowModal(false);
            fetchTasteDays();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить день вкуса?')) return;
        await AdminLoyaltyService.deleteTasteDay(id);
        fetchTasteDays();
    };

    const columns: Column<TasteDayResponse>[] = [
        {
            key: 'id',
            title: 'ID',
            width: '60px',
            render: (item) => <span className="text-gray-500">#{item.id}</span>,
        },
        {
            key: 'name',
            title: 'Название',
            render: (item) => <span className="font-medium dark:text-white">{item.name}</span>,
        },
        {
            key: 'startDate',
            title: 'Начало',
            render: (item) => <span>{new Date(item.startDate).toLocaleDateString('ru-RU')}</span>,
        },
        {
            key: 'endDate',
            title: 'Окончание',
            render: (item) => <span>{new Date(item.endDate).toLocaleDateString('ru-RU')}</span>,
        },
        {
            key: 'bonusPercent',
            title: 'Бонус %',
            render: (item) => <span>{item.bonusPercent}%</span>,
        },
        {
            key: 'isActive',
            title: 'Статус',
            render: (item) => (
                <AdminBadge variant={item.isActive ? 'success' : 'default'}>
                    {item.isActive ? 'Активен' : 'Неактивен'}
                </AdminBadge>
            ),
        },
        {
            key: 'actions',
            title: '',
            width: '100px',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openEdit(item);
                        }}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                        }}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <AdminHeader
                title="Дни вкуса"
                subtitle={`Всего: ${tasteDays.length}`}
                actions={
                    <div className="flex gap-2">
                        <AdminButton
                            variant="ghost"
                            icon={<ArrowLeft size={18} />}
                            onClick={() => navigate('/admin/loyalty')}
                        >
                            Назад
                        </AdminButton>
                        <AdminButton icon={<Plus size={18} />} onClick={openCreate}>
                            Создать
                        </AdminButton>
                    </div>
                }
            />

            <AdminTable
                columns={columns}
                data={tasteDays}
                getRowId={(item) => item.id}
                loading={isLoading}
            />

            {showModal && (
                <AdminModal
                    title={editingId ? 'Редактировать день вкуса' : 'Создать день вкуса'}
                    onClose={() => setShowModal(false)}
                >
                    <div className="space-y-4">
                        <AdminInput
                            label="Название"
                            value={form.name}
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Название"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <AdminInput
                                label="Дата начала"
                                type="date"
                                value={form.startDate}
                                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                            />
                            <AdminInput
                                label="Дата окончания"
                                type="date"
                                value={form.endDate}
                                onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                            />
                        </div>
                        <AdminInput
                            label="Бонус %"
                            type="number"
                            value={form.bonusPercent}
                            onChange={(e) => setForm((prev) => ({ ...prev, bonusPercent: e.target.value }))}
                        />
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                                className="w-4 h-4 accent-black dark:accent-white"
                                id="td-isActive"
                            />
                            <label htmlFor="td-isActive" className="text-sm font-medium dark:text-white cursor-pointer">
                                Активен
                            </label>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <AdminButton onClick={handleSave} disabled={isSaving || !form.name || !form.startDate || !form.endDate}>
                                {isSaving ? 'Сохранение...' : 'Сохранить'}
                            </AdminButton>
                            <AdminButton variant="outline" onClick={() => setShowModal(false)}>
                                Отмена
                            </AdminButton>
                        </div>
                    </div>
                </AdminModal>
            )}
        </div>
    );
}
