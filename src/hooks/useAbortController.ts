import { useEffect, useMemo } from 'react';

/**
 * ✅ Хук для управления AbortController
 * — Создаёт новый контроллер при маунте.
 * — Отменяет все связанные запросы при анмаунте.
 * — Возвращает { controller, signal }.
 */
export const useAbortController = () => {
    // 👇 создаём контроллер один раз на маунт
    const controller = useMemo(() => new AbortController(), []);

    useEffect(() => {
        // 👇 при размонтировании страницы отменяем запрос
        return () => {
            if (!controller.signal.aborted) {
                controller.abort();
            }
        };
    }, [controller]);

    return {
        controller,
        signal: controller.signal,
    };
};
