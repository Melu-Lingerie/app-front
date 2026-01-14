import { Fragment, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { selectAppInitialized } from '@/store/appSlice.ts';
import { Card, Spinner } from '@/components';
import { FilterSidebar } from './FilterSidebar';
import { FilterTopBar } from './FilterTopBar';
import { ProductSkeleton } from './ProductSkeleton';
import { useCatalogFilters } from '@/pages/Catalog/hooks/useCatalogFilters.ts';
import { useCatalogData } from '@/pages/Catalog/hooks/useCatalogData.ts';
import { usePriceFilter } from '@/pages/Catalog/hooks/usePriceFilter.ts';
import {
    HEADER_OFFSET,
    type ListKey,
    MAPPED_SELECTED_TYPES,
    PAGE_SIZE,
    PRICE_MAX,
    PRICE_MIN,
    SORT_OPTIONS,
    type SortOption,
} from '@/pages/Catalog/constants';

export const Catalog = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialized = useSelector(selectAppInitialized);

    // --- управление стартовой страницей и синхронизацией URL ---
    const initialPageRef = useRef<number | null>(null);
    const didInitialScrollRef = useRef(false);
    const suppressUrlSyncRef = useRef(true); // блокируем обновление ?page до начального скролла

    if (initialPageRef.current === null) {
        const raw = searchParams.get('page');
        const p = raw == null ? null : Number(raw);
        // Не скроллим, если страницы нет или она 0
        initialPageRef.current = p != null && Number.isFinite(p) && p > 0 ? p : null;
        if (initialPageRef.current === null) {
            // если скролла не будет — сразу разрешаем синхронизацию URL
            suppressUrlSyncRef.current = false;
        }
    }

    // === фильтры из query ===
    const { filters, updateQuery } = useCatalogFilters(MAPPED_SELECTED_TYPES);
    const { types, sizes, colors } = filters;

    const {
        goods,
        loading,
        loadingDown,
        loadingUp,
        hasMore,
        topSentinelRef,
        bottomSentinelRef,
        minPage,
    } = useCatalogData(filters);

    // === управление фильтром цены ===
    const {
        localMinVal,
        localMaxVal,
        setLocalMinVal,
        setLocalMaxVal,
        flushPrice,
    } = usePriceFilter({
        minVal: filters.minVal,
        maxVal: filters.maxVal,
        updateQuery,
    });

    const toggleFilterValue = useCallback(
        (key: ListKey, value: string) => {
            if (key === 'types') {
                const typedValue = value as keyof typeof MAPPED_SELECTED_TYPES;
                const updatedKeys = types.includes(typedValue)
                    ? types.filter((v) => v !== typedValue)
                    : [...types, typedValue];

                const mappedTypes = updatedKeys
                    .filter((t): t is keyof typeof MAPPED_SELECTED_TYPES => t in MAPPED_SELECTED_TYPES)
                    .map((t) => String(MAPPED_SELECTED_TYPES[t]));

                updateQuery({ types: mappedTypes, page: 0 });
                return;
            }

            const current = key === 'sizes' ? sizes : colors;
            const next = current.includes(value)
                ? current.filter((v) => v !== value)
                : [...current, value];

            updateQuery({ [key]: next, page: 0 });
        },
        [types, sizes, colors, updateQuery],
    );

    const handleSortChange = useCallback(
        (val: SortOption) => updateQuery({ sort: String(val), page: 0 }),
        [updateQuery],
    );

    const handleReset = useCallback(() => {
        const params = new URLSearchParams();
        params.set('page', '0');
        setSearchParams(params, { replace: true });
        requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }));
    }, [setSearchParams]);

    // === anchors для синхронизации ?page ===
    const anchorsRef = useRef<(HTMLDivElement | null)[]>([]);
    const setPageAnchor = useCallback(
        (absolutePage: number) => (el: HTMLDivElement | null) => {
            anchorsRef.current[absolutePage] = el; // индексируем реальным номером страницы
        },
        [],
    );

    // === обновление ?page при скролле ===
    useEffect(() => {
        if (!initialized) return;

        let ticking = false;
        const handleScroll = () => {
            if (suppressUrlSyncRef.current) return;
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const y = window.scrollY + HEADER_OFFSET + 1;

                // работаем только с реально существующими якорями
                const entries = anchorsRef.current
                    .map((el, page) => ({ el, page }))
                    .filter((x): x is { el: HTMLDivElement; page: number } => !!x.el)
                    .sort((a, b) => a.page - b.page);

                if (!entries.length) {
                    ticking = false;
                    return;
                }

                let current = entries[0].page;
                for (const { el, page } of entries) {
                    const top = el.getBoundingClientRect().top + window.scrollY;
                    if (top <= y) current = page;
                    else break;
                }

                const url = new URL(window.location.href);
                const prev = Number(url.searchParams.get('page') ?? '0');
                if (prev !== current) {
                    url.searchParams.set('page', String(current));
                    window.history.replaceState(window.history.state, '', url.toString());
                }
                ticking = false;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [initialized]);

    // === постраничная разбивка текущих goods ===
    const pages = useMemo(() => {
        const count = Math.ceil(goods.length / PAGE_SIZE);
        return Array.from({ length: count }, (_, i) =>
            goods.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE),
        );
    }, [goods]);

    // === начальная прокрутка к странице из ?page ===
    useEffect(() => {
        if (!initialized) return;
        if (didInitialScrollRef.current) return;

        const desired = initialPageRef.current;
        // если страницы нет или это 0 — ничего не скроллим
        if (desired == null) {
            suppressUrlSyncRef.current = false;
            didInitialScrollRef.current = true;
            return;
        }

        const el = anchorsRef.current[desired];

        // ждём пока появится якорь нужной страницы
        if (!el) return;

        suppressUrlSyncRef.current = true;

        const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

        requestAnimationFrame(() => {
            window.scrollTo({ top, behavior: 'auto' });
            // даём браузеру один кадр, чтобы обновить scrollY
            requestAnimationFrame(() => {
                didInitialScrollRef.current = true;
                suppressUrlSyncRef.current = false;
            });
        });
    }, [initialized, pages.length, minPage]);

    // === счётчик активных фильтров ===
    const filterChanges =
        (filters.minVal !== PRICE_MIN || filters.maxVal !== PRICE_MAX ? 1 : 0) +
        (filters.types.length ? 1 : 0) +
        (filters.colors.length ? 1 : 0) +
        (filters.sizes.length ? 1 : 0);

    useEffect(() => {
        const prev = history.scrollRestoration;
        history.scrollRestoration = 'manual';
        return () => { history.scrollRestoration = prev as any; };
    }, []);

    // === UI ===
    return (
        <div className="relative">
            {/* Заголовок страницы */}
            <h1 className="ml-4 md:ml-10 mt-[30px] md:mt-[60px] mb-[20px] md:mb-[30px] text-[28px] md:text-[36px] leading-[32px] md:leading-[38px] uppercase">Каталог</h1>

            {/* Верхняя панель фильтров */}
            <FilterTopBar
                filterChanges={filterChanges}
                selectedTypes={filters.types}
                toggleFn={toggleFilterValue}
                onReset={handleReset}
                options={[...SORT_OPTIONS]}
                selectedOption={filters.sort}
                onSelectChange={handleSortChange}
                // Mobile filter props
                minVal={localMinVal}
                maxVal={localMaxVal}
                selectedSizes={filters.sizes ?? []}
                selectedColors={filters.colors ?? []}
                setMinVal={setLocalMinVal}
                setMaxVal={setLocalMaxVal}
                onPriceCommit={flushPrice}
            />

            {/* Контент */}
            <div className="flex relative">
                {/* === Sidebar (скрыт на мобилке) === */}
                <aside className="hidden md:block w-1/4 flex-shrink-0">
                    <div className="sticky top-[50px] h-[calc(100vh-50px)] overflow-y-auto border-r border-[#CCC] dark:border-white/10">
                        <FilterSidebar
                            minVal={localMinVal}
                            maxVal={localMaxVal}
                            selectedTypes={filters.types}
                            selectedSizes={filters.sizes ?? []}
                            selectedColors={filters.colors ?? []}
                            toggleFilterValue={toggleFilterValue}
                            setMinVal={setLocalMinVal}
                            setMaxVal={setLocalMaxVal}
                            onPriceCommit={flushPrice}
                        />
                    </div>
                </aside>

                <div className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-3 relative">

                        {/* === ВЕРХНИЙ sentinel === */}
                        <div ref={topSentinelRef} className="col-span-2 md:col-span-3 h-0 opacity-0" />

                        {/* === ВЕРХНИЙ ЛОАДЕР (в потоке, не absolute) === */}
                        {loadingUp && (
                            <div className="col-span-2 md:col-span-3 flex justify-center items-center py-6">
                                <Spinner size={48} className="text-gray-500" />
                            </div>
                        )}

                        {/* === Контент === */}
                        {loading || !initialized
                            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                                <ProductSkeleton withBorder key={`skeleton-${i}`} />
                            ))
                            : pages.map((page, pIdx) => {
                                const realPage = pIdx + minPage;
                                return (
                                    <Fragment key={`page-${realPage}`}>
                                        <div
                                            ref={setPageAnchor(realPage)}
                                            data-page={realPage}
                                            className="col-span-2 md:col-span-3 h-0"
                                        />
                                        {page.map((item, index) => (
                                            <motion.div
                                                key={item.productId}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    duration: 0.4,
                                                    delay: Math.min(index * 0.02, 0.3),
                                                }}
                                                className="p-1 md:p-2 border-r border-b border-[#CCC] dark:border-white/10"
                                            >
                                                <Card card={item} />
                                            </motion.div>
                                        ))}
                                    </Fragment>
                                );
                            })}

                        {/* === Пустое состояние === */}
                        {!loading && initialized && goods.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col items-center justify-center py-24 text-center col-span-2 md:col-span-3"
                            >
                                {/* 🔍 Анимированная лупа */}
                                <div className="relative w-32 h-32 mb-8">
                                    <motion.svg
                                        viewBox="0 0 200 200"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-full h-full text-[#F8C6D7]"
                                        initial={{ rotate: -10, opacity: 0 }}
                                        animate={{
                                            rotate: [ -10, 10, -10 ],
                                            opacity: 1,
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                    >
                                        <circle cx="85" cy="85" r="40" stroke="currentColor" strokeWidth="6" />
                                        <line
                                            x1="120"
                                            y1="120"
                                            x2="160"
                                            y2="160"
                                            stroke="currentColor"
                                            strokeWidth="6"
                                            strokeLinecap="round"
                                        />
                                    </motion.svg>

                                    {/* 💫 Мягкие «пузырьки» вокруг лупы */}
                                    {[...Array(5)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute text-[#F8C6D7]"
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{
                                                opacity: [0, 1, 0],
                                                scale: [0.6, 1, 0.6],
                                                y: [0, -25, -50],
                                                x: [0, (i % 2 ? -1 : 1) * 20],
                                            }}
                                            transition={{
                                                duration: 2.8,
                                                delay: i * 0.4,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                            }}
                                            style={{
                                                top: '45%',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                            }}
                                        >
                                            ●
                                        </motion.div>
                                    ))}
                                </div>

                                {/* 📝 Текст */}
                                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Ничего не найдено</h2>
                                <p className="text-gray-500 mb-6 max-w-md">
                                    Попробуйте изменить условия поиска или сбросить фильтры.
                                </p>

                                {/* 🔘 Кнопка в фирменном цвете */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={handleReset}
                                        className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors shadow-sm cursor-pointer"
                                        style={{
                                            backgroundColor: '#F8C6D7',
                                        }}
                                    >
                                        Сбросить фильтры
                                    </motion.button>
                            </motion.div>
                        )}

                        {/* === НИЖНИЙ sentinel === */}
                        {hasMore && <div ref={bottomSentinelRef} className="col-span-2 md:col-span-3 h-0 opacity-0" />}

                        {/* === Нижний лоадер === */}
                        {loadingDown && (
                            <div className="col-span-2 md:col-span-3 flex justify-center py-8">
                                <Spinner size={48} className="text-gray-500" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Индикаторы загрузки */}
            {loading && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <Spinner className="text-gray-500" size={48} />
                </div>
            )}
        </div>
    );
};