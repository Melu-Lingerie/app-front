import { useState, useEffect, useCallback } from 'react';
import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import {Service} from '@/api';


type VerifyEmailModalProps = {
    /** Открыта ли модалка */
    isOpen: boolean;

    /** E-mail, на который отправлен код */
    email: string;

    /** Время действия кода (в минутах) */
    expiresIn: number;

    /** Закрытие модалки */
    onClose: () => void;
};

export const VerifyEmailModal: React.FC<VerifyEmailModalProps> = ({ isOpen, email, expiresIn, onClose }) => {
    const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const code = digits.join('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { addNotification } = useNotifications();

    // Таймер для кнопки "Отправить код повторно"
    const [resendTimer, setResendTimer] = useState(0);

    // Запуск таймера при открытии модалки
    useEffect(() => {
        if (isOpen) {
            setResendTimer(60);
        }
    }, [isOpen]);
    // Событие отправки кода повторно
    const handleResend = useCallback(async () => {
        setLoading(true);
        try {
            await Service.resendCode({ email });
            setResendTimer(60);
        } catch (err: any) {
            setError(err?.message || 'Неверный код');
        } finally {
            setLoading(false);
        }
    }, [email]);

    useEffect(() => {
        if (resendTimer > 0) {
            const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [resendTimer]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError('');
        if (loading) return;
        if (code.length !== 6) return;
        setLoading(true);
        try {
            await Service.verifyEmail({ email, code });
            addNotification('E-mail успешно подтвержден', 'success');
            onClose();
        } catch (err: any) {
            setError(err?.message || 'Неверный код');
        } finally {
            setLoading(false);
        }
    };

    // Автоматическая отправка кода при заполнении всех 6 цифр
    useEffect(() => {
        const filled = digits.join('');
        if (filled.length === 6 && !loading) {
            handleSubmit();
        }
    }, [digits]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-51"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="relative bg-white rounded-2xl w-full max-w-md mx-4 p-6"
                >
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="absolute top-6 right-6 text-gray-500 text-xl hover:text-gray-700 transition disabled:opacity-40 cursor-pointer"
                    >
                        ✕
                    </button>
                        <h2 className="text-lg font-semibold text-center mb-4">
                            Подтверждение e-mail
                        </h2>
                        <p className="text-sm text-gray-600 text-center mb-6">
                            Мы отправили код на <b>{email}</b>.
                            Код действителен {expiresIn} минут.
                        </p>
                        <form onSubmit={handleSubmit}>
                            <div
                                className="flex justify-between gap-2"
                                onPaste={(e) => {
                                    if (loading) return;
                                    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
                                    if (!pasted.length) return;
                                    const next = [...digits];
                                    for (let i = 0; i < 6; i++) {
                                        next[i] = pasted[i] ?? '';
                                    }
                                    setDigits(next);
                                    e.preventDefault();
                                }}
                            >
                                {digits.map((val, idx) => (
                                    <input
                                        key={idx}
                                        ref={(el) => (inputsRef.current[idx] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={1}
                                        value={val}
                                        disabled={loading}
                                        onFocus={(e) => e.currentTarget.select()}
                                        onChange={(e) => {
                                            if (loading) return;
                                            const digit = e.target.value.replace(/\D/g, '').slice(0, 1);
                                            const next = [...digits];
                                            next[idx] = digit;
                                            setDigits(next);
                                            if (digit && idx < 5) {
                                                inputsRef.current[idx + 1]?.focus();
                                            }
                                            // auto-submit handled in useEffect
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace') {
                                                if (digits[idx] === '') {
                                                    const prev = Math.max(0, idx - 1);
                                                    inputsRef.current[prev]?.focus();
                                                    const next = [...digits];
                                                    next[prev] = '';
                                                    setDigits(next);
                                                    e.preventDefault();
                                                } else {
                                                    const next = [...digits];
                                                    next[idx] = '';
                                                    setDigits(next);
                                                    e.preventDefault();
                                                }
                                            } else if (e.key === 'ArrowLeft') {
                                                const prev = Math.max(0, idx - 1);
                                                inputsRef.current[prev]?.focus();
                                                e.preventDefault();
                                            } else if (e.key === 'ArrowRight') {
                                                const nextIdx = Math.min(5, idx + 1);
                                                inputsRef.current[nextIdx]?.focus();
                                                e.preventDefault();
                                            } else if (e.key === 'Enter') {
                                                if (code.length === 6 && !loading) {
                                                    e.preventDefault();
                                                    handleSubmit();
                                                }
                                            }
                                        }}
                                        className="w-[44px] h-[56px] border border-[#CCCCCC] rounded text-center text-[20px] leading-[56px] outline-none focus:ring-2 focus:ring-[#F8C6D7] disabled:bg-gray-100"
                                    />
                                ))}
                            </div>
                            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                            <div className="mt-6 flex justify-center">
                                <button
                                    type="button"
                                    disabled={resendTimer > 0 || loading}
                                    className={`font-normal text-[16px] leading-[22px] underline transition-colors ${
                                        resendTimer > 0 || loading
                                            ? 'opacity-50 cursor-not-allowed text-gray-400'
                                            : 'cursor-pointer hover:text-[#F8C6D7]'
                                    }`}
                                    onClick={handleResend}
                                >
                                    {resendTimer > 0
                                        ? `Отправить код повторно (${resendTimer} сек)`
                                        : 'Отправить код повторно'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};