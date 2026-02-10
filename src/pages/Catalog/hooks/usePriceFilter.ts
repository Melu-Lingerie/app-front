import { useEffect, useRef, useCallback } from 'react';
import { useSafeState } from '@/hooks/useSafeState.ts';

interface UsePriceFilterParams {
    minVal: number;
    maxVal: number;
    updateQuery: (patch: Record<string, any>) => void;
}

interface UsePriceFilterReturn {
    localMinVal: number;
    localMaxVal: number;
    setLocalMinVal: (val: number) => void;
    setLocalMaxVal: (val: number) => void;
    scheduleApplyPrice: () => void;
    flushPrice: () => void;
}

/**
 * Управление локальными значениями цены с debounce.
 */
export const usePriceFilter = ({
                                   minVal,
                                   maxVal,
                                   updateQuery,
                               }: UsePriceFilterParams): UsePriceFilterReturn => {
    const [localMinVal, setLocalMinVal] = useSafeState(minVal);
    const [localMaxVal, setLocalMaxVal] = useSafeState(maxVal);

    const lastMinRef = useRef(minVal);
    const lastMaxRef = useRef(maxVal);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // при смене фильтров из URL обновляем локальные значения и рефы
    useEffect(() => {
        setLocalMinVal(minVal);
        setLocalMaxVal(maxVal);
        lastMinRef.current = minVal;
        lastMaxRef.current = maxVal;
    }, [minVal, maxVal, setLocalMinVal, setLocalMaxVal]);

    // отложенное применение цены
    const scheduleApplyPrice = useCallback(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            debounceRef.current = null;
            updateQuery({
                minVal: lastMinRef.current,
                maxVal: lastMaxRef.current,
                page: 0,
            });
        }, 500);
    }, [updateQuery]);

    // немедленное применение цены
    const flushPrice = useCallback(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
            debounceRef.current = null;
        }
        updateQuery({
            minVal: lastMinRef.current,
            maxVal: lastMaxRef.current,
            page: 0,
        });
    }, [updateQuery]);

    // сеттеры с обновлением ref
    const handleSetMin = useCallback(
        (val: number) => {
            setLocalMinVal(val);
            lastMinRef.current = val;
            scheduleApplyPrice();
        },
        [setLocalMinVal, scheduleApplyPrice]
    );

    const handleSetMax = useCallback(
        (val: number) => {
            setLocalMaxVal(val);
            lastMaxRef.current = val;
            scheduleApplyPrice();
        },
        [setLocalMaxVal, scheduleApplyPrice]
    );

    return {
        localMinVal,
        localMaxVal,
        setLocalMinVal: handleSetMin,
        setLocalMaxVal: handleSetMax,
        scheduleApplyPrice,
        flushPrice,
    };
};
