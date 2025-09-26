import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import qs from 'qs';
import { motion } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications.ts';
import { Card, Spinner } from '@/components';
import { FilterSidebar } from './FilterSidebar';
import { ProductSkeleton } from './ProductSkeleton';
import { FilterTopBar } from './FilterTopBar';
import api from '@/axios/api.ts';
import {useSelector} from "react-redux";
import {selectAppInitialized} from "@/store/appSlice.ts";

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
    Все: 'AVAILABLE',
    Новинки: 'NEW',
    'Скоро в продаже': 'SOON',
};

export const Catalog = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { addNotification } = useNotifications();

    const [goods, setGoods] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // локальные значения для UI ползунка
    const [localMinVal, setLocalMinVal] = useState(0);
    const [localMaxVal, setLocalMaxVal] = useState(90000);

    const initialized = useSelector(selectAppInitialized);

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // --- фильтры из query ---
    const filters = useMemo(() => {
        const params = qs.parse(searchParams.toString(), { ignoreQueryPrefix: true });

        const types = (params.types ?? []) as (string | number)[];
        const mappedTypes = Array.isArray(types) ? types : [types];
        const resolvedTypes = mappedTypes
            .map((id) => {
                const entry = Object.entries(MAPPED_SELECTED_TYPES).find(
                    ([, val]) => val === Number(id)
                );
                return entry ? entry[0] : '';
            })
            .filter(Boolean);

        const minVal = params.minVal ? Number(params.minVal) : 0;
        const maxVal = params.maxVal ? Number(params.maxVal) : 90000;

        return {
            minVal,
            maxVal,
            types: resolvedTypes,
            sizes: Array.isArray(params.sizes)
                ? (params.sizes as string[])
                : params.sizes
                    ? [params.sizes as string]
                    : [],
            colors: Array.isArray(params.colors)
                ? (params.colors as string[])
                : params.colors
                    ? [params.colors as string]
                    : [],
            selectedSort: (params.sort as any) || 'Все',
        };
    }, [searchParams]);

    // --- синхронизируем локальный ползунок с query ---
    useEffect(() => {
        setLocalMinVal(filters.minVal);
        setLocalMaxVal(filters.maxVal);
    }, [filters.minVal, filters.maxVal]);

    // --- сколько активных фильтров ---
    const filterChanges = useMemo(
        () =>
            Number(filters.minVal !== 0 || filters.maxVal !== 90000) +
            Number(filters.types.length > 0) +
            Number(filters.sizes.length > 0) +
            Number(filters.colors.length > 0),
        [filters]
    );

    // --- API-запрос ---
    const getCatalog = useCallback(async () => {
        try {
            setLoading(true);

            const status = PRODUCT_STATUS_MAP[filters.selectedSort];

            const res = await api.get('/products/catalog', {
                params: {
                    ...(filters.minVal !== 0 ? { minPrice: filters.minVal } : {}),
                    ...(filters.maxVal !== 90000 ? { maxPrice: filters.maxVal } : {}),
                    categories: filters.types.map(
                        (el) => MAPPED_SELECTED_TYPES[el as keyof typeof MAPPED_SELECTED_TYPES]
                    ),
                    ...(filters.sizes.length ? { sizes: filters.sizes } : {}),
                    ...(filters.colors.length ? { colors: filters.colors } : {}),
                    ...(status !== 'AVAILABLE' ? { productStatus: status } : {}),
                },
                paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
            });

            setGoods(res.data.content);
        } catch {
            addNotification('Не удалось загрузить каталог', 'error');
        } finally {
            setLoading(false);
        }
    }, [filters, addNotification]);

    // --- загрузка при изменении query ---
    useEffect(() => {
        getCatalog();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.toString()]);

    // --- утилиты для query ---
    const normalizeParams = (obj: Record<string, any>) => {
        const out: Record<string, string | string[]> = {};
        for (const [k, v] of Object.entries(obj)) {
            if (Array.isArray(v)) out[k] = v.map(String);
            else if (v === 0 || typeof v === 'number' || typeof v === 'boolean') out[k] = String(v);
            else if (typeof v === 'string') out[k] = v;
        }
        return out;
    };

    const toQueryString = (obj: Record<string, any>) =>
        new URLSearchParams(normalizeParams(obj) as Record<string, string | string[]>).toString();

    const updateQuery = (patch: Record<string, any>, debounce = false) => {
        const current = qs.parse(searchParams.toString(), { ignoreQueryPrefix: true });
        const nextRaw = { ...current, ...patch };

        // удалить пустяки и дефолты
        Object.keys(nextRaw).forEach((key) => {
            const v = nextRaw[key];
            if (
                v === undefined ||
                v === null ||
                (Array.isArray(v) && v.length === 0) ||
                (key === 'minVal' && Number(v) === 0) ||
                (key === 'maxVal' && Number(v) === 90000)
            ) {
                delete nextRaw[key];
            }
        });

        const currentQS = toQueryString(current as Record<string, any>);
        const nextQS = toQueryString(nextRaw as Record<string, any>);
        if (currentQS === nextQS) return; // анти-дубль

        const commit = () => setSearchParams(normalizeParams(nextRaw) as any, { replace: true });

        if (debounce) {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(commit, 500);
        } else {
            commit();
        }
    };

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    // --- обработчики ---
    const toggleFilterValue = (key: 'types' | 'sizes' | 'colors', value: string) => {
        const current = filters[key];
        const updated = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];

        if (key === 'types') {
            updateQuery({
                types: updated.map(
                    (t) => MAPPED_SELECTED_TYPES[t as keyof typeof MAPPED_SELECTED_TYPES]
                ),
            });
        } else {
            updateQuery({ [key]: updated });
        }
    };

    const handleReset = () => {
        setSearchParams({});
    };

    return (
        <div className="relative">
            <h1 className="ml-10 mt-[60px] mb-[30px] text-[36px] leading-[38px]">Каталог</h1>

            <FilterTopBar
                filterChanges={filterChanges}
                selectedTypes={filters.types}
                toggleFn={toggleFilterValue}
                onReset={handleReset}
                options={SORT_OPTIONS}
                selectedOption={filters.selectedSort}
                onSelectChange={(val) => updateQuery({ sort: val })}
            />

            <ul className="grid grid-cols-4 divide-x divide-y divide-[#CCC]">
                <FilterSidebar
                    minVal={localMinVal}
                    maxVal={localMaxVal}
                    selectedTypes={filters.types}
                    selectedSizes={filters.sizes}
                    selectedColors={filters.colors}
                    toggleFilterValue={toggleFilterValue}
                    setMinVal={(val) => {
                        setLocalMinVal(val);
                        updateQuery({ minVal: val, maxVal: localMaxVal }, true);
                    }}
                    setMaxVal={(val) => {
                        setLocalMaxVal(val);
                        updateQuery({ minVal: localMinVal, maxVal: val }, true);
                    }}
                />

                {loading || !initialized
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <ProductSkeleton withBorder key={`skeleton-${i}`} />
                    ))
                    : goods.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
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
