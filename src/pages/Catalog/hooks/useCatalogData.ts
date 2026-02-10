import { useCallback, useEffect, useRef } from 'react';
import { useSafeState } from '@/hooks/useSafeState.ts';
import { useAbortController } from '@/hooks/useAbortController.ts';
import { useNotifications } from '@/hooks/useNotifications.ts';
import {
    type PageProductCatalogResponseDto,
    type ProductCatalogResponseDto,
    ProductsService,
} from '@/api';
import { selectAppInitialized } from '@/store/appSlice.ts';
import { useSelector } from 'react-redux';
import {
    PRODUCT_STATUS_MAP,
    type SortOption,
} from '@/pages/Catalog/constants';
import { isAbortError } from '@/utils/utils.ts';

export const useCatalogData = (
    filters: {
        minVal: number;
        maxVal: number;
        types: string[];
        sizes: string[];
        colors: string[];
        sort: SortOption;
        page: number;
        pageSize: number;
    },
    categoryMap: Record<string, number> = {},
) => {
    const { addNotification } = useNotifications();
    const initialized = useSelector(selectAppInitialized);
    const { signal } = useAbortController();

    const [goods, setGoods] = useSafeState<ProductCatalogResponseDto[]>([]);
    const [loading, setLoading] = useSafeState(false);
    const [totalPages, setTotalPages] = useSafeState(0);
    const loadVersionRef = useRef(0);

    const fetchPage = useCallback(
        async (page: number) => {
            const status = PRODUCT_STATUS_MAP[filters.sort];
            const categories = filters.types
                .filter((t) => t in categoryMap)
                .map((t) => categoryMap[t]);

            return (await ProductsService.getCatalog(
                undefined,
                filters.minVal || undefined,
                filters.maxVal || undefined,
                categories.length ? categories : undefined,
                filters.sizes?.length ? filters.sizes : undefined,
                undefined,
                filters.colors?.length ? filters.colors : undefined,
                status !== 'AVAILABLE' ? status : undefined,
                page,
                filters.pageSize,
                undefined,
                { signal },
            )) as unknown as Required<PageProductCatalogResponseDto>;
        },
        [filters, signal, categoryMap],
    );

    useEffect(() => {
        if (!initialized) return;

        loadVersionRef.current += 1;
        const version = loadVersionRef.current;

        const load = async () => {
            setLoading(true);
            try {
                const res = await fetchPage(filters.page);
                if (loadVersionRef.current !== version) return;
                setGoods(res.content ?? []);
                setTotalPages(res.totalPages ?? 0);
            } catch (e) {
                if (loadVersionRef.current !== version) return;
                if (!isAbortError(e)) addNotification('Не удалось загрузить каталог', 'error');
            } finally {
                if (loadVersionRef.current === version) {
                    setLoading(false);
                }
            }
        };

        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialized, JSON.stringify(filters)]);

    return {
        goods,
        loading,
        totalPages,
    };
};
