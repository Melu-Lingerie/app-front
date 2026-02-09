import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { selectAppInitialized } from '@/store/appSlice.ts';
import { Card, Spinner } from '@/components';
import { FilterSidebar } from './FilterSidebar';
import { FilterTopBar } from './FilterTopBar';
import { Pagination } from './Pagination';
import { ProductSkeleton } from './ProductSkeleton';
import { useCatalogFilters } from '@/pages/Catalog/hooks/useCatalogFilters.ts';
import { useCatalogData } from '@/pages/Catalog/hooks/useCatalogData.ts';
import { usePriceFilter } from '@/pages/Catalog/hooks/usePriceFilter.ts';
import {
    type ListKey,
    MAPPED_SELECTED_TYPES,
    PAGE_SIZE,
    PRICE_MAX,
    PRICE_MIN,
    SORT_OPTIONS,
    type SortOption,
} from '@/pages/Catalog/constants';

export const Catalog = () => {
    const [, setSearchParams] = useSearchParams();
    const initialized = useSelector(selectAppInitialized);

    // === фильтры из query ===
    const { filters, updateQuery } = useCatalogFilters(MAPPED_SELECTED_TYPES);
    const { types, sizes, colors } = filters;

    const {
        goods,
        loading,
        totalPages,
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
        setSearchParams(params, { replace: true });
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }, [setSearchParams]);

    const handlePageChange = useCallback(
        (page: number) => {
            updateQuery({ page });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        [updateQuery],
    );

    // === счётчик активных фильтров ===
    const filterChanges =
        (filters.minVal !== PRICE_MIN || filters.maxVal !== PRICE_MAX ? 1 : 0) +
        (filters.types.length ? 1 : 0) +
        (filters.colors.length ? 1 : 0) +
        (filters.sizes.length ? 1 : 0);

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
            <div className="grid grid-cols-1 md:grid-cols-4 relative">
                {/* === Sidebar (скрыт на мобилке) === */}
                <div className="hidden md:block col-span-1 border-r border-[#CCC] dark:border-white/10 sticky top-[58px] self-start max-h-[calc(100vh-58px)] overflow-y-auto">
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

                <div className="col-span-1 md:col-span-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 relative">
                        {/* === Контент === */}
                        {loading || !initialized
                            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                                <ProductSkeleton withBorder key={`skeleton-${i}`} />
                            ))
                            : goods.map((item, index) => (
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

                        {/* === Пустое состояние === */}
                        {!loading && initialized && goods.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col items-center justify-center py-24 text-center col-span-2 md:col-span-3"
                            >
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

                                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Ничего не найдено</h2>
                                <p className="text-gray-500 mb-6 max-w-md">
                                    Попробуйте изменить условия поиска или сбросить фильтры.
                                </p>

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
                    </div>

                    {/* === Пагинация === */}
                    {!loading && initialized && goods.length > 0 && (
                        <Pagination
                            currentPage={filters.page}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </div>

            {/* Индикатор загрузки */}
            {loading && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <Spinner className="text-gray-500" size={48} />
                </div>
            )}
        </div>
    );
};
