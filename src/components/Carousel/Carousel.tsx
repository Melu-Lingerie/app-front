import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type RefObject,
    type CSSProperties,
    type ReactNode
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
    const imageRef = useRef<HTMLDivElement | null>(null);

    const [index, setIndex] = useState(0);
    const [imageHeight, setImageHeight] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [withTransition, setWithTransition] = useState(true);

    const transitionMs = 400; // время анимации

    const itemWidth =
        (containerWidth - gap * (visibleCount - 1)) / visibleCount;

    const headClones = items.slice(0, visibleCount);
    const tailClones = items.slice(-visibleCount);
    const slides = [...tailClones, ...items, ...headClones];

    const offsetIndex = index + visibleCount;
    const stepSize = itemWidth + gap;
    const translateX = -(offsetIndex * stepSize);

    const handleNext = useCallback(() => {
        if (isTransitioning) return; // блокируем до завершения анимации
        setIsTransitioning(true);
        setIndex((i) => i + 1);
    }, [isTransitioning]);

    const handlePrev = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setIndex((i) => i - 1);
    }, [isTransitioning]);

    const onTransitionEnd = useCallback(() => {
        let newIndex = index;
        if (index >= items.length) {
            newIndex = 0;
        } else if (index < 0) {
            newIndex = items.length - 1;
        }

        if (newIndex !== index) {
            // отключаем transition для «бесшовного» прыжка
            setWithTransition(false);
            setIndex(newIndex);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setWithTransition(true);
                });
            });
        }

        // снимаем блокировку строго после завершения transition
        setIsTransitioning(false);
    }, [index, items.length]);

    // снимаем блокировку, если transition отключён для бесшовного прыжка
    useEffect(() => {
        if (!withTransition) {
            requestAnimationFrame(() => setIsTransitioning(false));
        }
    }, [withTransition]);

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

    useEffect(() => {
        if (imageRef.current) {
            setImageHeight(imageRef.current.clientHeight);
        }
    }, [containerWidth]);

    return (
        <div ref={containerRef} className="relative my-[60px] mb-10">
            <div className="w-full overflow-hidden">
                <div
                    className="flex"
                    style={{
                        gap,
                        transform: `translateX(${translateX}px)`,
                        transition: withTransition
                            ? `transform ${transitionMs}ms ease`
                            : 'none',
                    }}
                    onTransitionEnd={onTransitionEnd}
                >
                    {slides.map((item, idx) =>
                        renderItem(item, {
                            idx,
                            widthStyle: { flex: `0 0 ${itemWidth}px` },
                            imageRef: idx === offsetIndex ? imageRef : undefined,
                        })
                    )}
                </div>
            </div>
            <CarouselButton
                direction="left"
                onClick={handlePrev}
                top={imageHeight / 2}
            />
            <CarouselButton
                direction="right"
                onClick={handleNext}
                top={imageHeight / 2}
            />
        </div>
    );
};
