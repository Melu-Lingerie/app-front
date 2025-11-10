import {useEffect, useState, useRef, useCallback} from 'react';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import {Service, type LoginRequestDto, type LoginResponseDto} from '@/api';
import {useDispatch} from 'react-redux';
import { setUserData } from '@/store/userSlice';
import {type AppDispatch, initApp} from '@/store';
import {setCartId} from '@/store/cartSlice.ts';
import {setWishlistId} from '@/store/wishlistSlice.ts';
import api from '@/axios/api.ts';

interface DeviceInfo {
    deviceType: string;
    ipAddress?: string;
    deviceName: string;
    osVersion: string;
    browserName: string;
    browserVersion: string;
    screenWidth: number;
    screenHeight: number;
    screenDensity: number;
}

const CONFIG = {
    endpoint: '/users/guests',
    cookieName: 'sessionId',
    cookieMaxAgeDays: 30,
    noticeCookie: 'cookieNoticeShown',
};

// ---- device helpers ----
const getDeviceName = (): string => {
    if (navigator.userAgentData?.platform) {
        return navigator.userAgentData.platform.slice(0, 100);
    }
    return (navigator.userAgent || 'Unknown').slice(0, 100);
};

// ---- device info ----
const detectDeviceInfo = async (): Promise<DeviceInfo> => {
    const ua = navigator.userAgent;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const screenDensity = window.devicePixelRatio || 1;

    let deviceType = 'DESKTOP';
    if (/Mobi|Android/i.test(ua)) deviceType = 'MOBILE';
    else if (/Tablet|iPad/i.test(ua)) deviceType = 'TABLET';

    let browserName = 'Unknown';
    let browserVersion = '';
    if (ua.includes('Chrome')) {
        browserName = 'Chrome';
        browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1] || '';
    } else if (ua.includes('Firefox')) {
        browserName = 'Firefox';
        browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1] || '';
    } else if (ua.includes('Safari')) {
        browserName = 'Safari';
        browserVersion = ua.match(/Version\/([0-9.]+)/)?.[1] || '';
    }

    const deviceName = getDeviceName();

    let osVersion = 'Unknown';
    if (ua.includes('Windows')) osVersion = 'Windows';
    else if (ua.includes('Mac')) osVersion = 'MacOS';
    else if (ua.includes('Android')) osVersion = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) osVersion = 'iOS';

    return {
        deviceType,
        ipAddress: undefined, // определяем на бэке
        deviceName,
        osVersion,
        browserName,
        browserVersion,
        screenWidth,
        screenHeight,
        screenDensity,
    };
};

// ---- network ----
const sendSessionToServer = async () => {
    const deviceInfo = await detectDeviceInfo();
    const body = { deviceInfo };
    return api.post(CONFIG.endpoint, body);
};

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToRegister: () => void;
}

