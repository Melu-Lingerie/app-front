import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { X, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type SubMenuType = 'customers' | 'community' | null;

type HeaderDrawerProps = { open: boolean; onClose: () => void };

export const HeaderDrawer = ({ open, onClose }: HeaderDrawerProps) => {
    const navigate = useNavigate();
    const closeBtnRef = useRef<HTMLButtonElement | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [subMenu, setSubMenu] = useState<SubMenuType>(null);
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [subscribeEmail, setSubscribeEmail] = useState('');
    const [agreeMarketing, setAgreeMarketing] = useState(false);
    const [agreePolicy, setAgreePolicy] = useState(false);

    // Desktop states
    const [entering, setEntering] = useState(false);
    const [showSecondColumn, setShowSecondColumn] = useState(false);
    const hideSecondColumnTimerRef = useRef<number | null>(null);

    const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() =>
        document.documentElement.classList.contains('dark')
    );

    // Responsive check
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Синхронизация темы при открытии drawer и при изменении storage
    useEffect(() => {
        const sync = () => setIsDarkTheme(document.documentElement.classList.contains('dark'));

        // Синхронизируем при открытии
        if (open) {
            sync();
        }

        window.addEventListener('storage', sync);
        return () => window.removeEventListener('storage', sync);
    }, [open]);

    const toggleTheme = (dark: boolean) => {
        document.documentElement.classList.toggle('dark', dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
        setIsDarkTheme(dark);
    };

    // Desktop hover helpers
    const cancelHideSecondColumn = () => {
        if (hideSecondColumnTimerRef.current !== null) {
            window.clearTimeout(hideSecondColumnTimerRef.current);
            hideSecondColumnTimerRef.current = null;
        }
    };

    const scheduleHideSecondColumn = (delay = 120) => {
        cancelHideSecondColumn();
        hideSecondColumnTimerRef.current = window.setTimeout(() => {
            setShowSecondColumn(false);
            hideSecondColumnTimerRef.current = null;
        }, delay);
    };

    const blockPointer = (e: React.MouseEvent | React.TouchEvent) => {
        if (entering) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    const onAsideAnimationComplete = () => setEntering(false);

    // Open/close effects
    useEffect(() => {
        if (!open) {
            setSubMenu(null);
            setShowSubscribeModal(false);
            cancelHideSecondColumn();
            setShowSecondColumn(false);
            return;
        }
        setEntering(true);
        const prev = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        setTimeout(() => closeBtnRef.current?.focus(), 0);
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.documentElement.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
            cancelHideSecondColumn();
        };
    }, [open, onClose]);

    // Navigation helpers
    const goSort = (value: string) => {
        const params = new URLSearchParams({ sort: value });
        navigate(`/catalog?${params.toString()}`);
        onClose();
    };

    const goCatalog = () => {
        navigate('/catalog');
        onClose();
    };

    const goTo = (path: string) => {
        navigate(path);
        onClose();
    };

    // Animation variants
    const listV = { hidden: {}, show: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } } };
    const itemV = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.18 } } };

    // ========== MOBILE MENU ==========
    const renderMobileMenu = () => (
        <motion.aside
            key="drawer-mobile"
            className="fixed inset-0 bg-white dark:bg-[#1F1F20] z-[61] flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            role="dialog"
            aria-modal="true"
            aria-label="Навигация"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-[50px] border-b-2 border-[#F2E553]">
                {subMenu ? (
                    <button
                        type="button"
                        onClick={() => setSubMenu(null)}
                        className="flex items-center gap-2 text-[14px] uppercase cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Назад</span>
                    </button>
                ) : (
                    <button
                        ref={closeBtnRef}
                        type="button"
                        onClick={onClose}
                        className="flex items-center gap-2 text-[14px] uppercase cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                        <span>Закрыть</span>
                    </button>
                )}

                <div className="flex items-center gap-4">
                    {/* Language switcher */}
                    <div className="flex items-center gap-1 text-[12px] uppercase">
                        <span className="text-black dark:text-white">RU</span>
                        <span className="text-[#999]">/</span>
                        <span className="text-[#999]">ENG</span>
                    </div>

                    {/* Theme switcher */}
                    <div className="flex items-center gap-1 text-[12px] uppercase">
                        <button
                            type="button"
                            onClick={() => toggleTheme(false)}
                            className={`cursor-pointer ${!isDarkTheme ? 'text-black dark:text-white' : 'text-[#999]'}`}
                        >
                            Дневная
                        </button>
                        <span className="text-[#999]">/</span>
                        <button
                            type="button"
                            onClick={() => toggleTheme(true)}
                            className={`cursor-pointer ${isDarkTheme ? 'text-black dark:text-white' : 'text-[#999]'}`}
                        >
                            Ночная
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pt-6">
                <AnimatePresence mode="wait">
                    {!subMenu && (
                        <motion.div
                            key="main-menu"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <nav className="flex flex-col gap-5">
                                <button type="button" onClick={() => goSort('Новинки')} className="text-left text-[14px] uppercase cursor-pointer">
                                    Новинки
                                </button>
                                <button type="button" onClick={goCatalog} className="text-left text-[14px] uppercase cursor-pointer">
                                    Каталог
                                </button>
                                <button type="button" onClick={() => goSort('Скоро в продаже')} className="text-left text-[14px] uppercase cursor-pointer">
                                    Скоро в продаже
                                </button>
                                <button type="button" className="text-left text-[14px] uppercase cursor-pointer">
                                    Sale
                                </button>
                                <button type="button" onClick={() => goTo('/gift-certificate')} className="text-left text-[14px] uppercase cursor-pointer">
                                    Подарочный сертификат
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSubMenu('customers')}
                                    className="flex items-center justify-between text-[14px] uppercase cursor-pointer"
                                >
                                    <span>Покупателям</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button type="button" onClick={() => goTo('/about')} className="text-left text-[14px] uppercase cursor-pointer">
                                    О нас
                                </button>
                                <button type="button" className="text-left text-[14px] uppercase cursor-pointer">
                                    Документы
                                </button>
                                <button type="button" onClick={() => goTo('/contacts')} className="text-left text-[14px] uppercase cursor-pointer">
                                    Контакты
                                </button>
                            </nav>
                        </motion.div>
                    )}

                    {subMenu === 'customers' && (
                        <motion.div
                            key="customers-menu"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="text-[14px] uppercase text-[#999] mb-5">Покупателям</div>
                            <nav className="flex flex-col gap-5">
                                <button type="button" onClick={() => goTo('/customers/delivery')} className="text-left text-[14px] uppercase cursor-pointer">
                                    Доставка
                                </button>
                                <button type="button" onClick={() => goTo('/customers/returns')} className="text-left text-[14px] uppercase cursor-pointer">
                                    Возврат
                                </button>
                                <button type="button" onClick={() => goTo('/customers/faq')} className="text-left text-[14px] uppercase cursor-pointer">
                                    Вопрос-ответ
                                </button>
                                <button type="button" className="text-left text-[14px] uppercase cursor-pointer">
                                    Отзывы
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSubMenu('community')}
                                    className="flex items-center justify-between text-[14px] uppercase cursor-pointer"
                                >
                                    <span>Комьюнити</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button type="button" onClick={() => goTo('/customers/care')} className="text-left text-[14px] uppercase cursor-pointer">
                                    Уход за изделиями
                                </button>
                            </nav>
                        </motion.div>
                    )}

                    {subMenu === 'community' && (
                        <motion.div
                            key="community-menu"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="text-[14px] uppercase text-[#999] mb-5">Комьюнити</div>
                            <nav className="flex flex-col gap-5">
                                <button type="button" className="text-left text-[14px] uppercase cursor-pointer">
                                    Все
                                </button>
                                <button type="button" className="text-left text-[14px] uppercase cursor-pointer">
                                    Наши герои
                                </button>
                                <button type="button" className="text-left text-[14px] uppercase cursor-pointer">
                                    UGC — твой вкус
                                </button>
                                <button type="button" className="text-left text-[14px] uppercase cursor-pointer">
                                    Выбор блогера
                                </button>
                                <button
                                    type="button"
                                    className="flex items-center justify-between text-[14px] uppercase cursor-pointer"
                                >
                                    <span>Стилист рекомендует</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button type="button" className="text-left text-[14px] uppercase cursor-pointer">
                                    Интервью
                                </button>
                                <button type="button" className="text-left text-[14px] uppercase cursor-pointer">
                                    Лайфстайл
                                </button>
                                <button type="button" className="text-left text-[14px] uppercase cursor-pointer">
                                    Эксперименты
                                </button>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer - Subscribe & Social */}
            {!subMenu && (
                <div className="px-4 pb-6 pt-4 border-t border-[#E5E5E5] dark:border-white/10">
                    <div className="text-[12px] uppercase mb-2">Подписаться на рассылку</div>
                    <p className="text-[12px] text-[#999] mb-4">
                        Наши подписчики в курсе всех новинок и специальных предложений
                    </p>
                    <button
                        type="button"
                        onClick={() => setShowSubscribeModal(true)}
                        className="w-full h-[44px] bg-[#F8C6D7] text-[14px] uppercase rounded-none cursor-pointer hover:bg-[#f0b4c7] transition-colors"
                    >
                        Подписаться
                    </button>

                    <div className="flex items-center justify-between mt-6 text-[12px] uppercase">
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70">
                            YouTube
                        </a>
                        <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70">
                            VK
                        </a>
                        <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="hover:opacity-70">
                            Telegram
                        </a>
                    </div>
                </div>
            )}

            {/* Subscribe Modal */}
            <AnimatePresence>
                {showSubscribeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 z-10 flex items-start justify-center pt-20"
                        onClick={() => setShowSubscribeModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white dark:bg-[#2A2A2B] w-[calc(100%-32px)] max-w-[360px] p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[14px] uppercase">Подписаться</span>
                                <button
                                    type="button"
                                    onClick={() => setShowSubscribeModal(false)}
                                    className="cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <label className="text-[12px] uppercase text-[#999] mb-2 block">E-mail</label>
                                <input
                                    type="email"
                                    value={subscribeEmail}
                                    onChange={(e) => setSubscribeEmail(e.target.value)}
                                    placeholder="Ввести e-mail"
                                    className="w-full h-[44px] border border-[#E5E5E5] dark:border-white/20 px-4 text-[14px] bg-transparent outline-none focus:border-[#F8C6D7]"
                                />
                            </div>

                            <div className="flex flex-col gap-3 mb-6">
                                <label className="flex items-start gap-3 text-[11px] text-[#999] cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={agreeMarketing}
                                        onChange={(e) => setAgreeMarketing(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 accent-[#F8C6D7]"
                                    />
                                    <span>
                                        Я согласен(-на) на получение рекламно-информационной рассылки (e-mail, whatsapp, sms).
                                    </span>
                                </label>
                                <label className="flex items-start gap-3 text-[11px] text-[#999] cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={agreePolicy}
                                        onChange={(e) => setAgreePolicy(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 accent-[#F8C6D7]"
                                    />
                                    <span>
                                        Я согласен(-на) с{' '}
                                        <a href="/policy" className="underline">политикой конфиденциальности</a> и{' '}
                                        <a href="/offer" className="underline">договором оферты</a>
                                    </span>
                                </label>
                            </div>

                            <button
                                type="button"
                                disabled={!subscribeEmail || !agreeMarketing || !agreePolicy}
                                className="w-full h-[44px] bg-[#F8C6D7] text-[14px] uppercase cursor-pointer hover:bg-[#f0b4c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Подписаться
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.aside>
    );

    // ========== DESKTOP MENU ==========
    const renderDesktopMenu = () => (
        <>
            {/* overlay */}
            <motion.div
                key="drawer-overlay"
                className="fixed inset-0 bg-black/30 backdrop-blur-sm backdrop-saturate-150 z-[60]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
            />

            {/* drawer */}
            <motion.aside
                id="left-drawer"
                key="drawer-panel"
                className="fixed left-0 top-0 h-screen bg-white/90 supports-[backdrop-filter]:bg-white/80 dark:bg-[#1F1F20]/95 dark:supports-[backdrop-filter]:bg-[#1F1F20]/90 backdrop-blur-md backdrop-saturate-150 z-[61] shadow-2xl ring-1 ring-black/5 dark:ring-white/10 rounded-r-2xl focus:outline-none"
                initial={{ x: -1000, width: 465 }}
                animate={{ x: 0, width: showSecondColumn ? 931 : 465 }}
                exit={{ x: -1000, width: 465 }}
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                role="dialog"
                aria-modal="true"
                aria-label="Навигация"
                onAnimationComplete={onAsideAnimationComplete}
                onMouseDown={blockPointer}
                onClick={blockPointer}
                onTouchStart={blockPointer}
                aria-busy={entering}
            >
                {/* Drawer Header */}
                <div className="h-[49px] px-10 flex items-center justify-between">
                    <button
                        ref={closeBtnRef}
                        type="button"
                        onClick={onClose}
                        className="flex items-center text-sm cursor-pointer"
                    >
                        <X className="w-[22px] h-[22px]" aria-hidden="true" />
                        <span className="ml-[6px] text-[14px] leading-[18px] uppercase">закрыть</span>
                    </button>

                    <div className="flex items-center gap-6">
                        {/* Language */}
                        <div className="flex items-center gap-1 text-[12px] uppercase">
                            <span className="text-black dark:text-white">RU</span>
                            <span className="text-[#999]">/</span>
                            <span className="text-[#999]">ENG</span>
                        </div>

                        {/* Theme */}
                        <div className="flex items-center gap-1 text-[12px] uppercase">
                            <button
                                type="button"
                                onClick={() => toggleTheme(false)}
                                className={`cursor-pointer ${!isDarkTheme ? 'text-black dark:text-white' : 'text-[#999]'}`}
                            >
                                Дневная
                            </button>
                            <span className="text-[#999]">/</span>
                            <button
                                type="button"
                                onClick={() => toggleTheme(true)}
                                className={`cursor-pointer ${isDarkTheme ? 'text-black dark:text-white' : 'text-[#999]'}`}
                            >
                                Ночная
                            </button>
                        </div>
                    </div>
                </div>
                <div className="w-full h-[2px] bg-[#F2E553]" />

                {/* Drawer Content */}
                <motion.div
                    className="flex h-[calc(100%-51px)] px-0"
                    variants={listV}
                    initial="hidden"
                    animate="show"
                >
                    {/* Column 1 */}
                    <div className="w-[465px] shrink-0 pt-15 pl-10">
                        <motion.button
                            type="button"
                            onClick={() => goSort('Новинки')}
                            className="w-full flex items-center text-left text-[14px] leading-[18px] uppercase mb-[20px] cursor-pointer transition-colors hover:opacity-70"
                            variants={itemV}
                        >
                            Новинки
                        </motion.button>
                        <motion.button
                            type="button"
                            onClick={goCatalog}
                            className="w-full flex items-center text-left text-[14px] leading-[18px] uppercase mb-[20px] cursor-pointer transition-colors hover:opacity-70"
                            variants={itemV}
                        >
                            Каталог
                        </motion.button>
                        <motion.button
                            type="button"
                            onClick={() => goSort('Скоро в продаже')}
                            className="w-full flex items-center text-left text-[14px] leading-[18px] uppercase mb-[20px] cursor-pointer transition-colors hover:opacity-70"
                            variants={itemV}
                        >
                            Скоро в продаже
                        </motion.button>
                        <motion.button
                            type="button"
                            className="w-full block text-left text-[14px] leading-[18px] uppercase mb-[20px] transition-colors hover:opacity-70"
                            variants={itemV}
                        >
                            Sale
                        </motion.button>
                        <motion.button
                            type="button"
                            onClick={() => goTo('/gift-certificate')}
                            className="w-full block text-left text-[14px] leading-[18px] uppercase mb-[20px] cursor-pointer transition-colors hover:opacity-70"
                            variants={itemV}
                        >
                            Подарочный сертификат
                        </motion.button>
                        <motion.button
                            type="button"
                            onMouseEnter={() => {
                                cancelHideSecondColumn();
                                setShowSecondColumn(true);
                            }}
                            onMouseLeave={() => scheduleHideSecondColumn(120)}
                            className="w-full flex items-center justify-between text-left text-[14px] leading-[18px] uppercase mb-[20px] cursor-pointer transition-colors hover:opacity-70"
                            variants={itemV}
                        >
                            <span>Покупателям</span>
                            <ChevronRight className="w-[18px] h-[18px]" aria-hidden="true" />
                        </motion.button>
                        <motion.button
                            type="button"
                            onClick={() => goTo('/about')}
                            className="w-full block text-left text-[14px] leading-[18px] uppercase mb-[20px] cursor-pointer transition-colors hover:opacity-70"
                            variants={itemV}
                        >
                            О нас
                        </motion.button>
                        <motion.button
                            type="button"
                            className="w-full block text-left text-[14px] leading-[18px] uppercase mb-[20px] transition-colors hover:opacity-70"
                            variants={itemV}
                        >
                            Документы
                        </motion.button>
                        <motion.button
                            type="button"
                            onClick={() => goTo('/contacts')}
                            className="w-full block text-left text-[14px] leading-[18px] uppercase cursor-pointer transition-colors hover:opacity-70"
                            variants={itemV}
                        >
                            Контакты
                        </motion.button>
                    </div>

                    {showSecondColumn && (
                        <>
                            {/* Divider */}
                            <div className="w-px bg-[#CCCCCC]/80 dark:bg-white/10 self-stretch" />

                            {/* Column 2 */}
                            <div
                                className="w-[465px] shrink-0 pt-15 pl-10"
                                onMouseEnter={() => {
                                    cancelHideSecondColumn();
                                    setShowSecondColumn(true);
                                }}
                                onMouseLeave={() => scheduleHideSecondColumn(80)}
                            >
                                <motion.div className="text-[14px] leading-[18px] text-[#999999] uppercase mb-[20px]" variants={itemV}>
                                    покупателям
                                </motion.div>
                                <motion.button
                                    type="button"
                                    className="cursor-pointer w-full block text-left text-[14px] leading-[18px] uppercase mb-[20px] transition-colors hover:opacity-70"
                                    variants={itemV}
                                    onClick={() => goTo('/customers/delivery')}
                                >
                                    Доставка
                                </motion.button>
                                <motion.button
                                    type="button"
                                    className="cursor-pointer w-full block text-left text-[14px] leading-[18px] uppercase mb-[20px] transition-colors hover:opacity-70"
                                    variants={itemV}
                                    onClick={() => goTo('/customers/returns')}
                                >
                                    Возврат
                                </motion.button>
                                <motion.button
                                    type="button"
                                    className="cursor-pointer w-full block text-left text-[14px] leading-[18px] uppercase mb-[20px] transition-colors hover:opacity-70"
                                    variants={itemV}
                                    onClick={() => goTo('/customers/faq')}
                                >
                                    Вопрос‒ответ
                                </motion.button>
                                <motion.button
                                    type="button"
                                    className="w-full block text-left text-[14px] leading-[18px] uppercase mb-[20px] transition-colors hover:opacity-70"
                                    variants={itemV}
                                >
                                    Отзывы
                                </motion.button>
                                <motion.button
                                    type="button"
                                    className="w-full block text-left text-[14px] leading-[18px] uppercase mb-[20px] transition-colors hover:opacity-70"
                                    variants={itemV}
                                >
                                    Комьюнити
                                </motion.button>
                                <motion.button
                                    type="button"
                                    className="cursor-pointer w-full block text-left text-[14px] leading-[18px] uppercase transition-colors hover:opacity-70"
                                    variants={itemV}
                                    onClick={() => goTo('/customers/care')}
                                >
                                    Уход за изделиями
                                </motion.button>
                            </div>
                        </>
                    )}
                </motion.div>
            </motion.aside>
        </>
    );

    return (
        <AnimatePresence>
            {open && (isMobile ? renderMobileMenu() : renderDesktopMenu())}
        </AnimatePresence>
    );
};