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
    mobileVisibleCount?: number;
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
    preloadOffset?: number;
};

// --- Momentum / inertial scrolling constants ---
const FRICTION = 0.92;           // Deceleration factor per frame
const MIN_VELOCITY = 0.5;        // Stop threshold (px/frame)
const SWIPE_MULTIPLIER = 1.2;    // Velocity amplification

export const Carousel = <T,>({
                                 items,
                                 gap,
                                 visibleCount: desktopVisibleCount,
                                 mobileVisibleCount = 2,
                                 renderItem,
                                 loading = false,
                                 hasMore = false,
                                 loadingMore = false,
                                 onLoadMore,
                                 preloadOffset,
                             }: CarouselProps<T>) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const trackRef = useRef<HTMLDivElement | null>(null);
    const initialized = useSelector(selectAppInitialized);

    const [containerWidth, setContainerWidth] = useState(0);
    const [imageHeight, setImageHeight] = useState<number | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Continuous scroll position (px)
    const [scrollX, setScrollX] = useState(0);
    const scrollXRef = useRef(0);

    // Dragging state
    const dragStartX = useRef(0);
    const dragStartScrollX = useRef(0);
    const isDragging = useRef(false);
    const lastMoveX = useRef(0);
    const lastMoveTime = useRef(0);
    const velocityRef = useRef(0);
    const animFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const visibleCount = isMobile ? mobileVisibleCount : desktopVisibleCount;
    const itemWidth = containerWidth > 0
        ? (containerWidth - gap * (visibleCount - 1)) / visibleCount
        : 0;
    const stepSize = itemWidth + gap;

    const preload = preloadOffset ?? visibleCount;

    // Virtual tail for infinite loading
    const realMaxIndex = Math.max(0, items.length - visibleCount);
    const triggerFrom = Math.max(items.length - preload, 0);
    const tailActive = initialized && items.length > 0 && (loadingMore || (hasMore && true));
    const tailCount = tailActive ? Math.max(visibleCount, Math.min(visibleCount * 2, 8)) : 0;
    const virtualLength = items.length + tailCount;

    const maxScrollX = Math.max(0, (virtualLength - visibleCount) * stepSize);
    const isScrollable = items.length > visibleCount;

    // Current "index" derived from scrollX
    const currentIndex = stepSize > 0 ? Math.round(scrollXRef.current / stepSize) : 0;

    // Clamp scrollX
    const clamp = useCallback((val: number) => Math.max(0, Math.min(val, maxScrollX)), [maxScrollX]);

    const setScrollXClamped = useCallback((val: number) => {
        const clamped = Math.max(0, Math.min(val, maxScrollX));
        scrollXRef.current = clamped;
        setScrollX(clamped);
    }, [maxScrollX]);

    // --- Load more trigger ---
    const triggerLoadMore = useCallback(
        (sx: number) => {
            if (!initialized || loading || !stepSize) return;
            const idx = Math.round(sx / stepSize);
            const closeToEnd = idx + visibleCount - 1 >= triggerFrom;
            const reachedRealEnd = idx >= realMaxIndex;
            if (hasMore && onLoadMore && !loadingMore && (closeToEnd || reachedRealEnd)) {
                onLoadMore();
            }
        },
        [initialized, loading, stepSize, hasMore, onLoadMore, loadingMore, visibleCount, triggerFrom, realMaxIndex]
    );

    // --- Snap to nearest item ---
    const snapTo = useCallback((targetX: number, animate = true) => {
        if (!stepSize) return;
        const snappedIndex = Math.round(clamp(targetX) / stepSize);
        const snapped = clamp(snappedIndex * stepSize);
        scrollXRef.current = snapped;
        setScrollX(snapped);
        triggerLoadMore(snapped);
    }, [stepSize, clamp, triggerLoadMore]);

    // --- Momentum animation ---
    const startMomentum = useCallback((velocity: number) => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

        let v = velocity * SWIPE_MULTIPLIER;
        const animate = () => {
            if (Math.abs(v) < MIN_VELOCITY) {
                snapTo(scrollXRef.current);
                return;
            }
            const nextX = clamp(scrollXRef.current + v);
            scrollXRef.current = nextX;
            setScrollX(nextX);
            v *= FRICTION;

            // Stop at boundaries
            if (nextX <= 0 || nextX >= maxScrollX) {
                snapTo(nextX);
                return;
            }

            animFrameRef.current = requestAnimationFrame(animate);
        };
        animFrameRef.current = requestAnimationFrame(animate);
    }, [clamp, maxScrollX, snapTo]);

    // --- Pointer handlers (unified touch + mouse) ---
    const handleDragStart = useCallback((clientX: number) => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        isDragging.current = true;
        dragStartX.current = clientX;
        dragStartScrollX.current = scrollXRef.current;
        lastMoveX.current = clientX;
        lastMoveTime.current = performance.now();
        velocityRef.current = 0;
    }, []);

    const handleDragMove = useCallback((clientX: number) => {
        if (!isDragging.current) return;
        const dx = dragStartX.current - clientX;
        const nextX = clamp(dragStartScrollX.current + dx);
        scrollXRef.current = nextX;
        setScrollX(nextX);

        // Track velocity
        const now = performance.now();
        const dt = now - lastMoveTime.current;
        if (dt > 0) {
            velocityRef.current = (lastMoveX.current - clientX) / dt * 16; // normalize to ~60fps
        }
        lastMoveX.current = clientX;
        lastMoveTime.current = now;
    }, [clamp]);

    const handleDragEnd = useCallback(() => {
        if (!isDragging.current) return;
        isDragging.current = false;

        const v = velocityRef.current;
        if (Math.abs(v) > 1) {
            startMomentum(v);
        } else {
            snapTo(scrollXRef.current);
        }
    }, [startMomentum, snapTo]);

    // Touch events
    const onTouchStart = useCallback((e: React.TouchEvent) => handleDragStart(e.touches[0].clientX), [handleDragStart]);
    const onTouchMove = useCallback((e: React.TouchEvent) => handleDragMove(e.touches[0].clientX), [handleDragMove]);
    const onTouchEnd = useCallback(() => handleDragEnd(), [handleDragEnd]);

    // Mouse events
    const onMouseDown = useCallback((e: React.MouseEvent) => { e.preventDefault(); handleDragStart(e.clientX); }, [handleDragStart]);
    const onMouseMove = useCallback((e: React.MouseEvent) => { if (isDragging.current) { e.preventDefault(); handleDragMove(e.clientX); } }, [handleDragMove]);
    const onMouseUp = useCallback(() => handleDragEnd(), [handleDragEnd]);
    const onMouseLeave = useCallback(() => { if (isDragging.current) handleDragEnd(); }, [handleDragEnd]);

    // --- Button handlers ---
    const handleNext = useCallback(() => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        const nextIdx = Math.min(currentIndex + 1, Math.max(0, virtualLength - visibleCount));
        const target = clamp(nextIdx * stepSize);
        scrollXRef.current = target;
        setScrollX(target);
        triggerLoadMore(target);
    }, [currentIndex, virtualLength, visibleCount, stepSize, clamp, triggerLoadMore]);

    const handlePrev = useCallback(() => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        const prevIdx = Math.max(currentIndex - 1, 0);
        const target = prevIdx * stepSize;
        scrollXRef.current = target;
        setScrollX(target);
    }, [currentIndex, stepSize]);

    // Container width
    useEffect(() => {
        setImageHeight(0);
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => setContainerWidth(el.clientWidth));
        ro.observe(el);
        setContainerWidth(el.clientWidth);
        return () => ro.disconnect();
    }, []);

    // Clamp scroll on resize
    useEffect(() => {
        if (scrollXRef.current > maxScrollX) {
            setScrollXClamped(maxScrollX);
        }
    }, [maxScrollX, setScrollXClamped]);

    // Cleanup animation on unmount
    useEffect(() => {
        return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
    }, []);

    const atStart = scrollX <= 0;
    const atEnd = scrollX >= maxScrollX;

    // Use CSS transition only when NOT dragging (for button clicks)
    const transitionStyle = isDragging.current ? 'none' : 'transform 400ms ease';

    const renderContent = () => {
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

        for (let i = 0; i < tailCount; i++) {
            nodes.push(
                <div key={`tail-skel-${i}`} style={{ width: `${itemWidth}px`, flex: '0 0 auto' }}>
                    <ProductSkeleton />
                </div>
            );
        }

        return nodes;
    };

    // Center items if fewer than visibleCount
    const shouldCenter = items.length > 0 && items.length < visibleCount && !loading && initialized;

    return (
        <div ref={containerRef} className="relative my-[30px] md:my-[60px] mb-10">
            <div
                className="w-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
            >
                <div
                    className={`flex ${shouldCenter ? 'justify-center' : ''}`}
                    style={{
                        gap,
                        transform: shouldCenter ? undefined : `translateX(${-scrollX}px)`,
                        transition: transitionStyle,
                        willChange: 'transform',
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
                        disabled={(loading || !initialized) || (atEnd && !hasMore && !loadingMore)}
                        containerHeight={imageHeight}
                    />
                </>
            )}
        </div>
    );
};
