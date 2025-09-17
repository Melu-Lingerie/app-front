import {useEffect, useState, useMemo, useCallback} from 'react';
import qs from 'qs';
import {motion} from 'framer-motion';
import {useNotifications} from '@/hooks/useNotifications.ts';
import {Card, Spinner} from '@/components';
import {FilterSidebar} from './FilterSidebar';
import {ProductSkeleton} from './ProductSkeleton';
import {FilterTopBar} from './FilterTopBar';
import api from '@/axios/api.ts';

const MAPPED_SELECTED_TYPES = {
    трусики: 1,
    сорочки: 2,
    бра: 3,
} as const;

const SORT_OPTIONS: ('Все' | 'Новинки' | 'Скоро в продаже')[] = [
    'Все',
    'Новинки',
    'Скоро в продаже',
];

const PRODUCT_STATUS_MAP: Record<string, 'AVAILABLE' | 'NEW' | 'SOON'> = {
    'Все': 'AVAILABLE',
    'Новинки': 'NEW',
    'Скоро в продаже': 'SOON',
};

interface Filters {
    minVal: number;
    maxVal: number;
    types: string[];
    sizes: string[];
    colors: string[];
}

interface CommonFilters extends Filters {
    selectedSort: 'Все' | 'Новинки' | 'Скоро в продаже';
}

export const Catalog = () => {
    const [goods, setGoods] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState<Filters>({
        minVal: 0,
        maxVal: 90000,
        types: [],
        sizes: [],
        colors: [],
    });

    const [selectedSort, setSelectedSort] = useState<'Все' | 'Новинки' | 'Скоро в продаже'>('Все');

    const {addNotification} = useNotifications();

    const toggleFilterValue = (key: 'types' | 'sizes' | 'colors', value: string) => {
        setFilters((prev) => ({
            ...prev,
            [key]: prev[key].includes(value)
                ? prev[key].filter((v) => v !== value)
                : [...prev[key], value],
        }));
    };

    // количество активных фильтров
    const filterChanges = useMemo(
        () =>
            Number(filters.minVal !== 0 || filters.maxVal !== 90000) +
            Number(filters.types.length > 0) +
            Number(filters.sizes.length > 0) +
            Number(filters.colors.length > 0),
        [filters]
    );

    // API-запрос
    const getCatalog = useCallback(
        async ({minVal, maxVal, sizes, types, colors, selectedSort}: CommonFilters) => {
            try {
                setLoading(true);

                const status = PRODUCT_STATUS_MAP[selectedSort];

                const res = await api.get('/products/catalog', {
                    params: {
                        minPrice: minVal,
                        maxPrice: maxVal,
                        categories: types.map(
                            (el) => MAPPED_SELECTED_TYPES[el as keyof typeof MAPPED_SELECTED_TYPES]
                        ),
                        sizes,
                        colors,
                        ...(status !== 'AVAILABLE' ? { productStatus: status } : {}),
                    },
                    paramsSerializer: (params) =>
                        qs.stringify(params, {arrayFormat: 'repeat'}),
                });

                setGoods(res.data.content);
            } catch {
                addNotification('Не удалось загрузить каталог', 'error');
            } finally {
                setLoading(false);
            }
        },
        [addNotification]
    );

    // 🔥 общий эффект — для типов/размеров/цветов/сортировки
    useEffect(() => {
        getCatalog({...filters, selectedSort});
    }, [filters.types, filters.sizes, filters.colors, selectedSort, getCatalog]);

    // 🔥 отдельный для цены (debounce) — без selectedSort, чтобы не было дубля
    useEffect(() => {
        if (filters.minVal === 0 && filters.maxVal === 90000) return;

        const id = setTimeout(() => {
            getCatalog({...filters, selectedSort});
        }, 500);

        return () => clearTimeout(id);
    }, [filters.minVal, filters.maxVal, getCatalog]);

    // сброс фильтров
    const handleReset = () => {
        setFilters({
            minVal: 0,
            maxVal: 90000,
            types: [],
            sizes: [],
            colors: [],
        });
        // getCatalog вызовется автоматически через эффекты
    };

    return (
        <div className="relative">
            <h1 className="ml-10 mt-[60px] mb-[30px] text-[36px] leading-[38px]">
                Каталог
            </h1>

            <FilterTopBar
                filterChanges={filterChanges}
                selectedTypes={filters.types}
                toggleFn={toggleFilterValue}
                onReset={handleReset}
                options={SORT_OPTIONS}
                selectedOption={selectedSort}
                onSelectChange={setSelectedSort}
            />

            <ul className="grid grid-cols-4 divide-x divide-y divide-[#CCC]">
                <FilterSidebar
                    minVal={filters.minVal}
                    maxVal={filters.maxVal}
                    selectedTypes={filters.types}
                    selectedSizes={filters.sizes}
                    selectedColors={filters.colors}
                    toggleFilterValue={toggleFilterValue}
                    setMinVal={(val) => setFilters((prev) => ({...prev, minVal: val}))}
                    setMaxVal={(val) => setFilters((prev) => ({...prev, maxVal: val}))}
                />

                {loading
                    ? Array.from({length: 8}).map((_, i) => (
                        <ProductSkeleton key={`skeleton-${i}`} />
                    ))
                    : goods.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.4, delay: Math.min(index * 0.05, 0.3)}}
                            className="p-2 border-r border-b border-[#CCC]"
                        >
                            <Card card={item} />
                        </motion.div>
                    ))}
            </ul>

            {loading && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <Spinner className="text-gray-500" size={48} />
                </div>
            )}
        </div>
    );
};
