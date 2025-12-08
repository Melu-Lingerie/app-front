import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect, useRef } from 'react';
import {selectUser, setAddresses, setUserData, removeAddressById, updateAddressById} from '@/store/userSlice';
import { selectAppInitialized } from '@/store/appSlice';
import { ru } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { UserManagementService } from '@/api/services/UserManagementService';
import {useNotifications} from '@/hooks/useNotifications.ts';
import {AddressManagementService} from '@/api';
import type {AppDispatch} from '@/store';
import {AddAddressModal} from '@/components/Modals';
import { AnimatePresence } from 'framer-motion';
import {SquarePen, X} from "lucide-react";

export const ProfileTab = () => {
    const user = useSelector(selectUser);
    const initialized = useSelector(selectAppInitialized);
    const dispatch = useDispatch<AppDispatch>();
    const { addNotification } = useNotifications();

    // Controlled fields
    const [lastName, setLastName] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [middleName, setMiddleName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>('');

    // Validation
    const [errors, setErrors] = useState<Record<string, string>>({});
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

    // Snapshot of initial values to detect changes
    const initialRef = useRef<{ lastName: string; firstName: string; middleName: string; email: string; phone: string; dobInput: string }>({
        lastName: '',
        firstName: '',
        middleName: '',
        email: '',
        phone: '',
        dobInput: ''
    });
    const initSetRef = useRef(false);
    const [loading, setLoading] = useState(false);

    const [addressesLoading, setAddressesLoading] = useState(false);
    const addressesLoadedRef = useRef(false);
    const [addAddressOpen, setAddAddressOpen] = useState(false);

    const [editAddressOpen, setEditAddressOpen] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<import('@/api/models/AddressFacadeResponseDto').AddressFacadeResponseDto | null>(null);

    const openEditAddress = (addr: import('@/api/models/AddressFacadeResponseDto').AddressFacadeResponseDto) => {
        setAddressToEdit(addr);
        setEditAddressOpen(true);
    };

    const closeEditAddress = () => {
        setEditAddressOpen(false);
        setAddressToEdit(null);
    };

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [addressIdToDelete, setAddressIdToDelete] = useState<number | null>(null);
    const [deletingAddress, setDeletingAddress] = useState(false);

    const openDeleteConfirm = (id?: number) => {
        if (!id) return;
        setAddressIdToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const closeDeleteConfirm = () => {
        setDeleteConfirmOpen(false);
        setAddressIdToDelete(null);
    };

    const handleDeleteAddress = async () => {
        if (!addressIdToDelete) return;
        setDeletingAddress(true);
        try {
            await AddressManagementService.deleteAddress(addressIdToDelete);
            dispatch(removeAddressById(addressIdToDelete));
            addNotification('Адрес удалён', 'success');
            closeDeleteConfirm();
        } catch (e) {
            addNotification('Не удалось удалить адрес', 'error');
        } finally {
            setDeletingAddress(false);
        }
    };

    const reloadAddresses = async () => {
        setAddressesLoading(true);
        try {
            const list = await AddressManagementService.getAllAddresses();
            dispatch(setAddresses(Array.isArray(list) ? list : []));
        } catch (e) {
            addNotification('Не удалось загрузить адреса', 'error');
        } finally {
            setAddressesLoading(false);
            addressesLoadedRef.current = true;
        }
    };

    const formatPhoneFromDigits = (digits: string) => {
        let formatted = '+7';
        if (digits.length <= 1) return '+7 ';
        if (digits.length > 1) formatted += ' (' + digits.substring(1, 4);
        if (digits.length >= 5) formatted += ') ' + digits.substring(4, 7);
        if (digits.length >= 8) formatted += '-' + digits.substring(7, 9);
        if (digits.length >= 10) formatted += '-' + digits.substring(9, 11);
        return formatted;
    };

    // Birthdate state
    const [dob, setDob] = useState<Date | undefined>(undefined);

    // Initialize form from user once when ready
    useEffect(() => {
        if (!initialized || initSetRef.current) return;

        const initLast = user?.lastName ?? '';
        const initFirst = user?.firstName ?? '';
        const initMiddle = user?.middleName ?? '';
        const initEmail = user?.email ?? '';

        let initPhone = '';
        if (user?.phoneNumber) {
            const digits = user.phoneNumber.replace(/\D/g, '');
            if (digits && digits[0] === '7') {
                initPhone = formatPhoneFromDigits(digits);
            }
        }

        let initDob: Date | undefined = undefined;
        if (user?.birthDate) {
            const parsed = new Date(user.birthDate);
            if (!isNaN(parsed.getTime())) initDob = parsed;
        }

        setLastName(initLast);
        setFirstName(initFirst);
        setMiddleName(initMiddle);
        setEmail(initEmail);
        setPhone(initPhone);
        setDob(initDob);

        const initDobInput = initDob ? new Intl.DateTimeFormat('ru-RU').format(initDob) : '';
        initialRef.current = {
            lastName: initLast,
            firstName: initFirst,
            middleName: initMiddle,
            email: initEmail,
            phone: initPhone,
            dobInput: initDobInput,
        };
        initSetRef.current = true;
    }, [initialized, user]);

    useEffect(() => {
        if (!initialized || addressesLoadedRef.current) return;
        reloadAddresses();
    }, [initialized]);
    const minDob = new Date(1940, 0, 1);
    const maxDob = new Date();
    const [dobOpen, setDobOpen] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState<Date | undefined>(undefined);
    const clampDate = (d: Date) => (d < minDob ? minDob : d > maxDob ? maxDob : d);
    const dobInputRef = useRef<HTMLInputElement | null>(null);

    const [dobInput, setDobInput] = useState<string>("");

    // синхронизируем строку инпута с выбранной датой
    useEffect(() => {
        setDobInput(dob ? new Intl.DateTimeFormat('ru-RU').format(dob) : '');
    }, [dob]);

    const parseRuDate = (value: string): Date | undefined => {
        const m = value.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (!m) return undefined;
        const [_, dd, mm, yyyy] = m;
        const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
        if (isNaN(d.getTime())) return undefined;
        if (d.getFullYear() !== Number(yyyy) || d.getMonth() !== Number(mm) - 1 || d.getDate() !== Number(dd)) return undefined;
        if (d < minDob || d > maxDob) return undefined;
        return d;
    };

    const normalizeDateInput = (raw: string) => {
        const digits = raw.replace(/[^0-9]/g, '').slice(0, 8); // ddmmyyyy
        if (digits.length <= 2) return digits;
        if (digits.length <= 4) return `${digits.slice(0,2)}.${digits.slice(2)}`;
        return `${digits.slice(0,2)}.${digits.slice(2,4)}.${digits.slice(4)}`;
    };

    const formatYMD = (d: Date) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const isDirty =
        lastName !== initialRef.current.lastName ||
        firstName !== initialRef.current.firstName ||
        middleName !== initialRef.current.middleName ||
        email !== initialRef.current.email ||
        phone !== initialRef.current.phone ||
        dobInput !== initialRef.current.dobInput;

    const handleSave = async () => {
        const newErrors: Record<string, string> = {};
        if (!lastName.trim()) newErrors.lastName = 'Введите фамилию';
        if (!firstName.trim()) newErrors.firstName = 'Введите имя';
        if (!emailRegex.test(email)) newErrors.email = 'Введите корректный e-mail';

        const phoneDigits = phone.replace(/\D/g, '');
        if (phone.trim() && phoneDigits.length !== 11) newErrors.phone = 'Введите корректный номер телефона';

        let parsedDob: Date | undefined = undefined;
        if (dobInput.trim()) {
            parsedDob = parseRuDate(dobInput);
            if (!parsedDob) {
                newErrors.birthDate = 'Введите дату в формате дд.мм.гггг в допустимом диапазоне';
            } else if (parsedDob < minDob || parsedDob > maxDob) {
                newErrors.birthDate = 'Дата вне допустимого диапазона';
            }
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        // Build request body
        const req: any = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
        };
        if (middleName.trim()) req.middleName = middleName.trim();
        if (phoneDigits) req.phoneNumber = `+${phoneDigits}`;
        if (parsedDob) req.birthDate = formatYMD(parsedDob);

        setLoading(true);
        try {
            const updated = await UserManagementService.updateCurrentUser(req);
            addNotification('Данные успешно обновлены', 'success');

            // Update store with fresh data from backend
            dispatch(setUserData({
                firstName: updated.firstName ?? firstName,
                middleName: updated.middleName ?? middleName,
                lastName: updated.lastName ?? lastName,
                email: updated.email ?? email,
                phoneNumber: updated.phoneNumber ?? (phoneDigits ? `+${phoneDigits}` : null),
                birthDate: updated.birthDate ?? (parsedDob ? formatYMD(parsedDob) : null),
            }));

            // Lock current values as initial snapshot so the Save button disables again
            initialRef.current = {
                lastName: lastName,
                firstName: firstName,
                middleName: middleName,
                email: email,
                phone: phone,
                dobInput: dobInput,
            };
        } catch {
            addNotification('Ошибка при обновлении данных', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Заголовок как в FavoriteTab, текст — Личная информация */}
            <h2 className="text-[24px] leading-[26px] uppercase font-semibold mb-[60px]">
                Личная информация
            </h2>

            {/* Первая строка: Фамилия, Имя, Отчество */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col">
                    <label className="text-[14px] leading-[18px] uppercase mb-[20px]">Фамилия</label>
                    {initialized && !loading ? (
                        <>
                        <input
                            className={`h-[56px] rounded-[8px] border px-4 ${errors.lastName ? 'border-red-400' : 'border-[#CCCCCC]'}`}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            name="lastName"
                            type="text"
                        />
                        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                        </>
                    ) : (
                        <div className="h-[56px] rounded-[8px] bg-[#F5F5F5] animate-pulse" />
                    )}
                </div>
                <div className="flex flex-col">
                    <label className="text-[14px] leading-[18px] uppercase mb-[20px]">Имя</label>
                    {initialized && !loading ? (
                        <>
                        <input
                            className={`h-[56px] rounded-[8px] border px-4 ${errors.firstName ? 'border-red-400' : 'border-[#CCCCCC]'}`}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            name="firstName"
                            type="text"
                        />
                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                        </>
                    ) : (
                        <div className="h-[56px] rounded-[8px] bg-[#F5F5F5] animate-pulse" />
                    )}
                </div>
                <div className="flex flex-col">
                    <label className="text-[14px] leading-[18px] uppercase mb-[20px]">Отчество</label>
                    {initialized && !loading ? (
                        <input
                            className="h-[56px] rounded-[8px] border border-[#CCCCCC] px-4"
                            value={middleName}
                            onChange={(e) => setMiddleName(e.target.value)}
                            name="middleName"
                            type="text"
                        />
                    ) : (
                        <div className="h-[56px] rounded-[8px] bg-[#F5F5F5] animate-pulse" />
                    )}
                </div>
            </div>

            {/* Вторая строка: Email, Телефон, Дата рождения */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="flex flex-col">
                    <label className="text-[14px] leading-[18px] uppercase mb-[20px]">Адрес электронной почты</label>
                    {initialized && !loading ? (
                        <>
                        <input
                            className={`h-[56px] rounded-[8px] border px-4 ${errors.email ? 'border-red-400' : 'border-[#CCCCCC]'} bg-[#F5F5F5] cursor-not-allowed`}
                            value={email}
                            name="email"
                            type="email"
                            readOnly
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </>
                    ) : (
                        <div className="h-[56px] rounded-[8px] bg-[#F5F5F5] animate-pulse" />
                    )}
                </div>
                <label className="block text-[14px] leading-[18px] uppercase mb-[20px]">
                    Номер телефона
                    {initialized && !loading ? (
                        <>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={phone}
                            onFocus={() => {
                                if (!phone) setPhone('+7 ');
                            }}
                            onChange={(e) => {
                                const input = e.target.value;
                                if (!input.startsWith('+7')) return; // сохраняем префикс
                                const digits = input.replace(/\D/g, '');
                                if (digits.length === 1) {
                                    setPhone('+7 ');
                                    return;
                                }
                                setPhone(formatPhoneFromDigits(digits));
                            }}
                            onBlur={() => {
                                const trimmed = phone.trim();
                                if (trimmed === '+7' || trimmed === '+7(' || trimmed === '+7 (') {
                                    setPhone('');
                                }
                            }}
                            placeholder="+7"
                            className={`mt-[20px] w-full h-[56px] border rounded px-4 text-[14px] leading-[18px] outline-none ${errors.phone ? 'border-red-400' : 'border-[#CCC]'}`}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                        )}
                        </>
                    ) : (
                        <div className="mt-[20px] h-[56px] rounded bg-[#F5F5F5] animate-pulse" />
                    )}
                </label>
                <label className="block text-[14px] leading-[18px] uppercase mb-[20px]">
                    Дата рождения
                    {initialized && !loading ? (
                        <div className="relative mt-[20px]">
                            <Popover
                                open={dobOpen}
                                onOpenChange={(open) => {
                                    setDobOpen(open);
                                    if (open) {
                                        setCalendarMonth(clampDate(parseRuDate(dobInput) ?? dob ?? new Date()));
                                    }
                                }}
                            >
                                <input
                                    ref={dobInputRef}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\\d{2}\\.\\d{2}\\.\\d{4}"
                                    placeholder="дд.мм.гггг"
                                    name="birthDate"
                                    value={dobInput}
                                    onChange={(e) => setDobInput(normalizeDateInput(e.target.value))}
                                    className={`w-full h-[56px] border rounded px-4 pr-11 text-[14px] leading-[18px] outline-none ${errors.birthDate ? 'border-red-400' : 'border-[#CCC]'}`}
                                />
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        aria-label="Открыть календарь"
                                        onMouseDown={(e) => e.preventDefault()} // не даём инпуту терять фокус
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 cursor-pointer"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-[#F8C6D7]">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent side="bottom" align="end" className="p-0 w-[250px]">
                                    <Calendar
                                        className="w-full"
                                        month={calendarMonth}
                                        onMonthChange={setCalendarMonth}
                                        mode="single"
                                        selected={dob}
                                        onSelect={(d) => {
                                            setDob(d);
                                            setDobOpen(false);
                                        }}
                                        autoFocus
                                        locale={ru}
                                        captionLayout="dropdown"
                                        disabled={(date) => date > maxDob || date < minDob}
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.birthDate && (
                              <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>
                            )}
                        </div>
                    ) : (
                        <div className="mt-[20px] h-[56px] rounded bg-[#F5F5F5] animate-pulse" />
                    )}
                </label>
            </div>


            {/* Адреса доставки */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {(addressesLoading || !initialized) && [1,2,3].map((i) => (
                    <div key={`addr-skel-${i}`} className="h-[98px] rounded bg-[#F5F5F5] animate-pulse" />
                ))}

                {!(addressesLoading || !initialized) && (user.addresses ?? []).map((addr, idx) => (
                    <div key={addr.id ?? idx} className="flex flex-col">
                        <div className="flex justify-between mb-5">
                            <p className="uppercase text-[14px] leading-[18px] font-medium">
                                Адрес: {addr.addressLabel}
                            </p>
                            <div>
                                <button
                                    type="button"
                                    className="cursor-pointer mr-2"
                                    onClick={() => openEditAddress(addr)}
                                    aria-label="Редактировать адрес"
                                >
                                    <SquarePen width={18} height={18} />
                                </button>
                                <button
                                    type="button"
                                    className="cursor-pointer"
                                    onClick={() => openDeleteConfirm(addr.id)}
                                    aria-label="Удалить адрес"
                                >
                                    <X width={18} height={18} />
                                </button>
                            </div>
                        </div>
                        <p className="text-[16px] leading-[18px] text-[#999999] font-medium">
                            {addr.streetAddress}
                        </p>
                        <p className="text-[16px] leading-[18px] text-[#999999] font-medium">
                            {addr.country}, {addr.city}
                        </p>
                        <p className="text-[16px] leading-[18px] text-[#999999] font-medium">
                            {addr.postalCode}
                        </p>
                    </div>
                ))}

                <div>
                    <button
                        type="button"
                        disabled={!initialized || loading || addressesLoading || deletingAddress}
                        onClick={() => setAddAddressOpen(true)}
                        className={`text-[16px] leading-[18px] underline ${initialized && !loading && !addressesLoading && !deletingAddress ? 'cursor-pointer transition-transform active:scale-95 active:opacity-90' : 'cursor-not-allowed opacity-50 pointer-events-none'}`}
                    >
                        Добавить адрес
                    </button>
                </div>
            </div>

            <div className="mt-[60px]">
                <button
                    type="button"
                    disabled={!initialized || !isDirty || loading || deletingAddress}
                    onClick={handleSave}
                    className={`w-[445px] h-[56px] border border-[#FFFBF5] rounded bg-[#F8C6D7] text-[14px] leading-[18px] uppercase ${initialized && isDirty && !loading && !deletingAddress ? 'cursor-pointer hover:shadow-md transition transition-transform active:scale-95 active:opacity-90' : 'cursor-not-allowed opacity-50 pointer-events-none'}`}
                >
                    Сохранить данные
                </button>
            </div>
            <AnimatePresence>
              {addAddressOpen && (
                <AddAddressModal
                  key="addAddressModal"
                  onClose={() => setAddAddressOpen(false)}
                  onSuccess={async () => {
                    setAddAddressOpen(false);
                    await reloadAddresses();
                  }}
                />
              )}

              {editAddressOpen && addressToEdit && (
                <AddAddressModal
                  key={`editAddressModal-${addressToEdit.id}`}
                  address={addressToEdit}
                  onClose={closeEditAddress}
                  onSuccess={(updated) => {
                    if (updated) {
                      dispatch(updateAddressById(updated));
                    }
                    closeEditAddress();
                  }}
                />
              )}

              {deleteConfirmOpen && (
                <div
                  key="deleteConfirmModal"
                  className="fixed inset-0 z-50 flex items-center justify-center"
                  role="dialog"
                  aria-modal="true"
                >
                  <div
                    className="absolute inset-0 bg-black/40"
                    onClick={closeDeleteConfirm}
                  />
                  <div className="relative w-[90%] max-w-[420px] rounded-[12px] bg-white p-6 shadow-lg">
                    <p className="text-[16px] leading-[22px] font-medium mb-6">
                      Вы уверены, что хотите удалить этот адрес?
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeDeleteConfirm}
                        className="h-[40px] px-4 rounded-[8px] border border-[#CCCCCC] text-[14px] leading-[18px] uppercase cursor-pointer"
                        disabled={deletingAddress}
                      >
                        Нет
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteAddress}
                        className="cursor-pointer h-[40px] px-4 rounded-[8px] bg-[#F8C6D7] text-[14px] leading-[18px] uppercase"
                        disabled={deletingAddress}
                      >
                        Да
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
        </div>
    );
};
