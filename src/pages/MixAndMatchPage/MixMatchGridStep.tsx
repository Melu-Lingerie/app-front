import { useCallback } from 'react';
import type { ProductCatalogResponseDto } from '@/api';
import type { SelectedItem } from './useMixMatchState';
import { MixMatchProductCard } from './MixMatchProductCard';
import { Carousel } from '@/components/Carousel';
import { useIsMobile } from '@/hooks/useIsMobile';

type Props = {
    products: ProductCatalogResponseDto[];
    loading: boolean;
    selection: SelectedItem | null;
    onSelect: (item: SelectedItem) => void;
    onDeselect: () => void;
};

export function MixMatchGridStep({ products, loading, selection, onSelect, onDeselect }: Props) {
    const isMobile = useIsMobile();

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
        <Carousel
            items={products}
            visibleCount={isMobile ? 2 : 4}
            gap={isMobile ? 12 : 20}
            loading={loading}
            renderItem={renderProduct}
        />
    );
}
