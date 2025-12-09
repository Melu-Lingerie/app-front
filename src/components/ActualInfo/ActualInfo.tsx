import { useCallback, useEffect, useState } from 'react';
import { MainPageControllerService, type BannerMainPageFacadeDto } from '@/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAbortController } from '@/hooks/useAbortController';
import { isAbortError } from '@/utils/utils';
import { useNotifications } from '@/hooks/useNotifications';
import {useSafeState} from '@/hooks/useSafeState.ts';
import {FallbackHeroCreative} from '@/components';

const intervalMs = 5000;

export const ActualInfo = () => {
    const [banners, setBanners] = useSafeState<BannerMainPageFacadeDto[]>([]);
    const [loading, setLoading] = useSafeState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    // флаги загрузки каждого слайда
    const [loaded, setLoaded] = useSafeState<Record<string | number, boolean>>({});
    // учтём и падения изображений, чтобы решить когда показать фолбэк
    const [failed, setFailed] = useSafeState<Record<string | number, boolean>>({});

    // «тик» для рестарта таймера после возврата вкладки
    const [clock, tickClock] = useState(0);

    const navigate = useNavigate();
    const { signal } = useAbortController();
    const { addNotification } = useNotifications();

    // fetch вынесен в useCallback, он же — retry
    const fetchBanners = useCallback(async () => {
        try {
            setLoading(true);
            const res = await MainPageControllerService.toBannerMainPageFacadeDto({ signal });
            const sorted = [...res].sort((a, b) => a.order - b.order);
            setBanners(sorted);
            setLoaded({});
            setFailed({});
            setCurrentIndex(0);
        } catch (error) {
            if (isAbortError(error)) return;
            addNotification('Ошибка загрузки баннеров', 'error');
        } finally {
            if (!signal.aborted) setLoading(false); // п.4: не дёргаем стейт если отменено
        }
    }, [addNotification, setBanners, setFailed, setLoaded, setLoading, signal]);

    // первый запуск
    useEffect(() => { void fetchBanners(); }, [fetchBanners]);

    // автопереключение — setTimeout + пауза при скрытой вкладке
    useEffect(() => {
        if (!banners.length || document.hidden) return;
        const id = window.setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, intervalMs);
        return () => window.clearTimeout(id);
    }, [banners.length, currentIndex, clock]);

    // рестарт таймера при возврате вкладки
    useEffect(() => {
        const onVis = () => { if (!document.hidden) tickClock((c) => c + 1); };
        document.addEventListener('visibilitychange', onVis);
        return () => document.removeEventListener('visibilitychange', onVis);
    }, []);

    // img load / error (слежение за провалами)
    const handleLoad = (id: string | number) => {
        setLoaded((m) => (m[id] ? m : ({ ...m, [id]: true })));
    };
    const handleError = (id: string | number, el: HTMLImageElement) => {
        el.style.visibility = 'hidden';
        setFailed((m) => (m[id] ? m : ({ ...m, [id]: true })));
    };

    // фолбэк показываем если нет баннеров или все картинки упали
    const allFailed = banners.length > 0 && Object.keys(failed).length >= banners.length;
    const shouldFallback = !banners.length || allFailed;

    const handleDotClick = (idx: number) => {
        if (idx === currentIndex) return;
        setCurrentIndex(idx);
        // небольшой «тик» чтобы перезапустить таймер автопереключения после ручного выбора
        tickClock((c) => c + 1);
    };

    // Скелетон (aspect + min-h)
    if (loading) {
        return (
            <div className="w-full min-h-[400px] md:min-h-[620px] relative bg-gray-200 animate-pulse flex flex-col items-center justify-end">
                <div className="mb-[30px] md:mb-[60px] h-12 md:h-16 w-60 md:w-80 bg-gray-300 rounded" />
                <div className="w-[200px] md:w-[600px] h-[2px] bg-gray-300 mb-4 md:mb-5" />
                <div className="mb-[30px] md:mb-[60px] h-10 w-28 md:w-32 bg-gray-300 rounded-full" />
            </div>
        );
    }

    if (shouldFallback) {
        return <FallbackHeroCreative onRetry={() => !loading && fetchBanners()} disabled={loading} />;
    }

    const active = banners[currentIndex]; // баннер точно есть, иначе мы в фолбэке

    return (
        <div className="relative w-full min-h-[400px] md:min-h-[620px] overflow-hidden">
            {/* показываем активный только когда он загрузился */}
            {banners.map((banner, idx) => {
                const id = (banner.id as unknown) as string | number;
                const isActive = idx === currentIndex;
                const isReady = !!loaded[id];

                return (
                    <img
                        key={id}
                        src={banner.mediaUrl}
                        alt={banner.title || 'Баннер'}
                        loading={isActive ? 'eager' : 'lazy'}
                        decoding="async"
                        draggable={false}
                        onLoad={() => handleLoad(id)}
                        onError={(e) => handleError(id, e.currentTarget)}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                            isActive && isReady ? 'opacity-100' : 'opacity-0'
                        }`}
                    />
                );
            })}

            {/* overlay */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Контент */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="relative z-10 flex flex-col items-center justify-end text-white h-full px-4"
                >
                    <p className="mb-[30px] md:mb-[60px] text-[28px] md:text-[62px] leading-[1.1] uppercase text-center">
                        {active.title}
                    </p>
                    <div className="w-[80%] md:w-[60%] max-w-[600px] border-t-2 border-white mb-4 md:mb-5" />
                    <button
                        onClick={() => navigate(active.url)}
                        className="mb-[30px] md:mb-[60px] cursor-pointer px-6 py-2 rounded-xl bg-[#F8C6D7] text-black text-[14px] uppercase hover:bg-[#f5b6ca] transition active:scale-95"
                    >
                        Смотреть
                    </button>
                </motion.div>
            </AnimatePresence>

            {/* Индикаторы */}
            <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-20">
                {banners.map((_, idx) => (
                    <motion.button
                        key={idx}
                        type="button"
                        onClick={() => handleDotClick(idx)}
                        aria-label={`Переключить баннер ${idx + 1}`}
                        initial={false}
                        animate={{
                            backgroundColor: idx === currentIndex ? '#F8C6D7' : 'rgba(255,255,255,0.5)',
                            scale: idx === currentIndex ? 1.3 : 1,
                        }}
                        transition={{ duration: 0.4 }}
                        className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full cursor-pointer"
                    />
                ))}
            </div>
        </div>
    );
};
