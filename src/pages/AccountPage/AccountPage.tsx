import { selectUser } from '@/store/userSlice';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GuestIcon from '@/assets/GuestIcon.svg';
import { FavoritesTab } from '@/pages/AccountPage/Tabs/FavoritesTab.tsx';
import { ProfileTab } from '@/pages/AccountPage/Tabs/ProfileTab.tsx';
// import { SecurityTab } from '@/pages/AccountPage/Tabs/SecurityTab.tsx';
// import { OrdersTab } from '@/pages/AccountPage/Tabs/OrdersTab.tsx';
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
    ];

    const handleTabClick = (tabPath: string, disabled: boolean) => {
        if (!disabled) navigate(tabPath);
    };

    return (
        <>
        <div className="flex min-h-180">
            {/* Левая часть */}
            <div className="w-1/4 border-r border-[#CCCCCC] pt-[40px]">
                {/* Блок с аватаром и именем */}
                <div className="flex items-center mb-[70px] pl-[40px]">
                    <img
                        src={GuestIcon}
                        alt="Пользователь"
                        className="w-[82px] h-[82px] rounded-full object-cover"
                    />
                    <div className="ml-[20px] text-[14px] leading-[18px] uppercase">
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
                <nav>
                    <div className="border-b border-[#CCCCCC]" />
                    {tabs.map((tab) => {
                        const isActive = location.pathname === tab.path;
                        const disabled = !initialized || (isGuest && tab.label !== 'Избранное');
                        return (
                            <div key={tab.path}>
                                <button
                                    disabled={disabled}
                                    onClick={() => handleTabClick(tab.path, disabled)}
                                    className={`w-full text-left h-[56px] flex items-center pl-[40px] text-[16px] leading-[18px] uppercase transition-colors ${
                                        disabled
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : isActive
                                                ? 'bg-[#F8C6D7]'
                                                : 'hover:bg-[#F8C6D7]/40'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                                <div className="border-b border-[#CCCCCC]" />
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Правая часть */}
            <div className="w-3/4 p-10">
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
                                        <ProfileTab />
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
                                        <></>
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
                                        <></>
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
                                        <></>
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
                            {/* 🧭 По умолчанию открываем личную информацию */}
                            <Route path="*" element={<Navigate to="/account/profile" replace />} />
                        </Routes>
                    )}
                </AnimatePresence>
            </div>
        </div>
        <div className="w-full border-t border-[#CCCCCC]" />
            </>
    );
};