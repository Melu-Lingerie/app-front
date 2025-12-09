import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, Search, ShoppingCart, User, LogOut, Loader2 } from 'lucide-react';
import {HeaderDrawer} from '../Drawers';
import api from '@/axios/api.ts';

// redux
import { type RootState, type AppDispatch, initApp } from '@/store';

// animation
import { motion, AnimatePresence } from 'framer-motion';
import {LoginModal, RegisterModal, VerifyEmailModal} from '@/components';
import {selectIsAuthenticated, clearUser} from '@/store/userSlice.ts';
import { setCartId } from '@/store/cartSlice';
import { setWishlistId } from '@/store/wishlistSlice';
import { Service } from '@/api/services/Service.ts';
import { setInitialized } from '@/store/appSlice.ts';

// --- device info helpers ---
const detectDeviceInfo = async () => {
    const ua = navigator.userAgent;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const screenDensity = window.devicePixelRatio || 1;

    let deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET' = 'DESKTOP';
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

    let osVersion = 'Unknown';
    if (ua.includes('Windows')) osVersion = 'Windows';
    else if (ua.includes('Mac')) osVersion = 'MacOS';
    else if (ua.includes('Android')) osVersion = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) osVersion = 'iOS';

    const deviceName = (navigator as any).userAgentData?.platform
        ? (navigator as any).userAgentData.platform.slice(0, 100)
        : (navigator.userAgent || 'Unknown').slice(0, 100);

    return {
        deviceType,
        ipAddress: undefined as string | undefined,
        deviceName,
        osVersion,
        browserName,
        browserVersion,
        screenWidth,
        screenHeight,
        screenDensity,
    };
};

// --- session helpers (как в CookieNotice/LoginModal) ---
const SESSION_COOKIE_NAME = 'sessionId';

