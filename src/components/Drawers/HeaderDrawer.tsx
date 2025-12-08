import {AnimatePresence, motion} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { X, Sparkles, Grid3X3, Hourglass, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type HeaderDrawerProps = { open: boolean; onClose: () => void };
export const HeaderDrawer = ({ open, onClose }: HeaderDrawerProps) => {
    const navigate = useNavigate();
    const goSort = (value: string) => {
        const params = new URLSearchParams({ sort: value });
        navigate(`/catalog?${params.toString()}`);
        onClose();
    };
    const goCatalog = () => {
        navigate('/catalog');
        onClose();
    };

    const closeBtnRef = useRef<HTMLButtonElement | null>(null);
    const [entering, setEntering] = useState(false);
    const [showSecondColumn, setShowSecondColumn] = useState(false);

    const hideSecondColumnTimerRef = useRef<number | null>(null);

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

    const blockPointer = (e: any) => {
        if (entering) {
            e.preventDefault();
            e.stopPropagation();
        }
    };
    const onAsideAnimationComplete = () => setEntering(false);

    useEffect(() => {
        if (!open) {
            cancelHideSecondColumn();
            setShowSecondColumn(false);
            return;
        }
        setEntering(true);
        const prev = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        // focus the close button when drawer opens
        setTimeout(() => closeBtnRef.current?.focus(), 0);
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => {
            document.documentElement.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
            cancelHideSecondColumn();
        };
    }, [open, onClose]);

    const listV = { hidden: {}, show: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } } };
    const itemV = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.18 } } };

    return (
        <AnimatePresence>
            {open && (
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
                        className="fixed left-0 top-0 h-screen bg-white/90 supports-[backdrop-filter]:bg-white/80 backdrop-blur-md backdrop-saturate-150 z-[61] shadow-2xl ring-1 ring-black/5 rounded-r-2xl focus:outline-none"
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
                        {/* Drawer Header: align with main header */}
                        <div className="h-[49px] px-10 flex items-center">
                            <button
                                ref={closeBtnRef}
                                type="button"
                                onClick={onClose}
                                className="flex items-center text-sm cursor-pointer"
                            >
                                <X className="w-[22px] h-[22px]" aria-hidden="true" />
                                <span className="ml-[6px] text-[14px] leading-[18px] uppercase">закрыть</span>
                            </button>
                        </div>
                        <div className="w-full h-px bg-[#CCC]" />

                        {/* Drawer Content: two fixed-width columns with a vertical divider */}
                        <motion.div
                            className="flex h-[calc(100%-50px)] px-0"
                            variants={listV}
                            initial="hidden"
                            animate="show"
                        >
                            {/* Column 1 */}
                            <div className="w-[465px] shrink-0 pt-15 pl-10">
                                <motion.button
                                    type="button"
                                    onClick={() => goSort('Новинки')}
                                    className="w-full flex items-center gap-3 text-left text-[14px] leading-[18px] uppercase mb-[20px] cursor-pointer transition-colors hover:bg-gray-50 rounded-md -mx-2 px-2"
                                    variants={itemV}
                                >
                                    <Sparkles className="w-[18px] h-[18px]" aria-hidden="true" />
                                    <span>Новинки</span>
                                </motion.button>
                                <motion.button
                                    type="button"
                                    onClick={goCatalog}
                                    className="w-full flex items-center gap-3 text-left text-[14px] leading-[18px] uppercase mb-[20px] cursor-pointer transition-colors hover:bg-gray-50 rounded-md -mx-2 px-2"
                                    variants={itemV}
                                >
                                    <Grid3X3 className="w-[18px] h-[18px]" aria-hidden="true" />
                                    <span>Каталог</span>
                                </motion.button>
                                <motion.button
                                    type="button"
                                    onClick={() => goSort('Скоро в продаже')}
                                    className="w-full flex items-center gap-3 text-left text-[14px] leading-[18px] uppercase mb-[20px] cursor-pointer transition-colors hover:bg-gray-50 rounded-md -mx-2 px-2"
                                    variants={itemV}
                                >
                                    <Hourglass className="w-[18px] h-[18px]" aria-hidden="true" />
                                    <span>Скоро в продаже</span>
                                </motion.button>
                                <motion.button
                                    type="button"
                                    className="w-full block text-left text-[14px] leading-[18px] uppercase mb-[20px] transition-colors hover:bg-gray-50 rounded-md -mx-2 px-2"
                                    variants={itemV}
                                >Sale</motion.button>
                                <motion.button
                                    type="button"
                                    className="w-full block text-left text-[14px] leading-[18px] uppercase mb-[20px] transition-colors hover:bg-gray-50 rounded-md -mx-2 px-2"
                                    variants={itemV}
                                >Подарочный сертификат</motion.button>
                                <motion.button
                                    type="button"
                                    onMouseEnter={() => {
                                        cancelHideSecondColumn();
                                        setShowSecondColumn(true);
                                    }}
                                    onMouseLeave={() => scheduleHideSecondColumn(120)}
                                    className="w-full flex items-center justify-between text-left text-[14px] leading-[18px] uppercase mb-[20px] cursor-pointer transition-colors hover:bg-gray-50 rounded-md -mx-2 px-2"
                                    variants={itemV}
                                >
                                    <span>Покупателям</span>
                                    <ChevronRight className="w-[18px] h-[18px]" aria-hidden="true" />
                                </motion.button>
                                <motion.button
                                    type="button"
                                    className="w-full block text-left text-[14px] leading-[18px] uppercase mb-[20px] transition-colors hover:bg-gray-50 rounded-md -mx-2 px-2"
                                    variants={itemV}
                                >О нас</motion.button>
                                <motion.button
                                    type="button"
                                    className="w-full block text-left text-[14px] leading-[18px] uppercase mb-[20px] transition-colors hover:bg-gray-50 rounded-md -mx-2 px-2"
                                    variants={itemV}
                                >Документы</motion.button>
                                <motion.button
                                    type="button"
                                    className="w-full block text-left text-[14px] leading-[18px] uppercase transition-colors hover:bg-gray-50 rounded-md -mx-2 px-2"
                                    variants={itemV}
                                >Контакты</motion.button>
                            </div>

                            {showSecondColumn && (
                                <>
                                    {/* Divider */}
                                    <div className="w-px bg-[#CCCCCC]/80 self-stretch" />

                                    {/* Column 2 */}
                                    <div
                                        className="w-[465px] shrink-0 pt-15 pl-10"
                                        onMouseEnter={() => {
                                            cancelHideSecondColumn();
                                            setShowSecondColumn(true);
                                        }}
                                        onMouseLeave={() => scheduleHideSecondColumn(80)}
                                    >
                                        <motion.div className="text-[14px] leading-[18px] text-[#999999] uppercase mb-[20px]" variants={itemV}>покупателям</motion.div>
                                        <motion.button
                                            type="button"
                                            className="cursor-pointer w-full block text-left text-[14px] leading-[18px] uppercase mb-[20px] transition-colors hover:bg-gray-50 rounded-md -mx-2 px-2"
                                            variants={itemV}
                                            onClick={() => {
                                                navigate('/customers/delivery');
                                                onClose();
                                            }}
                                        >Доставка</motion.button>
                                        <motion.button
                                            type="button"
                                            className="cursor-pointer w-full block text-left text-[14px] leading-[18px] uppercase mb-[20px] transition-colors hover:bg-gray-50 rounded-md -mx-2 px-2"
                                            variants={itemV}
                                            onClick={() => {
                                                navigate('/customers/returns');
                                                onClose();
                                            }}
                                        >Возврат</motion.button>
                                        <motion.button
                                            type="button"
                                            className="w-full block text-left text-[14px] leading-[18px] uppercase mb-[20px] transition-colors hover:bg-gray-50 rounded-md -mx-2 px-2"
                                            variants={itemV}
                                        >Вопрос‒ответ</motion.button>
                                        <motion.button
                                            type="button"
                                            className="w-full block text-left text-[14px] leading-[18px] uppercase mb-[20px] transition-colors hover:bg-gray-50 rounded-md -mx-2 px-2"
                                            variants={itemV}
                                        >Отзывы</motion.button>
                                        <motion.button
                                            type="button"
                                            className="w-full block text-left text-[14px] leading-[18px] uppercase mb-[20px] transition-colors hover:bg-gray-50 rounded-md -mx-2 px-2"
                                            variants={itemV}
                                        >Комьюнити</motion.button>
                                        <motion.button
                                            type="button"
                                            className="w-full block text-left text-[14px] leading-[18px] uppercase transition-colors hover:bg-gray-50 rounded-md -mx-2 px-2"
                                            variants={itemV}
                                        >Уход за изделиями</motion.button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
};