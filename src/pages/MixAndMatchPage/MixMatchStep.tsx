import { useCallback, useEffect, useState } from 'react';
import api from '@/axios/api';
import type { ProductCatalogResponseDto } from '@/api';
import type { MixMatchStepDto } from './useMixMatchSteps';
import type { SelectedItem } from './useMixMatchState';
import { MixMatchProductCard } from './MixMatchProductCard';
import { Carousel } from '@/components/Carousel';
import { useIsMobile } from '@/hooks/useIsMobile';

type Props = {
    step: MixMatchStepDto;
    selection: SelectedItem | null;
    onSelect: (item: SelectedItem) => void;
    onDeselect: () => void;
};

export function MixMatchStep({ step, selection, onSelect, onDeselect }: Props) {
    const [products, setProducts] = useState<ProductCatalogResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const isMobile = useIsMobile();

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

    const renderProduct = useCallback(
        (product: ProductCatalogResponseDto, { widthStyle }: { widthStyle: React.CSSProperties; idx: number; reportImageHeight: (h: number) => void }) => (
            <div key={product.productId} style={widthStyle}>
                <MixMatchProductCard
                    product={product}
                    isSelected={selection?.productId === product.productId}
                    onSelect={onSelect}
                    onDeselect={onDeselect}
                />
            </div>
        ),
        [selection, onSelect, onDeselect]
    );

    return (
        <section className="mb-8 md:mb-12">
            <div className="mb-4">
                <h2 className="text-[18px] md:text-[24px] uppercase font-medium leading-tight">
                    {step.title}
                </h2>
                {step.subtitle && (
                    <p className="text-[12px] md:text-[14px] text-[#999] mt-1">{step.subtitle}</p>
                )}
                {!step.isRequired && (
                    <span className="text-[10px] md:text-[11px] text-[#999] uppercase">необязательно</span>
                )}
            </div>

            {step.displayType === 'CAROUSEL' ? (
                <Carousel
                    items={products}
                    visibleCount={isMobile ? 2 : 4}
                    gap={isMobile ? 12 : 20}
                    loading={loading}
                    renderItem={renderProduct}
                />
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                    {loading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-gray-200 animate-pulse rounded-md" />
                        ))
                        : products.map(product => (
                            <MixMatchProductCard
                                key={product.productId}
                                product={product}
                                isSelected={selection?.productId === product.productId}
                                onSelect={onSelect}
                                onDeselect={onDeselect}
                            />
                        ))
                    }
                </div>
            )}
        </section>
    );
}
