import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import qs from 'qs';
import {PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, PAGE_SIZE_MIN, PRICE_MAX, PRICE_MIN, type SortOption} from '@/pages/Catalog/constants';

export const useCatalogFilters = (MAPPED_SELECTED_TYPES: Record<string, number>) => {
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

        const minVal = parsedParams.minVal ? Number(parsedParams.minVal) : PRICE_MIN;
        const maxVal = parsedParams.maxVal ? Number(parsedParams.maxVal) : PRICE_MAX;
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

        const page = parsedParams.page ? Math.max(Number(parsedParams.page), 0) : 0;
        const rawSize = parsedParams.pageSize ? Number(parsedParams.pageSize) : PAGE_SIZE_DEFAULT;
        const pageSize = Math.min(Math.max(rawSize, PAGE_SIZE_MIN), PAGE_SIZE_MAX);

        return { minVal, maxVal, types: resolvedTypes, sizes, colors, sort, page, pageSize };
    }, [parsedParams, MAPPED_SELECTED_TYPES]);

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

            Object.keys(next).forEach((key) => {
                const v = next[key];
                if (
                    !v ||
                    (Array.isArray(v) && v.length === 0) ||
                    (key === 'minVal' && Number(v) === PRICE_MIN) ||
                    (key === 'maxVal' && Number(v) === PRICE_MAX)
                ) {
                    delete next[key];
                }
            });

            setSearchParams(next as Record<string, string | string[]>, { replace: !preserveHistory });
        },
        [searchParams, setSearchParams]
    );

    const resetAll = useCallback(() => {
        const sp = new URLSearchParams();
        sp.set('page', '0');
        setSearchParams(sp, { replace: true });
    }, [setSearchParams]);

    return { filters, updateQuery, resetAll };
};
