import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type RefObject,
    type CSSProperties,
    type ReactNode,
} from 'react';
import { CarouselButton } from './CarouselButton.tsx';

type CarouselProps<T> = {
    items: T[];
    gap: number;
    visibleCount: number;
    renderItem: (
        item: T,
        params: {
            idx: number;
            widthStyle: CSSProperties;
            imageRef?: RefObject<HTMLDivElement | null>;
        }
    ) => ReactNode;
};

export const Carousel = <T,>({
                                 items,
                                 gap,
                                 visibleCount,
                                 renderItem,
                             }: CarouselProps<T>) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

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
                    {items.map((item, idx) =>
                        renderItem(item, {
                            idx,
                            widthStyle: { flex: `0 0 ${itemWidth}px` },
                        })
                    )}
                </div>
            </div>

            {/* стрелки */}
            {isScrollable && (
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
