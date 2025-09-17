import { useEffect, useRef, useState } from 'react';

type Props = {
    min?: number;
    max?: number;
    valueMin: number;
    valueMax: number;
    step?: number;
    onChange: (values: { min: number; max: number }) => void;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export const DoubleSlider = ({
    min = 0,
    max = 90_000,
    valueMin,
    valueMax,
    step = 1,
    onChange,
}: Props) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState(0);

    const activeHandleRef = useRef<'min' | 'max' | null>(null);
    const isDraggingRef = useRef(false);

    // track container width
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            setWidth(Math.round(entry.contentRect.width));
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const HANDLE_SIZE = 9;
    const usableWidth = Math.max(0, width - 2);

    const valueToX = (v: number) => {
        const t = (v - min) / (max - min);
        return t * usableWidth;
    };

    const xToValue = (xCss: number) => {
        const x = clamp(xCss, 0, usableWidth);
        const t = usableWidth === 0 ? 0 : x / usableWidth;
        const raw = min + t * (max - min);
        const snapped = Math.round(raw / step) * step;
        return clamp(snapped, min, max);
    };

    function commit(which: 'min' | 'max' | null, v: number) {
        if (!which) return;
        let [newMin, newMax] = [valueMin, valueMax];

        if (which === 'min') {
            newMin = clamp(v, min, newMax);
        } else {
            newMax = clamp(v, newMin, max);
        }

        [newMin, newMax] = [newMin, newMax].map(
            (val) => Math.round(val / step) * step
        );

        if (newMin > newMax) {
            [newMin, newMax] = [newMax, newMin];
            activeHandleRef.current = which === 'min' ? 'max' : 'min';
        }

        onChange({ min: newMin, max: newMax });
    }

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const onPointerDown = (e: PointerEvent) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const minX = valueToX(valueMin);
            const maxX = valueToX(valueMax);
            const distMin = Math.abs(x - minX);
            const distMax = Math.abs(x - maxX);
            activeHandleRef.current = distMin <= distMax ? 'min' : 'max';
            isDraggingRef.current = true;
            (e.target as Element).setPointerCapture?.(e.pointerId);
            commit(activeHandleRef.current, xToValue(x));
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!isDraggingRef.current) return;
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            commit(activeHandleRef.current, xToValue(x));
        };

        const onPointerUp = (e: PointerEvent) => {
            isDraggingRef.current = false;
            activeHandleRef.current = null;
            try {
                (e.target as Element).releasePointerCapture?.(e.pointerId);
            } catch {
                /* ignore */
            }
        };

        el.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        return () => {
            el.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [valueMin, valueMax, usableWidth]);

    const xMin = valueToX(valueMin);
    const xMax = valueToX(valueMax);

    return (
        <div className="w-full px-1.5" ref={containerRef}>
            <div className="relative h-6 select-none">
                {/* Full track */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gray-200" />
                {/* Active range */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 h-px bg-black"
                    style={{ left: `${xMin}px`, width: `${Math.max(0, xMax - xMin)}px` }}
                />
                {/* Min handle */}
                <div
                    role="slider"
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={valueMin}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-black cursor-pointer"
                    style={{
                        left: `${xMin}px`,
                        top: '50%',
                        width: HANDLE_SIZE,
                        height: HANDLE_SIZE,
                    }}
                />
                {/* Max handle */}
                <div
                    role="slider"
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={valueMax}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-black cursor-pointer"
                    style={{
                        left: `${xMax}px`,
                        top: '50%',
                        width: HANDLE_SIZE,
                        height: HANDLE_SIZE,
                    }}
                />
            </div>
        </div>
    );
};
