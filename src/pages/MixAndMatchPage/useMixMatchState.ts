import { useCallback, useMemo, useState } from 'react';
import type { MixMatchStepDto } from './useMixMatchSteps';

export type SelectedItem = {
    productId: number;
    variantId: number;
    name: string;
    price: number;
    imageUrl: string;
    color: string;
    size: string;
};

export function useMixMatchState(steps: MixMatchStepDto[]) {
    const [selections, setSelections] = useState<Record<string, SelectedItem | null>>({});

    const select = useCallback((slug: string, item: SelectedItem) => {
        setSelections(prev => ({ ...prev, [slug]: item }));
    }, []);

    const deselect = useCallback((slug: string) => {
        setSelections(prev => ({ ...prev, [slug]: null }));
    }, []);

    const isComplete = useMemo(() => {
        return steps
            .filter(s => s.isRequired)
            .every(s => selections[s.slug] != null);
    }, [steps, selections]);

    const totalPrice = useMemo(() => {
        return Object.values(selections)
            .filter(Boolean)
            .reduce((sum, item) => sum + item!.price, 0);
    }, [selections]);

    const selectedItems = useMemo(() => {
        return Object.values(selections).filter(Boolean) as SelectedItem[];
    }, [selections]);

    return { selections, select, deselect, isComplete, totalPrice, selectedItems };
}