const setCookie = (name: string, value: string, days: number) => {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; Secure; SameSite=Lax`;
};


const sendSessionToServer = async () => {
    const deviceInfo = await detectDeviceInfo();
    return api.post('/users/guests', { deviceInfo });
};

export const Header = () => {
    const textBtn = 'relative text-sm cursor-pointer hidden md:block';
    const iconBtn = 'relative size-4 cursor-pointer';
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [showVerify, setShowVerify] = useState(false);
    const [verifyEmail, setVerifyEmail] = useState('');
    const [verifyExpires, setVerifyExpires] = useState(0);
    const [verifyNewPassword, setVerifyNewPassword] = useState<string | undefined>(undefined);

    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const accountBtnRef = useRef<HTMLButtonElement | null>(null);
    const accountMenuRef = useRef<HTMLDivElement | null>(null);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();
    const isOnAccount = location.pathname.startsWith('/account');

    const itemsCount = useSelector((state: RootState) => state.cart.itemsCount);
    const wishlistCount = useSelector((state: RootState) => state.wishlist.itemsCount);
    const initialized = useSelector((state: RootState) => state.app.initialized);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            const target = e.target as Node | null;
            if (!target) return;
            if (accountMenuRef.current && accountMenuRef.current.contains(target)) return;
            if (accountBtnRef.current && accountBtnRef.current.contains(target)) return;
            setIsAccountMenuOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsAccountMenuOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        window.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            window.removeEventListener('keydown', onKey);
        };
    }, []);

    useEffect(() => {
        const onOpenLogin: EventListener = () => {
            setIsLoginOpen(true);
        };
        window.addEventListener('open-login-modal', onOpenLogin);
        return () => {
            window.removeEventListener('open-login-modal', onOpenLogin);
        };
    }, []);

    const handleLogout = async () => {
      setLoggingOut(true);
      try {
        // 1) Запрос на разлогин (по refreshToken из куки)
        await Service.logout();
        localStorage.setItem('wasAuthed', '0');
        dispatch(setInitialized(false));
        setIsAccountMenuOpen(false);

        // 2) Чистим пользователя (accessToken и др.) из Redux
        dispatch(clearUser());

        // 3) Генерим новую гостевую сессию как в CookieNotice
        const newSid = crypto.randomUUID();
        setCookie(SESSION_COOKIE_NAME, newSid, 30);

        // 4) Отправляем сессию на сервер и обновляем cart/wishlist, затем initApp
        const res = await sendSessionToServer();
        if (res.data?.cartId) {
          dispatch(setCartId(res.data.cartId));
        }
        if (res.data?.wishlistId) {
          dispatch(setWishlistId(res.data.wishlistId));
        }
        await dispatch(initApp({ userId: res.data?.userId, skipSilentRefresh: true }));

      } catch {
        // Ошибку можно показать в toast/alert при необходимости
      } finally {
        setLoggingOut(false);
      }
    };

    return (
        <>
            <LoginModal
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onSwitchToRegister={() => {
                    setTimeout(() => setIsRegisterOpen(true), 200);
                }}
                onOpenVerify={(email, expires, newPw) => {
                    setIsLoginOpen(false);
                    setVerifyEmail(email);
                    setVerifyExpires(expires);
                    setVerifyNewPassword(newPw);
                    setShowVerify(true);
                }}
            />

            <RegisterModal
                isOpen={isRegisterOpen}
                onClose={() => setIsRegisterOpen(false)}
                onSwitchToLogin={() => {
                    setIsRegisterOpen(false);
                    setTimeout(() => setIsLoginOpen(true), 200);
                }}
                onSwitchToVerify={(email, expires) => {
                    setIsRegisterOpen(false);
                    setVerifyEmail(email);
                    setVerifyExpires(expires);
                    setShowVerify(true);
                }}
            />

            <VerifyEmailModal
                isOpen={showVerify}
                email={verifyEmail}
                expiresIn={verifyExpires}
                newPassword={verifyNewPassword}
                onClose={() => { setShowVerify(false); setVerifyNewPassword(undefined); }}
            />
            <header className="sticky top-0 z-50 bg-[#FFFBF5] dark:bg-[#1a1a1a]">
            <div className="relative flex items-center justify-between h-[49px] px-4 md:px-10">
                {/* Левая часть */}
                <div className="flex items-center gap-3 md:gap-4">
                    <button
                      type="button"
                      className={iconBtn}
                      onClick={() => setIsDrawerOpen(true)}
                    >
                        <Menu className="w-4 h-4 md:w-4 md:h-4" aria-hidden="true" />
                    </button>
                    {/* Search - visible on mobile too */}
                    <button type="button" className={`${iconBtn} md:hidden`}>
                        <Search className="w-4 h-4" aria-hidden="true" />
                    </button>
                </div>

                {/* Заголовок */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Link to="/">
                        <p className="m-0 text-[18px] md:text-[24px] font-semibold whitespace-nowrap">MELU LINGERIE</p>
                    </Link>
                </div>

                {/* Правая часть */}
                <div className="flex items-center gap-3 md:gap-4 md:min-w-[150px] justify-end">
                    <AnimatePresence mode="wait">
                        {!initialized ? (
                            <motion.div
                                key="skeletons"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center gap-3 md:gap-4"
                            >
                                <div className="hidden md:block w-12 h-4 bg-gray-200 animate-pulse rounded" />
                                <div className="hidden md:block w-12 h-4 bg-gray-200 animate-pulse rounded" />
                                <div className="w-4 h-4 bg-gray-200 animate-pulse rounded-full" />
                                <div className="w-4 h-4 bg-gray-200 animate-pulse rounded-full" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="buttons"
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center gap-3 md:gap-4"
                            >
                                {/* Wishlist - desktop only text */}
                                <button type="button" className={textBtn} onClick={() => navigate('/account/favorites')}>
                                    ИЗБРАННОЕ
                                    <AnimatePresence>
                                        {wishlistCount > 0 && (
                                            <motion.span
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute -top-2 -right-3 bg-[#F8C6D7] text-black text-xs font-semibold
                                                           rounded-full w-4 h-4 flex items-center justify-center"
                                            >
                                                {wishlistCount}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>

                                {/* Login / Account */}
                                {!isAuthenticated ? (
                                    <>
                                        {/* Desktop - text button */}
                                        <button
                                            type="button"
                                            className={textBtn}
                                            onClick={() => setIsLoginOpen(true)}
                                        >
                                            ВОЙТИ
                                        </button>
                                        {/* Mobile - icon button */}
                                        <button
                                            type="button"
                                            className={`${iconBtn} md:hidden`}
                                            onClick={() => setIsLoginOpen(true)}
                                        >
                                            <User className="w-4 h-4" aria-hidden="true" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="relative flex items-center">
                                        <button
                                            ref={accountBtnRef}
                                            type="button"
                                            className={iconBtn}
                                            onClick={() => setIsAccountMenuOpen((v) => !v)}
                                            aria-haspopup="menu"
                                            aria-expanded={isAccountMenuOpen}
                                            aria-controls="account-menu"
                                        >
                                            <User className="w-4 h-4" aria-hidden="true" />
                                        </button>

                                        <AnimatePresence>
                                          {isAccountMenuOpen && (
                                            <motion.div
                                              id="account-menu"
                                              ref={accountMenuRef}
                                              initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                              animate={{ opacity: 1, y: 0, scale: 1 }}
                                              exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                              transition={{ duration: 0.18, ease: 'easeOut' }}
                                              className="absolute right-0 md:left-1/2 top-full md:-translate-x-1/2 mt-2 w-48 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#2A2A2B] shadow-2xl z-50 overflow-hidden origin-top"
                                              role="menu"
                                              aria-busy={loggingOut}
                                            >
                                              {/* caret */}
                                              <span className="hidden md:block absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-white/10 border-l border-t border-gray-200 rotate-45" />
                                              <button
                                                type="button"
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-[#F8C6D7]/10 focus:bg-[#F8C6D7]/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#F8C6D7] flex items-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:focus:bg-transparent"
                                                onClick={() => { setIsAccountMenuOpen(false); navigate('/account'); }}
                                                role="menuitem"
                                                disabled={loggingOut || isOnAccount}
                                                aria-disabled={loggingOut || isOnAccount}
                                              >
                                                <User className="w-4 h-4" aria-hidden="true" />
                                                <span>Мой профиль</span>
                                              </button>
                                              <div className="h-px bg-gray-100 dark:bg-white/10" />
                                              <button
                                                type="button"
                                                className={`w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-[#F8C6D7]/10 focus:bg-[#F8C6D7]/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#F8C6D7] flex items-center gap-3 ${loggingOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                onClick={handleLogout}
                                                role="menuitem"
                                                disabled={loggingOut}
                                                aria-busy={loggingOut}
                                              >
                                                {loggingOut ? (
                                                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                                ) : (
                                                  <LogOut className="w-4 h-4" aria-hidden="true" />
                                                )}
                                                <span>{loggingOut ? 'Выходим…' : 'Выход'}</span>
                                              </button>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                        <span aria-hidden="true" className="absolute pointer-events-none" />
                                    </div>
                                )}

                                {/* Search - desktop only (mobile search is on left) */}
                                <button type="button" className={`${iconBtn} hidden md:block`}>
                                    <Search className="w-4 h-4" aria-hidden="true" />
                                </button>

                                {/* Cart */}
                                <button
                                    type="button"
                                    className={`${iconBtn} cursor-pointer`}
                                    onClick={() => navigate('/cart')}
                                >
                                    <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                                    <AnimatePresence>
                                        {itemsCount > 0 && (
                                            <motion.span
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute -top-2 -right-2 bg-[#F8C6D7] text-black text-xs font-semibold
                                                           rounded-full w-4 h-4 flex items-center justify-center"
                                            >
                                                {itemsCount}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-[#CCC] dark:bg-white/10" />
            </header>

            {/* Drawer */}
            <HeaderDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </>
    );
};
