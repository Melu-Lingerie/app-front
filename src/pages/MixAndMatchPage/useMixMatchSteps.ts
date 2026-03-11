import { useEffect, useState } from 'react';
import api from '@/axios/api';

export type MixMatchStepDto = {
    id: number;
    stepOrder: number;
    title: string;
    subtitle: string;
    slug: string;
    categoryId: number;
    displayType: 'CAROUSEL' | 'GRID';
    isRequired: boolean;
};

export function useMixMatchSteps() {
    const [steps, setSteps] = useState<MixMatchStepDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { data } = await api.get<MixMatchStepDto[]>('/mix-match/steps');
                if (!cancelled) setSteps(data);
            } catch (e) {
                console.error('Failed to load mix-match steps', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return { steps, loading };
}
