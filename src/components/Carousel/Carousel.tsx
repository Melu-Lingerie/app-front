import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from 'react';
import { CarouselButton } from './CarouselButton';
import { ProductSkeleton } from '@/pages/Catalog/ProductSkeleton';
import { useSelector } from 'react-redux';
import { selectAppInitialized } from '@/store/appSlice';

type CarouselProps<T> = {
    items: T[];
    gap: number;
    visibleCount: number;
    renderItem: (
        item: T,
        params: {
            idx: number;
            widthStyle: CSSProperties;
            reportImageHeight: (h: number) => void;
        }
    ) => ReactNode;
    loading: boolean;
    hasMore?: boolean;
    loadingMore?: boolean;
    onLoadMore?: () => void;
    /** За сколько элементов до конца начинать подгрузку (по умолчанию = visibleCount) */
    preloadOffset?: number;
};

export const Carousel = <T,>({
                                 items,
                                 gap,
                                 visibleCount,
                                 renderItem,
                                 loading = false,
                                 hasMore = false,
                                 loadingMore = false,
                                 onLoadMore,
                                 preloadOffset,
                             }: CarouselProps<T>) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const initialized = useSelector(selectAppInitialized);

    const [index, setIndex] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const [imageHeight, setImageHeight] = useState<number | null>(null);

    const transitionMs = 400;
    const itemWidth = (containerWidth - gap * (visibleCount - 1)) / visibleCount;
    const stepSize = itemWidth + gap;
    const translateX = -(index * stepSize);

    const preload = preloadOffset ?? visibleCount;

    // ---- виртуальный хвост ВКЛ только после инициализации и когда есть товары ----
    const realMaxIndex = Math.max(0, items.length - visibleCount);
    const triggerFrom = Math.max(items.length - preload, 0);
    const nearEnd = index + visibleCount - 1 >= triggerFrom;
    const tailActive = initialized && items.length > 0 && (loadingMore || (hasMore && nearEnd));
    const tailCount = tailActive
        ? Math.max(visibleCount, Math.min(visibleCount * 2, 8))
        : 0;

    const virtualLength = items.length + tailCount;
    const virtualMaxIndex = Math.max(0, virtualLength - visibleCount);

    const isScrollable = items.length > visibleCount;
    const atStart = index === 0;
    const atEndVirtual = index >= virtualMaxIndex;

    const triggerLoadMore = useCallback(
        (nextIndex: number) => {
            if (!initialized || loading) return; // нельзя триггерить до инициализации/первичной загрузки
            const closeToEnd = nextIndex + visibleCount - 1 >= triggerFrom;
            const reachedRealEnd = nextIndex >= realMaxIndex;
            if (hasMore && onLoadMore && !loadingMore && (closeToEnd || reachedRealEnd)) {
                onLoadMore();
            }
        },
        [initialized, loading, hasMore, onLoadMore, loadingMore, visibleCount, triggerFrom, realMaxIndex]
    );

    const handleNext = useCallback(() => {
        const next = Math.min(index + 1, virtualMaxIndex);
        setIndex(next);
        triggerLoadMore(next);
    }, [index, virtualMaxIndex, triggerLoadMore]);

    const handlePrev = useCallback(() => {
        setIndex((i) => Math.max(i - 1, 0));
    }, []);

    // ширина контейнера
    useEffect(() => {
        setImageHeight(0);
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => setContainerWidth(el.clientWidth));
        ro.observe(el);
        setContainerWidth(el.clientWidth);
        return () => ro.disconnect();
    }, []);

    // подтягиваем индекс в валидные рамки
    useEffect(() => {
        if (index > virtualMaxIndex) setIndex(virtualMaxIndex);
    }, [virtualMaxIndex, index]);

    const renderContent = () => {
        // ⚠️ до инициализации и при первичной загрузке — только фиксированное число скелетонов
        if (loading || !initialized) {
            return Array.from({ length: visibleCount }).map((_, idx) => (
                <div key={`skeleton-${idx}`} style={{ width: `${itemWidth}px`, flex: '0 0 auto' }}>
                    <ProductSkeleton />
                </div>
            ));
        }

        const nodes: ReactNode[] = items.map((item, idx) =>
            renderItem(item, {
                idx,
                widthStyle: { width: `${itemWidth}px`, flex: '0 0 auto' },
                reportImageHeight: (h) => { if (!imageHeight) setImageHeight(h); },
            })
        );

        // хвост из скелетонов — только после инициализации
        for (let i = 0; i < tailCount; i++) {
            nodes.push(
                <div key={`tail-skel-${i}`} style={{ width: `${itemWidth}px`, flex: '0 0 auto' }}>
                    <ProductSkeleton />
                </div>
            );
        }

        return nodes;
    };

    return (
        <div ref={containerRef} className="relative my-[60px] mb-10">
            <div className="w-full overflow-hidden">
                <div
                    className="flex transition-transform ease"
                    style={{
                        gap,
                        transform: `translateX(${translateX}px)`,
                        transitionDuration: `${transitionMs}ms`,
                    }}
                >
                    {renderContent()}
                </div>
            </div>

            {(isScrollable || hasMore) && imageHeight !== null && (
                <>
                    <CarouselButton
                        direction="left"
                        onClick={handlePrev}
                        disabled={atStart || loading || !initialized}
                        containerHeight={imageHeight}
                    />
                    <CarouselButton
                        direction="right"
                        onClick={handleNext}
                        disabled={(loading || !initialized) || (atEndVirtual && !hasMore && !loadingMore)}
                        containerHeight={imageHeight}
                    />
                </>
            )}
        </div>
    );
};
