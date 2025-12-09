import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Service } from '@/api/services/Service.ts';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onBack: () => void;      // вернуться к логину
    onCloseAll: () => void;  // закрыть всё (и логин тоже)
    onOpenVerify: (email: string, expiresInMinutes: number, newPassword?: string) => void; // открыть VerifyEmailModal "сверху"
}

export const ForgotPasswordModal = ({ isOpen, onBack, onCloseAll, onOpenVerify }: ForgotPasswordModalProps) => {
    const [email, setEmail] = useState('');
    const [touched, setTouched] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [newPwTouched, setNewPwTouched] = useState(false);
    const emailRef = useRef<HTMLInputElement>(null);
    const newPwRef = useRef<HTMLInputElement>(null);
    const ignoreBlur = useRef(false);
    const suppressNextBlurRef = useRef(false);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
    const isValid = emailRegex.test(email);
    const isNewPwValid = newPassword.length >= 8;

    // сброс при закрытии
    useEffect(() => {
        if (!isOpen) {
            setEmail('');
            setTouched(false);
            setError(null);
            setLoading(false);
            setSent(false);
            setNewPassword('');
            setNewPwTouched(false);
            ignoreBlur.current = false;
            suppressNextBlurRef.current = false;
        }
    }, [isOpen]);

    // фокус на email при открытии
    useEffect(() => {
        if (isOpen && emailRef.current) {
            setTimeout(() => emailRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        const onWinBlur = () => { suppressNextBlurRef.current = true; };
        const onVisibility = () => {
            if (document.visibilityState === 'hidden') suppressNextBlurRef.current = true;
        };
        window.addEventListener('blur', onWinBlur);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            window.removeEventListener('blur', onWinBlur);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, []);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched(true);
        setNewPwTouched(true);
        if (!isValid || !isNewPwValid || loading) return;

        setLoading(true);
        setError(null);
        setSent(false);
        try {
            const res = await Service.forgotPassword({ email });
            setSent(true);
            const targetEmail = res?.email ?? email;
            const expires = res?.codeExpiresInMinutes ?? 0;
            // Открываем VerifyEmailModal через хедер и закрываем текущую модалку
            onOpenVerify(targetEmail, expires, newPassword || undefined);
            onCloseAll();
        } catch (err: any) {
            setError(err?.message || 'Не удалось отправить код');
        } finally {
            setLoading(false);
        }
    };

    // Закрытие по клику вне модалки
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !loading) {
            e.preventDefault();
            onCloseAll();
        }
    };
    const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !loading) {
            e.preventDefault();
            ignoreBlur.current = true;
        }
    };
    const handleOverlayTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !loading) {
            ignoreBlur.current = true;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-52"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onMouseDown={handleOverlayMouseDown}
                    onTouchStart={handleOverlayTouchStart}
                    onClick={handleOverlayClick}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="relative bg-white dark:bg-[#2A2A2B] rounded-2xl w-full max-w-md mx-4 px-[30px] pt-[20px] pb-[90px]"
                    >
                        {/* Назад */}
                        <button
                            tabIndex={-1}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                ignoreBlur.current = true;
                                onBack();
                            }}
                            disabled={loading}
                            aria-label="Назад"
                            className="absolute top-4 left-4 text-gray-500 cursor-pointer disabled:opacity-40"
                        >
                            <ArrowLeft />
                        </button>

                        {/* Закрыть */}
                        <button
                            tabIndex={-1}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                ignoreBlur.current = true;
                                onCloseAll();
                            }}
                            disabled={loading}
                            className="absolute top-4 right-4 text-gray-500 dark:text-white text-xl cursor-pointer disabled:opacity-40"
                        >
                            ✕
                        </button>

                        {/* Заголовок */}
                        <h2 className="text-[16px] leading-[18px] uppercase font-semibold text-center">
                            Восстановление пароля
                        </h2>

                        {/* Divider */}
                        <div className="absolute left-0 right-0 h-px bg-[#CCCCCC] dark:bg-white/10 mt-[20px]" />

                        {/* Форма */}
                        <form className="mt-[60px]" noValidate onSubmit={onSubmit} autoComplete="on">
                            <label className="block text-[14px] leading-[18px] uppercase mb-[20px]">
                                e-mail
                                <input
                                    required
                                    type="email"
                                    name="username"
                                    autoComplete="username"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={() => {
                                        if (ignoreBlur.current) return;
                                        if (
                                            document.visibilityState === 'hidden' ||
                                            !document.hasFocus() ||
                                            suppressNextBlurRef.current
                                        ) {
                                            suppressNextBlurRef.current = false; // одноразово
                                            return;
                                        }
                                        setTouched(true);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Tab') {
                                            e.preventDefault();
                                            newPwRef.current?.focus();
                                        }
                                    }}
                                    placeholder="Введите e-mail"
                                    maxLength={50}
                                    disabled={loading}
                                    ref={emailRef}
                                    className={`mt-[20px] w-full h-[56px] border rounded px-4 text-[12px] leading-[18px] outline-none ${
                                        touched && !isValid ? 'border-red-400' : 'border-[#CCC] dark:border-white/10'
                                    } ${loading ? 'bg-gray-100 dark:bg-white/10 cursor-not-allowed' : ''}`}
                                />
                                <AnimatePresence>
                                    {touched && !isValid && email.length > 0 && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-red-500 text-xs mt-1"
                                        >
                                            Введите корректный e-mail
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </label>
                            {/* Новый пароль */}
                            <label className="block text-[14px] leading-[18px] uppercase mb-[20px]">
                                новый пароль
                                <input
                                    required
                                    type="password"
                                    name="new-password"
                                    autoComplete="new-password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    onBlur={() => {
                                        if (ignoreBlur.current) return;
                                        if (
                                            document.visibilityState === 'hidden' ||
                                            !document.hasFocus() ||
                                            suppressNextBlurRef.current
                                        ) {
                                            suppressNextBlurRef.current = false; // одноразово
                                            return;
                                        }
                                        setNewPwTouched(true);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Tab') {
                                            e.preventDefault();
                                            emailRef.current?.focus();
                                        }
                                    }}
                                    placeholder="Введите новый пароль"
                                    maxLength={50}
                                    disabled={loading}
                                    ref={newPwRef}
                                    className={`mt-[20px] w-full h-[56px] border rounded px-4 text-[12px] leading-[18px] outline-none ${
                                        newPwTouched && !isNewPwValid ? 'border-red-400' : 'border-[#CCC] dark:border-white/10'
                                    } ${loading ? 'bg-gray-100 dark:bg-white/10 cursor-not-allowed' : ''}`}
                                />
                                <AnimatePresence>
                                    {newPwTouched && newPassword.length > 0 && !isNewPwValid && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-red-500 text-xs mt-1"
                                        >
                                            Пароль должен содержать минимум 8 символов
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </label>

                            {/* Ошибка */}
                            <div className="h-[20px] mt-4 flex items-center justify-center">
                                <AnimatePresence>
                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-red-500 text-xs uppercase"
                                        >
                                            {error}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Кнопка */}
                            <motion.button
                                tabIndex={-1}
                                type="submit"
                                disabled={!isValid || !isNewPwValid || loading || sent}
                                whileHover={isValid && isNewPwValid && !loading && !sent ? { scale: 1.03 } : {}}
                                whileTap={isValid && isNewPwValid && !loading && !sent ? { scale: 0.97 } : {}}
                                className={`mt-[40px] w-full h-[56px] rounded-[8px] border border-[#FFFBF5] dark:border-white/10
                  text-[14px] leading-[18px] uppercase text-center font-semibold transition-all
                  ${
                                    isValid && isNewPwValid && !loading && !sent
                                        ? 'bg-[#F8C6D7] text-black hover:shadow-md cursor-pointer'
                                        : 'bg-[#F8C6D7]/50 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {loading ? 'Отправляем…' : sent ? 'Код отправлен' : 'Отправить код'}
                            </motion.button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};