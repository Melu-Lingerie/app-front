import { useEffect, useState } from 'react';
import api from '@/axios/api';
import type { ProductCatalogResponseDto } from '@/api';
import type { MixMatchStepDto } from './useMixMatchSteps';
import type { SelectedItem } from './useMixMatchState';
import { MixMatchCarouselStep } from './MixMatchCarouselStep';
import { MixMatchGridStep } from './MixMatchGridStep';

type Props = {
    step: MixMatchStepDto;
    selection: SelectedItem | null;
    onSelect: (item: SelectedItem) => void;
    onDeselect: () => void;
};

export function MixMatchStep({ step, selection, onSelect, onDeselect }: Props) {
    const [products, setProducts] = useState<ProductCatalogResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/mix-match/steps/${step.slug}/products`, {
                    params: { size: 20 },
                });
                if (!cancelled) setProducts(data.content || []);
            } catch (e) {
                console.error(`Failed to load products for step ${step.slug}`, e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [step.slug]);

    return (
        <section className="mb-6 md:mb-10">
            {/* Title */}
            <div className="border-t border-dashed border-[#CCC] dark:border-white/20 pt-6 md:pt-10 mb-4 md:mb-6">
                <h2 className="text-[20px] md:text-[28px] uppercase font-medium leading-tight text-center">
                    {step.title}
                </h2>
            </div>

            {step.displayType === 'CAROUSEL' ? (
                <MixMatchCarouselStep
                    products={products}
                    loading={loading}
                    selection={selection}
                    onSelect={onSelect}
                    onDeselect={onDeselect}
                />
            ) : (
                <MixMatchGridStep
                    products={products}
                    loading={loading}
                    selection={selection}
                    onSelect={onSelect}
                    onDeselect={onDeselect}
                />
            )}
        </section>
    );
}
