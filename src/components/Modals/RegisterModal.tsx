import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectUserId } from '@/store/userSlice.ts';
import {Service} from '@/api';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
    onSwitchToVerify: (email: string, codeExpiresInMinutes: number) => void;
}

export const RegisterModal = ({ isOpen, onClose, onSwitchToLogin, onSwitchToVerify }: RegisterModalProps) => {
    const ignoreBlur = useRef(false);
    const [lastName, setLastName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [email, setEmail] = useState('');
    const [emailConfirm, setEmailConfirm] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const userId = useSelector(selectUserId);

    const lastNameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    // Обработка Enter и Tab при открытой модалке
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            // ENTER
            if (
                e.key === 'Enter'
            ) {
                // Проверяем валидность и загрузку
                if (isValid() && !loading) {
                    // prevent double submit
                    e.preventDefault();
                    // Вызвать submit через форму, чтобы сработал preventDefault и валидация
                    formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
            }
            // TAB (циклический фокус по input)
            if (e.key === 'Tab' && formRef.current) {
                const inputs = Array.from(formRef.current.querySelectorAll('input:not([disabled])'));
                if (!inputs.length) return;
                const active = document.activeElement;
                const idx = inputs.findIndex((el) => el === active);
                if (idx !== -1) {
                    e.preventDefault();
                    let nextIdx;
                    if (e.shiftKey) {
                        nextIdx = idx === 0 ? inputs.length - 1 : idx - 1;
                    } else {
                        nextIdx = idx === inputs.length - 1 ? 0 : idx + 1;
                    }
                    (inputs[nextIdx] as HTMLElement).focus();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, loading, lastName, firstName, email, emailConfirm, password, passwordConfirm]);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

    // focus при открытии
    useEffect(() => {
        if (isOpen) setTimeout(() => lastNameRef.current?.focus(), 50);
    }, [isOpen]);

    // сброс
    useEffect(() => {
        if (!isOpen) {
            setLastName('');
            setFirstName('');
            setMiddleName('');
            setEmail('');
            setEmailConfirm('');
            setPhone('');
            setPassword('');
            setPasswordConfirm('');
            setErrors({});
            setTouched({});
            setLoading(false);
        }
    }, [isOpen]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!lastName.trim()) newErrors.lastName = 'Введите фамилию';
        if (!firstName.trim()) newErrors.firstName = 'Введите имя';
        if (!emailRegex.test(email)) newErrors.email = 'Введите корректный e-mail';
        if (email !== emailConfirm) newErrors.emailConfirm = 'E-mail не совпадает';
        if (password.length < 8) newErrors.password = 'Минимум 8 символов';
        if (password !== passwordConfirm) newErrors.passwordConfirm = 'Пароли не совпадают';

        // Не устанавливаем ошибки напрямую
        return Object.keys(newErrors).length === 0;
    };

    // Валидация на лету при изменении полей, если они уже тронуты
    useEffect(() => {
        const newErrors: Record<string, string> = {};

        if (touched.lastName && !lastName.trim()) newErrors.lastName = 'Введите фамилию';
        if (touched.firstName && !firstName.trim()) newErrors.firstName = 'Введите имя';
        if (touched.email && !emailRegex.test(email)) newErrors.email = 'Введите корректный e-mail';
        if (touched.emailConfirm && email !== emailConfirm) newErrors.emailConfirm = 'E-mail не совпадает';
        if (touched.password && password.length < 8) newErrors.password = 'Минимум 8 символов';
        if (touched.passwordConfirm && password !== passwordConfirm) newErrors.passwordConfirm = 'Пароли не совпадают';

        setErrors(newErrors);
    }, [lastName, firstName, email, emailConfirm, password, passwordConfirm, touched]);

    const isValid = () => {
        return (
            lastName.trim() &&
            firstName.trim() &&
            emailRegex.test(email) &&
            email === emailConfirm &&
            password.length >= 8 &&
            password === passwordConfirm
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setErrors({});

        try {
            const res = await Service.register('', {
                email,
                firstName,
                middleName: middleName || undefined,
                lastName,
                phoneNumber: phone.replace(/\D/g, '').length === 11 ? `+${phone.replace(/\D/g, '')}` : undefined,
                password,
                userId: Number(userId),
            });

            onSwitchToVerify(res.email as string, res.codeExpiresInMinutes as number);
        } catch (err: any) {
            setErrors({
                general: err?.message || 'Ошибка регистрации. Попробуйте позже.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-51"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget && !loading) {
                            ignoreBlur.current = true;
                        }
                    }}
                    onTouchStart={(e) => {
                        if (e.target === e.currentTarget && !loading) {
                            ignoreBlur.current = true;
                        }
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !loading) {
                            e.preventDefault();
                            onClose();
                            setTimeout(() => {
                                ignoreBlur.current = false;
                            }, 300);
                        }
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="relative bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden"
                        style={{ clipPath: 'inset(0 round 16px)' }}
                    >
                        {/* Sticky Header */}
                        <div className="sticky top-0 bg-white z-10 px-[30px] pt-[20px] pb-[20px] border-b border-[#CCCCCC]">
                            <h2 className="text-[16px] leading-[18px] uppercase font-semibold text-left">
                                Зарегистрироваться
                            </h2>
                            {/* Крестик */}
                            <button
                                onMouseDown={() => {
                                    ignoreBlur.current = true;
                                }}
                                onTouchStart={() => {
                                    ignoreBlur.current = true;
                                }}
                                onClick={() => {
                                    onClose();
                                    setTimeout(() => {
                                        ignoreBlur.current = false;
                                    }, 300);
                                }}
                                disabled={loading}
                                className="absolute top-4 right-4 text-gray-500 text-xl cursor-pointer disabled:opacity-40"
                                type="button"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="px-[30px] pb-[60px] max-h-[90vh] overflow-y-auto scroll-custom">
                        {/* Форма */}
                        <form
                            ref={formRef}
                            className="mt-[60px]"
                            onSubmit={handleSubmit}
                            noValidate
                        >
                            {/* Фамилия */}
                            <label className="block text-[14px] leading-[18px] uppercase mb-[20px]">
                                фамилия<span className="text-red-500">*</span>
                                <input
                                    ref={lastNameRef}
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    maxLength={50}
                                    onBlur={() => {
                                        if (ignoreBlur.current) return;
                                        setTouched((prev) => ({ ...prev, lastName: true }));
                                    }}
                                    placeholder="Введите вашу фамилию"
                                    disabled={loading}
                                    className={`mt-[20px] w-full h-[56px] border rounded px-4 text-[12px] leading-[18px] outline-none ${
                                        errors.lastName ? 'border-red-400' : 'border-[#CCC]'
                                    } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                />
                                {errors.lastName && (
                                    <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                                )}
                            </label>
                            {/* Имя */}
                            <label className="block text-[14px] leading-[18px] uppercase mb-[20px]">
                                имя<span className="text-red-500">*</span>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    maxLength={50}
                                    onBlur={() => {
                                        if (ignoreBlur.current) return;
                                        setTouched((prev) => ({ ...prev, firstName: true }));
                                    }}
                                    placeholder="Введите ваше имя"
                                    disabled={loading}
                                    className={`mt-[20px] w-full h-[56px] border rounded px-4 text-[12px] leading-[18px] outline-none ${
                                        errors.firstName ? 'border-red-400' : 'border-[#CCC]'
                                    } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                />
                                {errors.firstName && (
                                    <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                                )}
                            </label>
                            {/* Отчество */}
                            <label className="block text-[14px] leading-[18px] uppercase mb-[20px]">
                                отчество
                                <input
                                    type="text"
                                    value={middleName}
                                    onChange={(e) => setMiddleName(e.target.value)}
                                    maxLength={50}
                                    onBlur={() => {
                                        if (ignoreBlur.current) return;
                                        setTouched((prev) => ({ ...prev, middleName: true }));
                                    }}
                                    placeholder="Введите ваше отчество"
                                    disabled={loading}
                                    className={`mt-[20px] w-full h-[56px] border rounded px-4 text-[12px] leading-[18px] outline-none ${
                                        errors.middleName ? 'border-red-400' : 'border-[#CCC]'
                                    } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                />
                                {errors.middleName && (
                                    <p className="text-red-500 text-xs mt-1">{errors.middleName}</p>
                                )}
                            </label>

                            {/* Email */}
                            <label className="block text-[14px] leading-[18px] uppercase mb-[20px]">
                                e-mail<span className="text-red-500">*</span>
                                <input
                                    ref={emailRef}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    maxLength={50}
                                    onBlur={() => {
                                        if (ignoreBlur.current) return;
                                        setTouched((prev) => ({ ...prev, email: true }));
                                    }}
                                    placeholder="Введите ваш e-mail"
                                    disabled={loading}
                                    className={`mt-[20px] w-full h-[56px] border rounded px-4 text-[12px] leading-[18px] outline-none ${
                                        errors.email ? 'border-red-400' : 'border-[#CCC]'
                                    } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </label>

                            {/* Подтверждение e-mail */}
                            <label className="block text-[14px] leading-[18px] uppercase mb-[20px]">
                                подтверждение e-mail<span className="text-red-500">*</span>
                                <input
                                    type="email"
                                    value={emailConfirm}
                                    onChange={(e) => setEmailConfirm(e.target.value)}
                                    maxLength={50}
                                    onBlur={() => {
                                        if (ignoreBlur.current) return;
                                        setTouched((prev) => ({ ...prev, emailConfirm: true }));
                                    }}
                                    placeholder="Введите ваш e-mail повторно"
                                    disabled={loading}
                                    className={`mt-[20px] w-full h-[56px] border rounded px-4 text-[12px] leading-[18px] outline-none ${
                                        errors.emailConfirm ? 'border-red-400' : 'border-[#CCC]'
                                    } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                />
                                {errors.emailConfirm && (
                                    <p className="text-red-500 text-xs mt-1">{errors.emailConfirm}</p>
                                )}
                            </label>

                            {/* Телефон */}
                            <label className="block text-[14px] leading-[18px] uppercase mb-[20px]">
                              номер телефона
                              <input
                                type="tel"
                                value={phone}
                                onFocus={() => {
                                  if (!phone) setPhone('+7 ');
                                }}
                                onChange={(e) => {
                                  let input = e.target.value;

                                  if (!input.startsWith('+7')) return;

                                  const digits = input.replace(/\D/g, '');
                                  if (digits.length === 1) {
                                    setPhone('+7 ');
                                    return;
                                  }

                                  let formatted = '+7';
                                  if (digits.length > 1) formatted += ' (' + digits.substring(1, 4);
                                  if (digits.length >= 5) formatted += ') ' + digits.substring(4, 7);
                                  if (digits.length >= 8) formatted += '-' + digits.substring(7, 9);
                                  if (digits.length >= 10) formatted += '-' + digits.substring(9, 11);
                                  setPhone(formatted);
                                }}
                                onBlur={() => {
                                  if (ignoreBlur.current) return;
                                  if (phone.trim() === '+7' || phone.trim() === '+7 (') {
                                    setPhone('');
                                    setTouched((prev) => ({ ...prev, phone: false }));
                                    return;
                                  }
                                  setTouched((prev) => ({ ...prev, phone: true }));
                                }}
                                placeholder="+7"
                                disabled={loading}
                                className={`mt-[20px] w-full h-[56px] border rounded px-4 text-[12px] leading-[18px] outline-none ${
                                  touched.phone && phone && phone.replace(/\D/g, '').length !== 11
                                    ? 'border-red-400'
                                    : 'border-[#CCC]'
                                } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                              />
                              {touched.phone && phone && phone.replace(/\D/g, '').length !== 11 && (
                                <p className="text-red-500 text-xs mt-1">Введите корректный номер телефона</p>
                              )}
                            </label>

                            {/* Пароль */}
                            <label className="block text-[14px] leading-[18px] uppercase mb-[20px]">
                                пароль<span className="text-red-500">*</span>
                                <div className="relative mt-[20px]">
                                    <input
                                        ref={passwordRef}
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        maxLength={50}
                                        onBlur={() => {
                                            if (ignoreBlur.current) return;
                                            setTouched((prev) => ({ ...prev, password: true }));
                                        }}
                                        placeholder="Введите пароль"
                                        disabled={loading}
                                        className={`w-full h-[56px] border rounded px-4 text-[12px] leading-[18px] outline-none pr-10 ${
                                            errors.password ? 'border-red-400' : 'border-[#CCC]'
                                        } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer disabled:opacity-40"
                                    >
                                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </label>

                            {/* Подтверждение пароля */}
                            <label className="block text-[14px] leading-[18px] uppercase mb-[20px]">
                                подтверждение пароля<span className="text-red-500">*</span>
                                <div className="relative mt-[20px]">
                                    <input
                                        type={showPasswordConfirm ? 'text' : 'password'}
                                        value={passwordConfirm}
                                        onChange={(e) => setPasswordConfirm(e.target.value)}
                                        maxLength={50}
                                        onBlur={() => {
                                            if (ignoreBlur.current) return;
                                            setTouched((prev) => ({ ...prev, passwordConfirm: true }));
                                        }}
                                        placeholder="Введите пароль ещё раз"
                                        disabled={loading}
                                        className={`w-full h-[56px] border rounded px-4 text-[12px] leading-[18px] outline-none pr-10 ${
                                            errors.passwordConfirm ? 'border-red-400' : 'border-[#CCC]'
                                        } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer disabled:opacity-40"
                                    >
                                        {showPasswordConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                                {errors.passwordConfirm && (
                                    <p className="text-red-500 text-xs mt-1">{errors.passwordConfirm}</p>
                                )}
                            </label>

                            {/* Ошибка регистрации */}
                            <div className="w-full flex justify-center min-h-[24px]">
                                <AnimatePresence>
                                    {errors.general && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-full"
                                        >
                                            <p className="text-red-500 text-[11px] text-center mt-2 uppercase">{errors.general}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            {/* Кнопка регистрации */}
                            <motion.button
                                type="submit"
                                disabled={!isValid() || loading}
                                whileHover={isValid() && !loading ? { scale: 1.01 } : {}}
                                whileTap={isValid() && !loading ? { scale: 0.97 } : {}}
                                className={`mt-[60px] w-full h-[56px] rounded-[8px] border border-[#FFFBF5]
                            text-[14px] leading-[18px] uppercase text-center font-semibold transition-all
                            ${
                                    isValid() && !loading
                                        ? 'bg-[#F8C6D7] text-black hover:shadow-md cursor-pointer'
                                        : 'bg-[#F8C6D7]/50 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                            </motion.button>
                        </form>

                        {/* Footer */}
                        <div className="mt-[40px] text-center text-[#565656]">
                            <p className="font-normal text-[16px] leading-[22px]">Уже с нами?</p>
                            <button
                                type="button"
                                onMouseDown={() => {
                                    ignoreBlur.current = true;
                                }}
                                onTouchStart={() => {
                                    ignoreBlur.current = true;
                                }}
                                onClick={() => {
                                    onSwitchToLogin();
                                    setTimeout(() => {
                                        ignoreBlur.current = false;
                                    }, 300);
                                }}
                                disabled={loading}
                                className="font-normal text-[16px] leading-[22px] underline cursor-pointer hover:text-[#F8C6D7] transition-colors disabled:opacity-50"
                            >
                                Войти в личный кабинет
                            </button>
                        </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};