export const MAPPED_SELECTED_TYPES = { трусики: 1, сорочки: 2, бра: 3 } as const;
export const SORT_OPTIONS = ['Все', 'Новинки', 'Скоро в продаже'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];
export type ListKey = 'types' | 'sizes' | 'colors';
export const PRODUCT_STATUS_MAP: Record<SortOption, 'AVAILABLE' | 'NEW' | 'SOON'> = {
    Все: 'AVAILABLE',
    Новинки: 'NEW',
    'Скоро в продаже': 'SOON',
};

export const PAGE_SIZE = 18;
export const HEADER_OFFSET = 70;
export const PRICE_MIN = 0;
export const PRICE_MAX = 90000;