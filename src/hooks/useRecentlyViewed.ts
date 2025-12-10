import { useState, useEffect, useCallback } from 'react';
import { type ProductCatalogResponseDto } from '@/api';

const STORAGE_KEY = 'recentlyViewed';
const MAX_ITEMS = 20; // Максимум товаров в истории

/**
 * Хук для работы с недавно просмотренными товарами.
 * Хранит данные в localStorage.
 */
export const useRecentlyViewed = () => {
    const [items, setItems] = useState<ProductCatalogResponseDto[]>([]);

    // Загрузка из localStorage при монтировании
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as ProductCatalogResponseDto[];
                setItems(parsed);
            }
        } catch {
            // Если данные повреждены — очищаем
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    // Добавить товар в историю просмотров
    const addItem = useCallback((product: ProductCatalogResponseDto) => {
        setItems((prev) => {
            // Удаляем дубликат, если товар уже был просмотрен
            const filtered = prev.filter((item) => item.productId !== product.productId);
            // Добавляем в начало списка
            const updated = [product, ...filtered].slice(0, MAX_ITEMS);

            // Сохраняем в localStorage
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch {
                // Игнорируем ошибки записи (например, переполнение localStorage)
            }

            return updated;
        });
    }, []);

    // Получить товары, исключая указанный productId (чтобы не показывать текущий товар)
    const getItems = useCallback((excludeProductId?: number, limit = 10): ProductCatalogResponseDto[] => {
        let result = items;
        if (excludeProductId !== undefined) {
            result = result.filter((item) => item.productId !== excludeProductId);
        }
        return result.slice(0, limit);
    }, [items]);

    // Очистить историю
    const clearHistory = useCallback(() => {
        setItems([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return {
        items,
        addItem,
        getItems,
        clearHistory,
    };
};
