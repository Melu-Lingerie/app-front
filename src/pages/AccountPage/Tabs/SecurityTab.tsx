import { useState, useEffect, useRef, useCallback } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { AuthApiService } from '@/api/services/AuthApiService';
import { NotificationSettingsService, type NotificationSettingsDto } from '@/api/services/NotificationSettingsService';
import { Eye, EyeOff } from 'lucide-react';
import { selectAppInitialized } from '@/store/appSlice';
import { useSelector } from 'react-redux';

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-[44px] h-[24px] rounded-full transition-colors cursor-pointer ${
            checked ? 'bg-[#F8C6D7]' : 'bg-[#CCCCCC]'
        }`}
    >
        <span
            className={`absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white transition-transform shadow ${
                checked ? 'left-[22px]' : 'left-[2px]'
            }`}
        />
    </button>
);

const PasswordInput = ({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) => {
    const [visible, setVisible] = useState(false);
    return (
        <div className="mb-[20px]">
            <label className="block text-[14px] leading-[18px] uppercase mb-[8px]">{label}</label>
            <div className="relative">
                <input
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full h-[56px] rounded-[8px] border border-[#CCCCCC] px-4 pr-12 text-[14px] leading-[18px] outline-none focus:border-[#F8C6D7] transition-colors"
                />
                <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999999] cursor-pointer"
                >
                    {visible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
        </div>
    );
};

export const SecurityTab = () => {
    const initialized = useSelector(selectAppInitialized);
    const { addNotification } = useNotifications();

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Notification settings state
    const [settings, setSettings] = useState<NotificationSettingsDto | null>(null);
    const [settingsLoading, setSettingsLoading] = useState(true);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!initialized) return;
        NotificationSettingsService.get()
            .then(setSettings)
            .catch(() => {})
            .finally(() => setSettingsLoading(false));
    }, [initialized]);

    const saveSettings = useCallback((updated: NotificationSettingsDto) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                await NotificationSettingsService.update(updated);
            } catch {
                addNotification('Не удалось сохранить настройки', 'error');
            }
        }, 500);
    }, [addNotification]);

    const toggleSetting = (key: keyof NotificationSettingsDto) => {
        if (!settings) return;
        const updated = { ...settings, [key]: !settings[key] };
        setSettings(updated);
        saveSettings(updated);
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            addNotification('Заполните все поля', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            addNotification('Пароли не совпадают', 'error');
            return;
        }
        if (newPassword.length < 8) {
            addNotification('Пароль должен быть не менее 8 символов', 'error');
            return;
        }

        setPasswordLoading(true);
        try {
            await AuthApiService.changePassword({ currentPassword, newPassword, confirmPassword });
            addNotification('Пароль успешно изменен', 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (e: any) {
            const msg = e?.response?.data?.message || 'Не удалось изменить пароль';
            addNotification(msg, 'error');
        } finally {
            setPasswordLoading(false);
        }
    };

    if (!initialized) {
        return (
            <div>
                <h2 className="text-[24px] leading-[26px] uppercase font-semibold mb-[60px]">
                    Безопасность и уведомления
                </h2>
                <div className="flex gap-[60px]">
                    <div className="flex-1 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-[56px] bg-gray-200 animate-pulse rounded-[8px]" />
                        ))}
                    </div>
                    <div className="flex-1 space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-[24px] w-[200px] bg-gray-200 animate-pulse rounded" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const smsToggles: { key: keyof NotificationSettingsDto; label: string }[] = [
        { key: 'smsNewCollections', label: 'Новые коллекции' },
        { key: 'smsSale', label: 'Акции и скидки' },
        { key: 'smsPersonalOffers', label: 'Персональные предложения' },
        { key: 'smsDeliveryStatus', label: 'Статус доставки' },
    ];

    const pushToggles: { key: keyof NotificationSettingsDto; label: string }[] = [
        { key: 'pushNewArrivals', label: 'Новинки' },
        { key: 'pushSale', label: 'Акции и скидки' },
        { key: 'pushPersonalOffers', label: 'Персональные предложения' },
        { key: 'pushDeliveryStatus', label: 'Статус доставки' },
    ];

    return (
        <div>
            <h2 className="text-[24px] leading-[26px] uppercase font-semibold mb-[60px]">
                Безопасность и уведомления
            </h2>

            <div className="flex gap-[60px] flex-col lg:flex-row">
                {/* Left: Password */}
                <div className="flex-1">
                    <h3 className="text-[16px] leading-[18px] uppercase font-semibold mb-[30px]">Пароль</h3>

                    <PasswordInput
                        label="Текущий пароль"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        placeholder="Введите текущий пароль"
                    />
                    <PasswordInput
                        label="Новый пароль"
                        value={newPassword}
                        onChange={setNewPassword}
                        placeholder="Введите новый пароль"
                    />
                    <PasswordInput
                        label="Повторите новый пароль"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        placeholder="Повторите новый пароль"
                    />

                    <p className="text-[12px] leading-[16px] text-[#999999] mb-[20px]">
                        Пароль может содержать только латинские буквы, символы и цифры
                    </p>

                    <button
                        onClick={handleChangePassword}
                        disabled={passwordLoading}
                        className={`w-full h-[56px] rounded-[8px] border border-[#FFFBF5] bg-[#F8C6D7] text-[14px] leading-[18px] uppercase transition ${
                            passwordLoading
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-pointer hover:shadow-md active:scale-95 active:opacity-90'
                        }`}
                    >
                        {passwordLoading ? 'Сохранение...' : 'Сохранить пароль'}
                    </button>
                </div>

                {/* Right: Notifications */}
                <div className="flex-1">
                    <h3 className="text-[16px] leading-[18px] uppercase font-semibold mb-[30px]">Уведомления</h3>

                    {settingsLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-[24px] w-[250px] bg-gray-200 animate-pulse rounded" />
                            ))}
                        </div>
                    ) : settings ? (
                        <>
                            <h4 className="text-[14px] leading-[18px] uppercase text-[#999999] mb-[16px]">
                                СМС-оповещения
                            </h4>
                            <div className="space-y-[16px] mb-[30px]">
                                {smsToggles.map(({ key, label }) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <span className="text-[14px] leading-[18px]">{label}</span>
                                        <Toggle checked={settings[key]} onChange={() => toggleSetting(key)} />
                                    </div>
                                ))}
                            </div>

                            <h4 className="text-[14px] leading-[18px] uppercase text-[#999999] mb-[16px]">
                                Пуш-уведомления
                            </h4>
                            <div className="space-y-[16px]">
                                {pushToggles.map(({ key, label }) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <span className="text-[14px] leading-[18px]">{label}</span>
                                        <Toggle checked={settings[key]} onChange={() => toggleSetting(key)} />
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-[14px] text-[#999999]">Не удалось загрузить настройки</p>
                    )}
                </div>
            </div>
        </div>
    );
};
