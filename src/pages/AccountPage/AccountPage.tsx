import { selectUser } from '@/store/userSlice';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GuestIcon from '@/assets/GuestIcon.svg';
import { FavoritesTab } from '@/pages/AccountPage/Tabs/FavoritesTab.tsx';
import { ProfileTab } from '@/pages/AccountPage/Tabs/ProfileTab.tsx';
import { LoyaltyTab } from '@/pages/AccountPage/Tabs/LoyaltyTab.tsx';
import { SecurityTab } from '@/pages/AccountPage/Tabs/SecurityTab.tsx';
import { OrdersTab } from '@/pages/AccountPage/Tabs/OrdersTab.tsx';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/userSlice';
import { selectAppInitialized } from '@/store/appSlice.ts';

export const AccountPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector(selectUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isGuest = !isAuthenticated;
    const initialized = useSelector(selectAppInitialized);
    const tabs = [
        { label: 'Личная информация', path: '/account/profile' },
        { label: 'Безопасность и уведомления', path: '/account/security' },
        { label: 'Мои заказы', path: '/account/orders' },
        { label: 'Избранное', path: '/account/favorites' },
        { label: 'Программа лояльности', path: '/account/loyalty' },
    ];

    const handleTabClick = (tabPath: string, disabled: boolean) => {
        if (!disabled) navigate(tabPath);
    };

    return (
        <>
        <div className="flex flex-col md:flex-row min-h-180">
            {/* Левая часть / верхняя на мобилке */}
            <div className="w-full md:w-1/4 md:border-r border-b md:border-b-0 border-[#CCCCCC] dark:border-white/10 pt-[20px] md:pt-[40px] pb-[20px] md:pb-0">
                {/* Блок с аватаром и именем */}
                <div className="flex items-center mb-[20px] md:mb-[70px] pl-[16px] md:pl-[40px]">
                    <img
                        src={GuestIcon}
                        alt="Пользователь"
                        className="w-[48px] h-[48px] md:w-[82px] md:h-[82px] rounded-full object-cover"
                    />
                    <div className="ml-[12px] md:ml-[20px] text-[13px] md:text-[14px] leading-[18px] uppercase">
                        {(!initialized) ? (
                            <div className="w-[120px] h-[18px] bg-gray-300 animate-pulse rounded" />
                        ) : (
                            <p>
                                {isAuthenticated
                                    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Без имени'
                                    : 'Гость'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Навигация по вкладкам */}
                <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible">
                    <div className="hidden md:block border-b border-[#CCCCCC] dark:border-white/10" />
                    {tabs.map((tab) => {
                        const isActive = location.pathname === tab.path;
                        const disabled = !initialized || (isGuest && tab.label !== 'Избранное' && tab.label !== 'Программа лояльности');
                        return (
                            <div key={tab.path} className="flex-shrink-0 md:flex-shrink">
                                <button
                                    disabled={disabled}
                                    onClick={() => handleTabClick(tab.path, disabled)}
                                    className={`w-full text-left h-[44px] md:h-[56px] flex items-center px-[16px] md:pl-[40px] md:pr-0 text-[12px] md:text-[16px] leading-[18px] uppercase whitespace-nowrap transition-colors ${
                                        disabled
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : isActive
                                                ? 'bg-[#F8C6D7]'
                                                : 'hover:bg-[#F8C6D7]/40'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                                <div className="hidden md:block border-b border-[#CCCCCC] dark:border-white/10" />
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Правая часть / нижняя на мобилке */}
            <div className="w-full md:w-3/4 p-4 md:p-10">
                <AnimatePresence mode="wait">
                    {!initialized ? (
                        <Routes location={location} key={location.pathname}>
                            <Route
                                path="favorites"
                                element={
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <FavoritesTab />
                                    </motion.div>
                                }
                            />
                            <Route
                                path="profile"
                                element={
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <ProfileTab />
                                    </motion.div>
                                }
                            />
                            <Route
                                path="security"
                                element={
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <SecurityTab />
                                    </motion.div>
                                }
                            />
                            <Route
                                path="orders"
                                element={
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <OrdersTab />
                                    </motion.div>
                                }
                            />
                            {/* Пока приложение не инициализировано — не делаем редиректов, оставляем URL как есть */}
                            <Route path="*" element={<></>} />
                        </Routes>
                    ) : isGuest ? (
                        <Routes location={location} key={location.pathname}>
                            <Route
                                path="favorites"
                                element={
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <FavoritesTab />
                                    </motion.div>
                                }
                            />
                            {/* 🧭 Любой другой путь гостя ведёт в избранное */}
                            <Route path="*" element={<Navigate to="/account/favorites" replace />} />
                        </Routes>
                    ) : (
                        <Routes location={location} key={location.pathname}>
                            <Route
                                path="profile"
                                element={
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <ProfileTab />
                                    </motion.div>
                                }
                            />
                            <Route
                                path="security"
                                element={
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <SecurityTab />
                                    </motion.div>
                                }
                            />
                            <Route
                                path="orders"
                                element={
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <OrdersTab />
                                    </motion.div>
                                }
                            />
                            <Route
                                path="favorites"
                                element={
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <FavoritesTab />
                                    </motion.div>
                                }
                            />
                            <Route
                                path="loyalty"
                                element={
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <LoyaltyTab />
                                    </motion.div>
                                }
                            />
                            {/* 🧭 По умолчанию открываем личную информацию */}
                            <Route path="*" element={<Navigate to="/account/profile" replace />} />
                        </Routes>
                    )}
                </AnimatePresence>
            </div>
        </div>
        <div className="w-full border-t border-[#CCCCCC] dark:border-white/10" />
            </>
    );
};