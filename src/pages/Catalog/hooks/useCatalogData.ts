import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
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
    MAPPED_SELECTED_TYPES,
    PAGE_SIZE,
    PRICE_MAX,
    PRICE_MIN,
    PRODUCT_STATUS_MAP,
    HEADER_OFFSET,
    type SortOption,
} from '@/pages/Catalog/constants';
import { isAbortError } from '@/utils/utils.ts';

type NavType = 'back_forward' | 'reload' | 'navigate' | 'prerender' | undefined;

export const useCatalogData = (filters: {
    minVal: number;
    maxVal: number;
    types: string[];
    sizes: string[];
    colors: string[];
    sort: SortOption;
}) => {
    const { addNotification } = useNotifications();
    const initialized = useSelector(selectAppInitialized);
    const { signal } = useAbortController();

    // === state ===
    const [goods, setGoods] = useSafeState<ProductCatalogResponseDto[]>([]);
    const [loading, setLoading] = useSafeState(false);
    const [loadingDown, setLoadingDown] = useSafeState(false);
    const [loadingUp, setLoadingUp] = useSafeState(false);
    const [hasMore, setHasMore] = useSafeState(true);
    const [minPage, setMinPage] = useSafeState(0);
    const [maxPage, setMaxPage] = useSafeState(0);

    // === refs ===
    const topSentinelRef = useRef<HTMLDivElement | null>(null);
    const bottomSentinelRef = useRef<HTMLDivElement | null>(null);
    const currentPageRef = useRef<number | null>(null);
    const initialLoadingDoneRef = useRef(false);
    const blockUpObserverUntilReadyRef = useRef(true);
    const isInitialLoadingRef = useRef(false);
    const CACHE_KEY = 'catalog_cache_v1';

    // навигация (фикс для reload vs back/forward)
    const navTypeRef = useRef<NavType>(() => {
        const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        return (entry?.type as NavType) ?? undefined;
    }) as React.MutableRefObject<NavType>;

    // стабильные refs, чтобы не пересоздавать observer
    const loadingDownRef = useRef(false);
    const loadingUpRef = useRef(false);
    const hasMoreRef = useRef(true);
    const initializedRef = useRef(initialized);
    const minPageRef = useRef(0);
    const loadMoreDownRef = useRef<() => Promise<void>>();
    const loadMoreUpRef = useRef<() => Promise<void>>();

    useEffect(() => {
        loadingDownRef.current = loadingDown;
        loadingUpRef.current = loadingUp;
        hasMoreRef.current = hasMore;
        initializedRef.current = initialized;
        minPageRef.current = minPage;
        loadMoreDownRef.current = loadMoreDown;
        loadMoreUpRef.current = loadMoreUp;
    });

    // === API ===
    const fetchPage = useCallback(
        async (page: number) => {
            const status = PRODUCT_STATUS_MAP[filters.sort];
            const categories = filters.types
                .filter((t): t is keyof typeof MAPPED_SELECTED_TYPES => t in MAPPED_SELECTED_TYPES)
                .map((t) => MAPPED_SELECTED_TYPES[t]);

            return (await ProductsService.getCatalog(
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
                { signal },
            )) as unknown as Required<PageProductCatalogResponseDto>;
        },
        [filters, signal],
    );

    // === scroll ===
    const scrollToPageAnchor = useCallback((page: number) => {
        let attempts = 0;
        const tryScroll = () => {
            const anchors = document.querySelectorAll('[data-page]');
            const target = Array.from(anchors).find(
                (a) => a.getAttribute('data-page') === String(page),
            );
            if (target instanceof HTMLElement) {
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET,
                    behavior: 'smooth',
                });
                return;
            }
            if (attempts < 30) {
                attempts++;
                setTimeout(tryScroll, 16);
            }
        };
        tryScroll();
    }, []);

    // === cache ===
    const saveCache = useCallback(
        (extra?: Partial<{ scrollY: number }>) => {
            try {
                sessionStorage.setItem(
                    CACHE_KEY,
                    JSON.stringify({
                        goods,
                        minPage,
                        maxPage,
                        filters,
                        scrollY: extra?.scrollY ?? window.scrollY,
                    }),
                );
            } catch {}
        },
        [goods, minPage, maxPage, filters],
    );

    const readCache = () => {
        try {
            const raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            return JSON.parse(raw) as {
                goods: ProductCatalogResponseDto[];
                minPage: number;
                maxPage: number;
                filters: typeof filters;
                scrollY: number;
            };
        } catch {
            return null;
        }
    };

    // === initial load ===
    const loadInitial = useCallback(async () => {
        if (isInitialLoadingRef.current) return;
        isInitialLoadingRef.current = true;

        const navType = navTypeRef.current; // 'back_forward' | 'reload' | 'navigate'
        const isBackForward = navType === 'back_forward';

        // читаем query
        const urlParams = new URLSearchParams(window.location.search);
        const currentPage = Math.max(Number(urlParams.get('page') ?? '0'), 0);
        currentPageRef.current = currentPage;

        if (isBackForward) {
            const cached = readCache();
            if (cached && JSON.stringify(cached.filters) === JSON.stringify(filters) && cached.goods?.length) {
                setGoods(cached.goods);
                setMinPage(cached.minPage);
                setMaxPage(cached.maxPage);
                setHasMore(true);
                initialLoadingDoneRef.current = true;
                blockUpObserverUntilReadyRef.current = false;
                requestAnimationFrame(() => window.scrollTo(0, cached.scrollY));
                isInitialLoadingRef.current = false;
                return;
            }
        } else {
            // navigate / reload — кэш игнорируем и чистим
            sessionStorage.removeItem(CACHE_KEY);
        }

        // свежая загрузка
        setLoading(true);
        setHasMore(true);
        try {
            blockUpObserverUntilReadyRef.current = true;
            initialLoadingDoneRef.current = false;

            const pagesToLoad = [currentPage];
            if (currentPage > 0) pagesToLoad.unshift(currentPage - 1);

            const results: ProductCatalogResponseDto[] = [];
            for (const p of pagesToLoad) {
                const res = await fetchPage(p);
                if (res.content?.length) results.push(...res.content);
                setHasMore(!res.last);
            }
            setMinPage(Math.min(...pagesToLoad));
            setMaxPage(Math.max(...pagesToLoad));
            setGoods(results);

            // подготовим кэш (используем только при back/forward)
            saveCache({ scrollY: 0 });
        } catch (e) {
            if (!isAbortError(e)) addNotification('Не удалось загрузить каталог', 'error');
        } finally {
            setLoading(false);
            isInitialLoadingRef.current = false;
        }
    }, [fetchPage, filters, addNotification, saveCache, setGoods, setHasMore, setLoading, setMinPage, setMaxPage]);

    // === load down ===
    const loadMoreDown = useCallback(async () => {
        if (loadingDown || !hasMore || !initialized) return;

        try {
            setLoadingDown(true);
            const nextPage = maxPage + 1;
            const res = await fetchPage(nextPage);

            if (res.content?.length) {
                setGoods((prev) => [...prev, ...res.content]);
                setMaxPage(nextPage);
                setHasMore(!res.last);
            } else {
                setHasMore(false);
                observerDownRef.current?.disconnect();
            }
        } catch (e) {
            if (!isAbortError(e)) addNotification('Ошибка при подгрузке вниз', 'error');
        } finally {
            setLoadingDown(false);
        }
    }, [loadingDown, hasMore, initialized, fetchPage, addNotification, setGoods, setHasMore, maxPage, setMaxPage]);

    const loadMoreUp = useCallback(async () => {
        if (
            blockUpObserverUntilReadyRef.current ||
            !initialLoadingDoneRef.current ||
            loadingUp ||
            minPageRef.current <= 0
        ) {
            return;
        }

        try {
            setLoadingUp(true);
            const prevPage = minPageRef.current - 1;
            const res = await fetchPage(prevPage);

            if (res.content?.length) {
                const oldScrollY = window.scrollY;
                const oldHeight = document.body.scrollHeight;
                setGoods((prev) => [...res.content, ...prev]);
                setMinPage(prevPage);

                requestAnimationFrame(() => {
                    const diff = document.body.scrollHeight - oldHeight;
                    window.scrollTo({ top: oldScrollY + diff });
                });
            } else {
                // достигли низа — выключаем навсегда
                blockUpObserverUntilReadyRef.current = true;
                observerUpRef.current?.disconnect();
            }
        } catch (e) {
            if (!isAbortError(e)) addNotification('Ошибка при подгрузке вверх', 'error');
        } finally {
            setLoadingUp(false);
        }
    }, [loadingUp, fetchPage, addNotification, setGoods, setMinPage]);

    // === refs ===
    const observerUpRef = useRef<IntersectionObserver | null>(null);
    const observerDownRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const top = topSentinelRef.current;
        const bottom = bottomSentinelRef.current;
        if (!top && !bottom) return;

        // 👇 ВНИМАНИЕ: передаём ссылки на актуальные функции через .current
        loadMoreUpRef.current = loadMoreUp;
        loadMoreDownRef.current = loadMoreDown;

        // === вниз ===
        const obsDown = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        if (
                            !loadingDownRef.current &&
                            hasMoreRef.current &&
                            initializedRef.current
                        ) {
                            void loadMoreDownRef.current?.();
                        }
                    }
                }
            },
            { rootMargin: '800px 0px 0px 0px' },
        );

        if (bottom) obsDown.observe(bottom);
        observerDownRef.current = obsDown;

        // === вверх ===
        const obsUp = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        if (
                            !loadingUpRef.current &&
                            !blockUpObserverUntilReadyRef.current &&
                            initialLoadingDoneRef.current &&
                            minPageRef.current > 0
                        ) {
                            void loadMoreUpRef.current?.();
                        }
                    }
                }
            },
            { rootMargin: '200px 0px 0px 0px' },
        );

        if (top) obsUp.observe(top);
        observerUpRef.current = obsUp;

        return () => {
            obsDown.disconnect();
            obsUp.disconnect();
        };
    }, [topSentinelRef.current, bottomSentinelRef.current]);

    // === scroll after load ===
    useLayoutEffect(() => {
        if (!goods.length || currentPageRef.current === null) return;
        const page = currentPageRef.current;
        const hasPageParam = window.location.search.includes('page=');

        // page=0 / без page — жёстко вверх и мгновенная разблокировка
        if (!hasPageParam || page === 0) {
            currentPageRef.current = null;
            initialLoadingDoneRef.current = true;
            blockUpObserverUntilReadyRef.current = false;
            requestAnimationFrame(() => window.scrollTo({ top: 0 }));
            return;
        }

        if (page >= 1 && minPage <= page) {
            scrollToPageAnchor(page);
            currentPageRef.current = null;
            // короткий таймаут — только чтобы DOM стабилизировался на n-й странице
            setTimeout(() => {
                initialLoadingDoneRef.current = true;
                blockUpObserverUntilReadyRef.current = false;
            }, 200);
        }
    }, [goods, minPage, scrollToPageAnchor]);

    // === run initial (на маунт и при смене фильтров) ===
    useEffect(() => {
        // при reload/navigate — кэш не используем (loadInitial сам почистит/прочитает по navType)
        setMinPage(0);
        setMaxPage(0);
        if (!initialized) return;
        void (async () => {
            await loadInitial();
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(filters), initialized]);

    return {
        goods,
        loading,
        loadingDown,
        loadingUp,
        hasMore,
        topSentinelRef,
        bottomSentinelRef,
        minPage,
    };
};