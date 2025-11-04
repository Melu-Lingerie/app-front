import {useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';

export const FallbackHeroCreative = ({ onRetry, disabled }: { onRetry: () => void; disabled?: boolean }) => {
    const [pulseKey, setPulseKey] = useState(0);
    const [online, setOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

    useEffect(() => {
        const on = () => setOnline(true);
        const off = () => setOnline(false);
        window.addEventListener('online', on);
        window.addEventListener('offline', off);
        return () => {
            window.removeEventListener('online', on);
            window.removeEventListener('offline', off);
        };
    }, []);

    const clickRetry = () => {
        if (disabled) return;
        setPulseKey((k) => k + 1);
        onRetry();
    };

    return (
        <div className="relative w-full aspect-[16/9] md:min-h-[620px] overflow-hidden">
            {/* Слой 1: градиенты, медленное движение */}
            <motion.div
                className="absolute inset-0"
                style={{
                    background:
                        'radial-gradient(1000px 700px at 15% 10%, rgba(255,255,255,0.5) 0%, transparent 60%),' +
                        'radial-gradient(900px 600px at 85% 25%, rgba(248,198,215,0.55) 0%, transparent 60%),' +
                        'conic-gradient(from 210deg at 50% 50%, #F8C6D7 0%, #FFE7EF 25%, #DFF5FF 50%, #FFE7EF 75%, #F8C6D7 100%)',
                    backgroundSize: '200% 200%, 200% 200%, 200% 200%',
                    filter: 'saturate(110%)',
                }}
                animate={{ backgroundPosition: ['0% 0%, 100% 0%, 0% 0%', '100% 100%, 0% 100%, 100% 100%'] }}
                transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            />
            {/* Слой 2: блюры-пятна */}
            <motion.div
                className="absolute -left-24 -top-24 w-[42vw] h-[42vw] rounded-full bg-[#F8C6D7]/35 blur-3xl"
                animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute -right-20 bottom-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#CDEBFF]/35 blur-3xl"
                animate={{ y: [0, -25, 0], x: [0, -15, 0] }}
                transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Слой 3: тонкая сетка */}
            <svg className="absolute inset-0 opacity-[0.09] mix-blend-overlay pointer-events-none">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Контент */}
            <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-4">
                <motion.h1
                    className="text-black text-[42px] md:text-[62px] leading-[1.05] uppercase drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                    Что-то пошло не так
                </motion.h1>
                <div className="w-[60%] max-w-[640px] border-t-2 border-black/30 my-6" />

                <div className="relative mb-[60px]">
                    {/* Аура */}
                    <motion.div
                        aria-hidden
                        className="absolute -inset-1 rounded-2xl blur-xl"
                        style={{
                            background:
                                'conic-gradient(from 0deg, rgba(248,198,215,0.9), rgba(255,231,239,0.9), rgba(205,235,255,0.9), rgba(248,198,215,0.9))',
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    />
                    {/* Рипл */}
                    <AnimatePresence>
                        <motion.span
                            key={pulseKey}
                            className="pointer-events-none absolute inset-0 rounded-2xl"
                            initial={{ opacity: 0.35, scale: 0.9 }}
                            animate={{ opacity: 0, scale: 1.25 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.55, ease: 'easeOut' }}
                            style={{
                                background: 'radial-gradient(120% 120% at 50% 50%, rgba(255,255,255,0.8), rgba(255,255,255,0))',
                            }}
                        />
                    </AnimatePresence>

                    <motion.button
                        type="button"
                        onClick={clickRetry}
                        disabled={disabled}
                        className="relative z-10 inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-white/85 backdrop-blur-md border border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] text-black uppercase hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 active:scale-[0.98] transition disabled:opacity-60"
                        whileTap={{ scale: disabled ? 1 : 0.97 }}
                        aria-label="Повторить загрузку баннеров"
                    >
                        <motion.span
                            key={`icon-${pulseKey}`}
                            className="inline-block"
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.6, ease: 'easeInOut' }}
                        >
                            ↻
                        </motion.span>
                        Повторить
                    </motion.button>
                </div>

                {!online && (
                    <motion.div
                        className="mb-6 px-3 py-1 rounded-full bg-black/60 text-white text-xs"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Похоже, вы офлайн. Попробуйте снова после подключения.
                    </motion.div>
                )}
            </div>
        </div>
    );
};