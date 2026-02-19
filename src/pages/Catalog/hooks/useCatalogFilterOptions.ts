import { useEffect } from 'react';
import { useSafeState } from '@/hooks/useSafeState.ts';
import api from '@/axios/api.ts';

export interface CategoryOption {
    id: number;
    name: string;
    parentId?: number;
    children?: CategoryOption[];
}

export interface CatalogFilterOptions {
    minPrice: number;
    maxPrice: number;
    categories: CategoryOption[];
    sizes: string[];
    colors: string[];
}

const DEFAULTS: CatalogFilterOptions = {
    minPrice: 0,
    maxPrice: 90000,
    categories: [],
    sizes: [],
    colors: [],
};

export const useCatalogFilterOptions = () => {
    const [options, setOptions] = useSafeState<CatalogFilterOptions>(DEFAULTS);
    const [loading, setLoading] = useSafeState(true);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await api.get<CatalogFilterOptions>('/products/catalog/filters');
                if (cancelled) return;
                setOptions({
                    minPrice: res.data.minPrice ?? 0,
                    maxPrice: res.data.maxPrice ?? 90000,
                    categories: res.data.categories ?? [],
                    sizes: res.data.sizes ?? [],
                    colors: res.data.colors ?? [],
                });
            } catch {
                // fallback to defaults
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void load();
        return () => { cancelled = true; };
    }, [setOptions, setLoading]);

    // Build category name -> ID map (lowercased names for matching)
    // Includes both parent and child categories
    const categoryMap: Record<string, number> = {};
    for (const cat of options.categories) {
        categoryMap[cat.name.toLowerCase()] = cat.id;
        if (cat.children) {
            for (const child of cat.children) {
                categoryMap[child.name.toLowerCase()] = child.id;
            }
        }
    }

    return { options, loading, categoryMap };
};
