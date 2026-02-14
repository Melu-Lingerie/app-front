import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { AdminHeader, AdminButton } from '../components';
import { AdminLoyaltyService } from '@/api/services/AdminLoyaltyService';
import type { LoyaltySettingResponse } from '@/api/models/LoyaltyDto';

export function LoyaltySettingsPage() {
    const navigate = useNavigate();
    const [settings, setSettings] = useState<LoyaltySettingResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editedValues, setEditedValues] = useState<Record<string, string>>({});
    const [savingKey, setSavingKey] = useState<string | null>(null);

    useEffect(() => {
        AdminLoyaltyService.getSettings()
            .then(setSettings)
            .finally(() => setIsLoading(false));
    }, []);

    const handleValueChange = (key: string, value: string) => {
        setEditedValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async (setting: LoyaltySettingResponse) => {
        const newValue = editedValues[setting.key];
        if (newValue === undefined || newValue === setting.value) return;

        setSavingKey(setting.key);
        try {
            const updated = await AdminLoyaltyService.updateSetting(setting.key, newValue);
            setSettings((prev) => prev.map((s) => (s.key === updated.key ? updated : s)));
            setEditedValues((prev) => {
                const next = { ...prev };
                delete next[setting.key];
                return next;
            });
        } finally {
            setSavingKey(null);
        }
    };

    return (
        <div>
            <AdminHeader
                title="Настройки лояльности"
                subtitle="Конфигурация программы крошек"
                actions={
                    <AdminButton
                        variant="ghost"
                        icon={<ArrowLeft size={18} />}
                        onClick={() => navigate('/admin/loyalty')}
                    >
                        Назад
                    </AdminButton>
                }
            />

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Ключ</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Описание</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400 w-48">Значение</th>
                                <th className="p-4 w-20"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {settings.map((setting) => {
                                const currentValue = editedValues[setting.key] ?? setting.value;
                                const isChanged = editedValues[setting.key] !== undefined && editedValues[setting.key] !== setting.value;
                                return (
                                    <tr
                                        key={setting.key}
                                        className="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                    >
                                        <td className="p-4">
                                            <span className="font-mono text-sm dark:text-white">{setting.key}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</span>
                                        </td>
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                value={currentValue}
                                                onChange={(e) => handleValueChange(setting.key, e.target.value)}
                                                className={`w-full px-3 py-1.5 text-sm border rounded transition-colors dark:bg-gray-700 dark:text-white ${
                                                    isChanged
                                                        ? 'border-blue-400 dark:border-blue-500'
                                                        : 'border-gray-200 dark:border-gray-600'
                                                }`}
                                            />
                                        </td>
                                        <td className="p-4">
                                            {isChanged && (
                                                <button
                                                    onClick={() => handleSave(setting)}
                                                    disabled={savingKey === setting.key}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50"
                                                >
                                                    <Save size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
