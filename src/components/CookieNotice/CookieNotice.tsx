import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/axios/api.ts';
import { useNotifications } from '@/hooks/useNotifications.ts';
import { useDispatch } from 'react-redux';
import { setUserData, setAuthenticated } from '@/store/userSlice.ts';
import { Service } from '@/api/services/Service.ts';
import { setCartId } from '@/store/cartSlice';
import { setWishlistId } from '@/store/wishlistSlice';
import { type AppDispatch, initApp } from '@/store'; // импортируем initApp и store

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

const AUTH_LS_KEY = 'wasAuthed';

// ---- cookie helpers ----
const getCookie = (name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
};

const setCookie = (name: string, value: string, days: number): void => {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; Secure; SameSite=Lax`;
};

// ---- session helpers ----
const ensureSessionId = (): string => {
    let sid = getCookie(CONFIG.cookieName);
    if (!sid) {
        sid = crypto.randomUUID();
        setCookie(CONFIG.cookieName, sid, CONFIG.cookieMaxAgeDays);
    }
    return sid;
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

// ---- UI: Notice Banner ----
interface NoticeBannerProps {
    onClose: () => void;
}

const NoticeBanner: React.FC<NoticeBannerProps> = ({ onClose }) => (
    <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed inset-x-0 bottom-0 z-50 p-4"
    >
        <div className="mx-auto max-w-4xl rounded-xl bg-white/95 dark:bg-white/10 backdrop-blur shadow-lg ring-1 ring-black/10">
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-gray-700 dark:text-gray-200">
                    Мы используем файлы cookie, чтобы улучшить работу сайта и ваш
                    пользовательский опыт. Продолжая использовать наш сайт, вы соглашаетесь
                    с нашей{' '}
                    <a
                        href="/privacy.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600"
                    >
                        политикой использования cookie
                    </a>
                    .
                </p>
                <button
                    onClick={onClose}
                    className="shrink-0 px-4 py-2 rounded-xl text-black uppercase bg-[#F8C6D7] hover:bg-[#f5b6ca] transition cursor-pointer"
                >
                    Ок
                </button>
            </div>
        </div>
    </motion.div>
);

// ---- Main Component ----
export const CookieNotice = () => {
    const [showNotice, setShowNotice] = useState<boolean>(
        !getCookie(CONFIG.noticeCookie)
    );
    const { addNotification } = useNotifications();
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const init = async () => {
            // кем был пользователь до перезагрузки
            const prevWasAuthed = localStorage.getItem(AUTH_LS_KEY) === '1';

            // 0) сначала пробуем тихий refresh (httpOnly cookie на бэке)
            let refreshOK = false;
            try {
                const res = await Service.refresh();
                if (res?.accessToken) {
                    const accessTokenExpiresAt =
                        typeof res.accessTokenExpiresIn === 'number'
                            ? Date.now() + res.accessTokenExpiresIn * 1000
                            : undefined;

                    dispatch(setAuthenticated(true));
                    dispatch(setUserData({
                        accessToken: res.accessToken!,
                        accessTokenExpiresAt: accessTokenExpiresAt ?? null,
                    }));

                    localStorage.setItem(AUTH_LS_KEY, '1');
                    refreshOK = true;
                }
            } catch {
                // рефреш не удался — решим ниже
            }

            // поддерживаем cookie notice независимо от статуса
            if (getCookie(CONFIG.noticeCookie)) {
                setCookie(CONFIG.noticeCookie, '1', CONFIG.cookieMaxAgeDays);
            }

            // 1) sessionId стратегия
            //    refreshOK === true → оставляем текущий sid
            //    refreshOK === false:
            //       - если раньше был авторизован → меняем sid
            //       - если был гостем → оставляем текущий sid
            let sid = ensureSessionId();
            if (!refreshOK) {
                // Меняем sessionId ТОЛЬКО если до перезагрузки пользователь был авторизован
                if (prevWasAuthed) {
                    sid = crypto.randomUUID();
                    setCookie(CONFIG.cookieName, sid, CONFIG.cookieMaxAgeDays);
                }
                localStorage.setItem(AUTH_LS_KEY, '0');
            } else {
                localStorage.setItem(AUTH_LS_KEY, '1');
            }

            // 2) регистрируем текущую сессию
            try {
                const res = await sendSessionToServer();

                if (res.data?.cartId) dispatch(setCartId(res.data.cartId));
                if (res.data?.wishlistId) dispatch(setWishlistId(res.data.wishlistId));

                // 3) инициализация без повторного silent refresh
                dispatch(initApp({ userId: res.data?.userId, skipSilentRefresh: true }));
            } catch (error: any) {
                addNotification(error?.message || 'Не удалось инициализировать сессию', 'error');
            }
        };

        init();

        // поддерживаем sessionId/notice раз в час
        const iv = setInterval(() => {
            const sid = ensureSessionId();
            setCookie(CONFIG.cookieName, sid, CONFIG.cookieMaxAgeDays);
            if (getCookie(CONFIG.noticeCookie)) {
                setCookie(CONFIG.noticeCookie, '1', CONFIG.cookieMaxAgeDays);
            }
        }, 60 * 60 * 1000);

        return () => clearInterval(iv);
    }, [dispatch, addNotification]);

    const closeNotice = () => {
        setCookie(CONFIG.noticeCookie, '1', CONFIG.cookieMaxAgeDays);
        setShowNotice(false);
    };

    return (
        <AnimatePresence>
            {showNotice && <NoticeBanner onClose={closeNotice} />}
        </AnimatePresence>
    );
};
