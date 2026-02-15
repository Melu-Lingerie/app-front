import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import qs from 'qs';
import {PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, PAGE_SIZE_MIN, type SortOption} from '@/pages/Catalog/constants';

export const useCatalogFilters = (
    MAPPED_SELECTED_TYPES: Record<string, number>,
    priceDefaults?: { min: number; max: number },
) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const parsedParams = useMemo(
        () => qs.parse(searchParams.toString(), { ignoreQueryPrefix: true }) as Record<string, unknown>,
        [searchParams]
    );

    const filters = useMemo(() => {
        const types = (parsedParams.types ?? []) as (string | number)[];
        const mappedTypes = Array.isArray(types) ? types : [types];
        const resolvedTypes = mappedTypes
            .map((id) => Object.entries(MAPPED_SELECTED_TYPES).find(([, v]) => v === Number(id))?.[0] ?? '')
            .filter(Boolean);

        const pMin = priceDefaults?.min ?? 0;
        const pMax = priceDefaults?.max ?? 0;
        const minVal = parsedParams.minVal ? Number(parsedParams.minVal) : pMin;
        const maxVal = parsedParams.maxVal ? Number(parsedParams.maxVal) : pMax;
        const rawSort = parsedParams.sort;
        const sort: SortOption =
            rawSort === 'Новинки' || rawSort === 'Скоро в продаже' ? rawSort : 'Все';

        const sizes = Array.isArray(parsedParams.sizes)
            ? parsedParams.sizes
            : parsedParams.sizes
                ? [parsedParams.sizes]
                : [];

        const colors = Array.isArray(parsedParams.colors)
            ? parsedParams.colors
            : parsedParams.colors
                ? [parsedParams.colors]
                : [];

        const name = parsedParams.name ? String(parsedParams.name) : '';

        const page = parsedParams.page ? Math.max(Number(parsedParams.page), 0) : 0;
        const rawSize = parsedParams.pageSize ? Number(parsedParams.pageSize) : PAGE_SIZE_DEFAULT;
        const pageSize = Math.min(Math.max(rawSize, PAGE_SIZE_MIN), PAGE_SIZE_MAX);

        return { name, minVal, maxVal, types: resolvedTypes, sizes, colors, sort, page, pageSize };
    }, [parsedParams, MAPPED_SELECTED_TYPES, priceDefaults?.min, priceDefaults?.max]);

    const updateQuery = useCallback(
        (
            patch: Record<string, string | number | boolean | string[] | undefined>,
            _debounce = false,
            preserveHistory = false
        ) => {
            const current = qs.parse(searchParams.toString(), {
                ignoreQueryPrefix: true,
            }) as Record<string, string | string[] | undefined>;

            const next: Record<string, string | string[] | undefined> = {
                ...current,
                ...Object.entries(patch).reduce((acc, [k, v]) => {
                    if (v === undefined || v === null) return acc;
                    if (Array.isArray(v)) acc[k] = v.map(String);
                    else acc[k] = String(v);
                    return acc;
                }, {} as Record<string, string | string[] | undefined>),
            };

            const pMin = priceDefaults?.min ?? 0;
            const pMax = priceDefaults?.max ?? 0;
            Object.keys(next).forEach((key) => {
                const v = next[key];
                if (
                    !v ||
                    (Array.isArray(v) && v.length === 0) ||
                    (key === 'minVal' && Number(v) === pMin) ||
                    (key === 'maxVal' && Number(v) === pMax)
                ) {
                    delete next[key];
                }
            });

            setSearchParams(next as Record<string, string | string[]>, { replace: !preserveHistory });
        },
        [searchParams, setSearchParams, priceDefaults?.min, priceDefaults?.max]
    );

    const resetAll = useCallback(() => {
        const sp = new URLSearchParams();
        sp.set('page', '0');
        setSearchParams(sp, { replace: true });
    }, [setSearchParams]);

    return { filters, updateQuery, resetAll };
};
