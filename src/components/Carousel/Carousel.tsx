import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from 'react';
import { CarouselButton } from './CarouselButton.tsx';
import { ProductSkeleton } from '@/pages/Catalog/ProductSkeleton';
import {useSelector} from 'react-redux';
import {selectAppInitialized} from '@/store/appSlice.ts';

type CarouselProps<T> = {
    items: T[];
    gap: number;
    visibleCount: number;
    renderItem: (
        item: T,
        params: {
            idx: number;
            widthStyle: CSSProperties;
        }
    ) => ReactNode;
    loading?: boolean;       // ⬅️ новый проп
};

export const Carousel = <T,>({
                                 items,
                                 gap,
                                 visibleCount,
                                 renderItem,
                                 loading = false,
                             }: CarouselProps<T>) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const initialized = useSelector(selectAppInitialized);

    const [index, setIndex] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    const transitionMs = 400;

    const itemWidth =
        (containerWidth - gap * (visibleCount - 1)) / visibleCount;

    const stepSize = itemWidth + gap;
    const translateX = -(index * stepSize);

    const handleNext = useCallback(() => {
        setIndex((i) => Math.min(i + 1, items.length - visibleCount));
    }, [items.length, visibleCount]);

    const handlePrev = useCallback(() => {
        setIndex((i) => Math.max(i - 1, 0));
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() =>
            setContainerWidth(el.clientWidth)
        );
        ro.observe(el);
        setContainerWidth(el.clientWidth);
        return () => ro.disconnect();
    }, []);

    const isScrollable = items.length > visibleCount;
    const atStart = index === 0;
    const atEnd = index >= items.length - visibleCount;

    const renderContent = () => {
        if (loading || !initialized) {
            return Array.from({ length: visibleCount }).map((_, idx) => (
                <div
                    key={`skeleton-${idx}`}
                    style={{ width: `${itemWidth}px`, flex: '0 0 auto' }}
                >
                    <ProductSkeleton />
                </div>
            ));
        }

        return items.map((item, idx) =>
            renderItem(item, {
                idx,
                widthStyle: { width: `${itemWidth}px`, flex: '0 0 auto' },
            })
        );
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

            {/* стрелки */}
            {isScrollable && !loading && (
                <>
                    <CarouselButton
                        direction="left"
                        onClick={handlePrev}
                        disabled={atStart}
                    />
                    <CarouselButton
                        direction="right"
                        onClick={handleNext}
                        disabled={atEnd}
                    />
                </>
            )}
        </div>
    );
};
