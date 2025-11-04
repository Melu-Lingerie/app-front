import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSafeState } from '@/hooks/useSafeState';
import { useAbortController } from '@/hooks/useAbortController';
import { useNotifications } from '@/hooks/useNotifications';
import {
    ProductsService,
    type PageProductCatalogResponseDto,
    type ProductCatalogResponseDto,
} from '@/api';
import {
    PAGE_SIZE, PRICE_MIN, PRICE_MAX, PRODUCT_STATUS_MAP,
    MAPPED_SELECTED_TYPES, type SortOption,
} from '@/pages/Catalog/constants';
import { isAbortError } from '@/utils/utils';

type Filters = {
    minVal: number;
    maxVal: number;
    types: string[];
    sizes: string[];
    colors: string[];
    sort: SortOption;
};

type PageMap = Map<number, ProductCatalogResponseDto[]>;

const OFFLINE_COOLDOWN_MS = 5000;

export const useCatalogDataWindowed = (filters: Filters, initialPage: number | null) => {
    const { addNotification } = useNotifications();
    const { signal } = useAbortController();

    const [pages, setPages] = useSafeState<PageMap>(new Map());
    const [loadingPages, setLoadingPages] = useSafeState<Set<number>>(new Set());
    const [totalCount, setTotalCount] = useSafeState<number | null>(null);
    const [isLastKnown, setIsLastKnown] = useSafeState(false);
    const [loadedRev, setLoadedRev] = useSafeState(0);

    const pagesRef = useRef<PageMap>(new Map());
    const knownLastPageRef = useRef<number | null>(null);
    const requestedOrLoadedRef = useRef<Set<number>>(new Set());
    const inFlightPagesRef = useRef<Set<number>>(new Set());
    const loadedPagesRef = useRef<Set<number>>(new Set());
    const failedUntilRef = useRef<Map<number, number>>(new Map());

    const initKeyRef = useRef<string | null>(null);
    const initPageRef = useRef<number>(initialPage ?? 0);

    const setPagesAndRef = useCallback((updater: (prev: PageMap) => PageMap) => {
        setPages(prev => {
            const next = updater(prev);
            pagesRef.current = next;
            return next;
        });
    }, [setPages]);

    const filtersKey = useMemo(() => {
        const t = filters.types.join(',');
        const s = filters.sizes.join(',');
        const c = filters.colors.join(',');
        return `${filters.minVal}|${filters.maxVal}|${t}|${s}|${c}|${filters.sort}`;
    }, [filters]);

    const fetchPage = useCallback(async (page: number) => {
        if (page < 0) return null;
        if (knownLastPageRef.current != null && page > knownLastPageRef.current) return null;
        if (requestedOrLoadedRef.current.has(page)) return pagesRef.current.get(page) ?? null;

        const until = failedUntilRef.current.get(page);
        if (until && Date.now() < until) return null;

        requestedOrLoadedRef.current.add(page);
        inFlightPagesRef.current.add(page);

        setLoadingPages(prev => {
            const next = new Set(prev);
            next.add(page);
            return next;
        });

        try {
            const status = PRODUCT_STATUS_MAP[filters.sort];
            const categories = filters.types
                .filter((t): t is keyof typeof MAPPED_SELECTED_TYPES => t in MAPPED_SELECTED_TYPES)
                .map(t => MAPPED_SELECTED_TYPES[t]);

            const res = await ProductsService.getCatalog(
                undefined,
                filters.minVal !== PRICE_MIN ? filters.minVal : undefined,
                filters.maxVal !== PRICE_MAX ? filters.maxVal : undefined,
                categories.length ? categories : undefined,
                filters.sizes?.length ? filters.sizes : undefined,
                undefined,
                filters.colors?.length ? filters.colors : undefined,
                status !== 'AVAILABLE' ? status : undefined,
                page,
                PAGE_SIZE,
                undefined,
                { signal }
            ) as unknown as Required<PageProductCatalogResponseDto>;

            const content = res.content ?? [];
            const isLast = Boolean(res.last);

            setPagesAndRef(prev => {
                const prevArr = prev.get(page);
                const same =
                    prevArr &&
                    prevArr.length === content.length &&
                    prevArr.every((it, i) => it.productId === content[i]?.productId);
                if (same) return prev;
                const next = new Map(prev);
                next.set(page, content);
                return next;
            });

            loadedPagesRef.current.add(page);
            setLoadedRev(r => r + 1);

            if (isLast) {
                knownLastPageRef.current = page;
                setIsLastKnown(true);
                requestedOrLoadedRef.current.add(page + 1);

                const total =
                    (res as any).totalElements ??
                    (res as any).total ??
                    (page * PAGE_SIZE + content.length);
                setTotalCount(total);
            }

            // защита от кейса: API вернуло пустую страницу не как last
            if (!isLast && content.length === 0 && page > 0) {
                const lastPage = page - 1;
                knownLastPageRef.current = lastPage;
                setIsLastKnown(true);
                requestedOrLoadedRef.current.add(lastPage + 1);
                const lastLen = pagesRef.current.get(lastPage)?.length ?? PAGE_SIZE;
                setTotalCount(lastPage * PAGE_SIZE + lastLen);
            }

            failedUntilRef.current.delete(page);
            return content;
        } catch (e) {
            requestedOrLoadedRef.current.delete(page);
            failedUntilRef.current.set(page, Date.now() + OFFLINE_COOLDOWN_MS);
            if (!isAbortError(e)) addNotification('Не удалось загрузить каталог', 'error');
            return null;
        } finally {
            inFlightPagesRef.current.delete(page);
            setLoadingPages(prev => {
                const next = new Set(prev);
                next.delete(page);
                return next;
            });
        }
    }, [filtersKey, signal, addNotification, setPagesAndRef]);

    const ensurePage = useCallback(async (page: number | null | undefined) => {
        if (page == null || page < 0) return;
        if (knownLastPageRef.current != null && page > knownLastPageRef.current) return;
        if (requestedOrLoadedRef.current.has(page)) return;
        if (inFlightPagesRef.current.has(page)) return;

        const until = failedUntilRef.current.get(page);
        if (until && Date.now() < until) return;

        inFlightPagesRef.current.add(page);
        try {
            await fetchPage(page);
        } finally {
            inFlightPagesRef.current.delete(page);
        }
    }, [fetchPage]);

    const ensureAround = useCallback(async (startIndex: number, endIndex: number) => {
        const startPage = Math.floor(startIndex / PAGE_SIZE);
        const endPage = Math.floor(endIndex / PAGE_SIZE);
        const last = knownLastPageRef.current;

        const want: number[] = [];
        for (let p = startPage - 1; p <= endPage; p++) {
            if (p < 0) continue;
            if (last != null && p > last) continue;
            if (requestedOrLoadedRef.current.has(p)) continue;
            if (inFlightPagesRef.current.has(p)) continue;
            want.push(p);
        }
        if (want.length) await Promise.all(want.map(fetchPage));
    }, [fetchPage]);

    // Инициализация на смену фильтров/URL
    useEffect(() => {
        const p = initialPage ?? 0;
        const initKey = `${filtersKey}|p=${p}`;
        if (initKeyRef.current === initKey) return;
        initKeyRef.current = initKey;
        initPageRef.current = p;

        setPages(new Map());
        pagesRef.current = new Map();
        setTotalCount(null);
        setIsLastKnown(false);
        knownLastPageRef.current = null;
        requestedOrLoadedRef.current.clear();
        inFlightPagesRef.current.clear();
        loadedPagesRef.current.clear();
        failedUntilRef.current.clear();
        setLoadedRev(0);

        void fetchPage(p);
        // соседей не трогаем — подтянет rangeChanged
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtersKey, initialPage]);

    const itemAt = useCallback((index: number) => {
        if (index < 0) return null;
        const page = Math.floor(index / PAGE_SIZE);
        const offset = index % PAGE_SIZE;
        const arr = pagesRef.current.get(page);
        return arr ? arr[offset] ?? null : null;
    }, []);

    const lastContentPage = useMemo(
        () => Math.max(
            -1,
            ...Array.from(pagesRef.current.entries())
                .filter(([, arr]) => (arr?.length ?? 0) > 0)
                .map(([p]) => p)
        ),
        [pages]
    );

    const loadingDown = useMemo(
        () => Array.from(loadingPages).some(p => p > lastContentPage),
        [loadingPages, lastContentPage]
    );

    const loadedCount = useMemo(() => {
        let n = 0;
        for (const arr of pagesRef.current.values()) n += arr?.length ?? 0;
        return n;
    }, [pages]);

    // ⬅️ ВАЖНО: пока стартовая страница не загружена, отдаём минимум слотов до неё,
    // чтобы Virtuoso имел «где» показать скелетоны и можно было проскроллить к нужной странице.
    const effectiveTotalCount = useMemo(() => {
        const initP = initPageRef.current;
        const initLoaded = loadedPagesRef.current.has(initP);
        if (!initLoaded) {
            const minNeeded = (initP + 1) * PAGE_SIZE;
            return Math.max(loadedCount, minNeeded);
        }
        return typeof totalCount === 'number' ? totalCount : loadedCount;
    }, [totalCount, loadedCount, loadedRev]);

    const hasPageLoaded = useCallback((p: number) => loadedPagesRef.current.has(p), []);

    return {
        totalCount: effectiveTotalCount,
        itemAt,
        ensureAround,
        ensurePage,
        loadingDown,
        hasPageLoaded,
        isLastKnown,
        loadedRev,
        lastLoadedPage: lastContentPage,
    };
};