export const LoginModal = ({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
        email: false,
        password: false,
    });
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const ignoreBlur = useRef(false);
    const suppressNextBlurRef = useRef(false);
    const dispatch = useDispatch<AppDispatch>();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    // Попытаться сохранить логин/пароль в менеджере паролей браузера
    const tryStorePasswordCredential = async (emailVal: string, passwordVal: string) => {
        try {
            const navAny = navigator as any;
            const winAny = window as any;
            if (navAny?.credentials && winAny?.PasswordCredential) {
                const cred = new winAny.PasswordCredential({ id: emailVal, password: passwordVal });
                await navAny.credentials.store(cred);
            }
        } catch {
            // молча игнорируем — не во всех браузерах поддерживается
        }
    };

    const validateField = (name: 'email' | 'password', value: string) => {
        let error = '';
        if (name === 'email' && !emailRegex.test(value)) {
            error = 'Введите корректный e-mail';
        }
        if (name === 'password' && value.length < 8) {
            error = 'Пароль должен содержать минимум 8 символов';
        }
        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const handleChange = (name: 'email' | 'password', value: string) => {
        if (name === 'email') setEmail(value);
        if (name === 'password') setPassword(value);
        if (touched[name]) validateField(name, value);
    };

    const handleBlur = (name: 'email' | 'password') => {
        if (ignoreBlur.current) return;
        if (document.visibilityState === 'hidden' || !document.hasFocus() || suppressNextBlurRef.current) {
            suppressNextBlurRef.current = false; // одноразово «съедаем» флаг
            return; // не валидируем blur, вызванный переключением вкладки/окна
        }
        setTouched((prev) => ({ ...prev, [name]: true }));
        validateField(name, name === 'email' ? email : password);
    };
    const handleClose = () => {
        ignoreBlur.current = true;
        onClose();
        setTimeout(() => {
            ignoreBlur.current = false;
        }, 350);
    };
    const isValid = useCallback(() => emailRegex.test(email) && password.length >= 8, [email, password, emailRegex]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        validateField('email', email);
        validateField('password', password);
        if (!isValid()) return;

        setLoading(true);
        setServerError(null);

        const requestBody: LoginRequestDto = { email, password };

        try {
            const response: LoginResponseDto = await Service.login(requestBody);

            // ✅ сохраняем sessionId (refresh приходит через Set-Cookie на бэке)
            if (response.sessionId) {
                Cookies.set('sessionId', response.sessionId, {
                    expires: 30,
                    secure: true,
                    sameSite: 'strict',
                    path: '/',
                });
            }

            // ✅ обновляем данные пользователя (включая accessToken и accessTokenExpiresAt)
            const accessTokenExpiresAt = typeof response.accessTokenExpiresIn === 'number'
                ? Date.now() + response.accessTokenExpiresIn * 1000
                : undefined;

            dispatch(setUserData({
                userId: response.userId ?? null,
                email: response.email ?? null,
                firstName: response.firstName ?? null,
                lastName: response.lastName ?? null,
                role: response.role ?? null,
                status: response.status ?? null,
                accessToken: response.accessToken ?? null,
                accessTokenExpiresAt: accessTokenExpiresAt ?? null,
            }));

            // ✅ сохраняем пароль в менеджере браузера ТОЛЬКО если пользователь поставил галочку
            if (remember && email && password) {
                await tryStorePasswordCredential(email, password);
            }

            // ✅ теперь пересылаем новую сессию на сервер, чтобы получить актуальные айди
            const res = await sendSessionToServer();

            if (res.data?.cartId) {
                dispatch(setCartId(res.data.cartId));
            }

            if (res.data?.wishlistId) {
                dispatch(setWishlistId(res.data.wishlistId));
            }

            // ✅ инициализация приложения только после получения cart/wishlist
            await dispatch(initApp({userId: res.data?.userId}));

            onClose();
        } catch (err: any) {
            setServerError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Сброс при закрытии
    useEffect(() => {
        if (!isOpen) {
            setEmail('');
            setPassword('');
            setShowPassword(false);
            setRemember(false);
            setErrors({});
            setTouched({ email: false, password: false });
            setServerError(null);
            setLoading(false);
        }
    }, [isOpen]);

    // Фокус на поле email при открытии
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

// Закрытие по клику вне модалки
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !loading) {
            e.preventDefault();
            handleClose();
        }
    };

    // Prevent blur as soon as pointer/touch goes down on the overlay
    const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !loading) {
            e.preventDefault();
            ignoreBlur.current = true;
        }
    };
    const handleOverlayTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !loading) {
            e.preventDefault();
            ignoreBlur.current = true;
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                e.preventDefault(); // отключаем стандартное переключение по Tab

                const active = document.activeElement;
                const inputs = [emailRef.current, passwordRef.current];

                const currentIndex = inputs.findIndex((el) => el === active);
                let nextIndex = 0;

                if (e.shiftKey) {
                    nextIndex = currentIndex <= 0 ? inputs.length - 1 : currentIndex - 1;
                } else {
                    nextIndex = currentIndex === inputs.length - 1 ? 0 : currentIndex + 1;
                }

                inputs[nextIndex]?.focus();
            }

            // ENTER отправляет форму
            if (e.key === 'Enter' && isValid() && !loading) {
                handleSubmit(e as unknown as React.FormEvent);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isValid, loading]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-51"
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
                        className="relative bg-white rounded-2xl w-full max-w-md mx-4 px-[30px] pt-[20px] pb-[90px]"
                    >
                        {/* Кнопка закрытия */}
                        <button
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleClose();
                            }}
                            disabled={loading}
                            className="absolute top-4 right-4 text-gray-500 text-xl cursor-pointer disabled:opacity-40"
                        >
                            ✕
                        </button>

                        {/* Заголовок */}
                        <h2 className="text-[16px] leading-[18px] uppercase font-semibold text-left">
                            Войти или зарегистрироваться
                        </h2>

                        {/* Divider */}
                        <div className="absolute left-0 right-0 h-px bg-[#CCCCCC] mt-[20px]" />

                        {/* Форма */}
                        <form
                            className="mt-[60px]"
                            onSubmit={handleSubmit}
                            noValidate
                            autoComplete={remember ? 'on' : 'off'}
                        >
                            {/* Email */}
                            <label className="block text-[14px] leading-[18px] uppercase mb-[20px]">
                                e-mail
                                <input
                                    type="email"
                                    name="username"
                                    autoComplete={remember ? 'username' : 'off'}
                                    value={email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    onBlur={() => handleBlur('email')}
                                    placeholder="Введите e-mail"
                                    maxLength={50}
                                    disabled={loading}
                                    ref={emailRef}
                                    className={`mt-[20px] w-full h-[56px] border rounded px-4 text-[12px] leading-[18px] outline-none ${
                                        errors.email ? 'border-red-400' : 'border-[#CCC]'
                                    } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                />
                                <AnimatePresence>
                                    {touched.email && errors.email && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-red-500 text-xs mt-1"
                                        >
                                            {errors.email}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </label>

                            {/* Пароль */}
                            <label className="block text-[14px] leading-[18px] uppercase mb-[20px]">
                                пароль
                                <div className="relative mt-[20px]">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        autoComplete={remember ? 'current-password' : 'new-password'}
                                        value={password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        onBlur={() => handleBlur('password')}
                                        placeholder="Введите пароль"
                                        maxLength={50}
                                        disabled={loading}
                                        ref={passwordRef}
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
                                <AnimatePresence>
                                    {touched.password && errors.password && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-red-500 text-xs mt-1"
                                        >
                                            {errors.password}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </label>

                            {/* ✅ Запомнить пароль / Забыли пароль */}
                            <div className="flex justify-between items-center mt-[30px]">
                                <label className="flex items-center gap-2 text-[12px] leading-[18px] cursor-pointer select-none group">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        className="hidden peer"
                                        disabled={loading}
                                    />
                                    <span
                                        className={`w-4 h-4 rounded border border-[#F8C6D7] flex items-center justify-center transition-colors duration-150
                      peer-checked:bg-[#F8C6D7] group-hover:border-[#F8C6D7] ${
                                            loading ? 'opacity-50' : ''
                                        }`}
                                    >
                    <AnimatePresence>
                      {remember && (
                          <motion.svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-3 h-3"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ duration: 0.15 }}
                          >
                              <polyline points="20 6 9 17 4 12" />
                          </motion.svg>
                      )}
                    </AnimatePresence>
                  </span>
                                    Запомнить пароль
                                </label>

                                <button
                                    type="button"
                                    disabled={loading}
                                    className="text-[12px] leading-[18px] underline cursor-pointer hover:text-[#F8C6D7] transition-colors disabled:opacity-50"
                                >
                                    Забыли пароль?
                                </button>
                            </div>

                            {/* Ошибка с сервера */}
                            <div className="h-[20px] mt-4 flex items-center justify-center">
                                <AnimatePresence>
                                    {serverError && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-red-500 text-xs uppercase"
                                        >
                                            {serverError}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Кнопка */}
                            <motion.button
                                type="submit"
                                disabled={!isValid() || loading}
                                whileHover={isValid() && !loading ? { scale: 1.03 } : {}}
                                whileTap={isValid() && !loading ? { scale: 0.97 } : {}}
                                className={`mt-[40px] w-full h-[56px] rounded-[8px] border border-[#FFFBF5]
                            text-[14px] leading-[18px] uppercase text-center font-semibold transition-all
                            ${
                                    isValid() && !loading
                                        ? 'bg-[#F8C6D7] text-black hover:shadow-md cursor-pointer'
                                        : 'bg-[#F8C6D7]/50 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {loading ? 'Вход...' : 'Войти в личный кабинет'}
                            </motion.button>
                        </form>

                        {/* Footer */}
                        <div className="mt-[40px] text-center text-[#565656]">
                            <p className="font-normal text-[16px] leading-[22px]">Впервые на Melu?</p>
                            <button
                                type="button"
                                disabled={loading}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleClose();
                                    onSwitchToRegister();
                                }}
                                className="font-normal text-[16px] leading-[22px] underline cursor-pointer hover:text-[#F8C6D7] transition-colors disabled:opacity-50"
                            >
                                Зарегистрироваться по e-mail
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};