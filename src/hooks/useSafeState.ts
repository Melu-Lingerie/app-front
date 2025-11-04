import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import { useIsMounted } from '@/hooks/useIsMounted';

/**
 * Безопасный setState: не обновляет состояние после unmount.
 */
export const useSafeState = <T,>(initial: T) => {
    const isMounted = useIsMounted();
    const [state, setState] = useState<T>(initial);

    const setSafe = useCallback<Dispatch<SetStateAction<T>>>(
        (value) => {
            if (isMounted.current) {
                setState(value);
            }
        },
        [isMounted]
    );

    return [state, setSafe, isMounted] as const;
};
