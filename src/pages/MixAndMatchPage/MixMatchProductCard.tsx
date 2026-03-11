import { type CSSProperties, useCallback, useEffect, useState } from 'react';
import { numberFormat } from '@/utils/utils';
import { ProductsService, type ProductCardResponse, type ProductVariantCardDto } from '@/api';
import type { ProductCatalogResponseDto } from '@/api';
import type { SelectedItem } from './useMixMatchState';

type Props = {
    product: ProductCatalogResponseDto;
    isSelected: boolean;
    onSelect: (item: SelectedItem) => void;
    onDeselect: () => void;
    widthStyle?: CSSProperties;
};

export function MixMatchProductCard({ product, isSelected, onSelect, onDeselect, widthStyle }: Props) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [productInfo, setProductInfo] = useState<ProductCardResponse | null>(null);
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    const handleCardClick = useCallback(async () => {
        if (isSelected) {
            onDeselect();
            setExpanded(false);
            setSelectedColor(null);
            setSelectedSize(null);
            return;
        }

        if (!expanded) {
            setExpanded(true);
            if (!productInfo) {
                setLoadingInfo(true);
                try {
                    const data = await ProductsService.getProductCardInfo(product.productId!);
                    setProductInfo(data);
                    // Auto-select first color
                    const colors = [...new Set(data.productVariants?.map(v => v.colorName))];
                    if (colors.length === 1) setSelectedColor(colors[0]);
                } catch (e) {
                    console.error('Failed to load product info', e);
                } finally {
                    setLoadingInfo(false);
                }
            }
        }
    }, [expanded, isSelected, onDeselect, product.productId, productInfo]);

    // When both color and size are selected, fire onSelect
    useEffect(() => {
        if (!selectedColor || !selectedSize || !productInfo) return;
        const variant = productInfo.productVariants?.find(
            (v: ProductVariantCardDto) => v.colorName === selectedColor && v.size === selectedSize
        );
        if (variant) {
            const mediaUrl = variant.productVariantMedia?.[0]?.url || product.s3url || '';
            onSelect({
                productId: product.productId!,
                variantId: variant.id!,
                name: product.name || '',
                price: variant.price ?? product.price ?? 0,
                imageUrl: mediaUrl,
                color: selectedColor,
                size: selectedSize,
            });
        }
    }, [selectedColor, selectedSize, productInfo, product, onSelect]);

    const uniqueColors = productInfo
        ? [...new Set(productInfo.productVariants?.map(v => v.colorName))]
        : [];
    const sizesForColor = productInfo && selectedColor
        ? productInfo.productVariants
            ?.filter(v => v.colorName === selectedColor)
            .map(v => v.size) || []
        : [];

    return (
        <div
            style={widthStyle}
            className={`cursor-pointer transition-all duration-200 ${
                isSelected ? 'ring-2 ring-[#F8C6D7] rounded-md' : ''
            }`}
        >
            {/* Image */}
            <div className="relative w-full aspect-[2/3]" onClick={handleCardClick}>
                {!isLoaded && (
                    <div className="w-full h-full bg-gray-200 animate-pulse rounded-md" />
                )}
                <img
                    className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    src={product.s3url}
                    alt={product.name}
                    onLoad={() => setIsLoaded(true)}
                    loading="lazy"
                />
                {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-[#F8C6D7] rounded-full flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="mt-2">
                <p className="text-[12px] md:text-sm truncate uppercase">{product.name}</p>
                <p className="text-[12px] md:text-sm">{String(numberFormat(product.price ?? 0))} ₽</p>
            </div>

            {/* Variant selection */}
            {expanded && !isSelected && (
                <div className="mt-2 space-y-2">
                    {loadingInfo ? (
                        <div className="h-8 bg-gray-100 animate-pulse rounded" />
                    ) : (
                        <>
                            {/* Colors */}
                            {uniqueColors.length > 0 && (
                                <div className="flex gap-1.5 flex-wrap">
                                    {uniqueColors.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedColor(color);
                                                setSelectedSize(null);
                                            }}
                                            className={`text-[10px] md:text-[11px] px-2 py-1 border rounded-sm uppercase cursor-pointer transition-colors ${
                                                selectedColor === color
                                                    ? 'border-[#F8C6D7] bg-[#F8C6D7]/10'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Sizes */}
                            {selectedColor && sizesForColor.length > 0 && (
                                <div className="flex gap-1.5 flex-wrap">
                                    {sizesForColor.map(size => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedSize(size);
                                            }}
                                            className={`text-[10px] md:text-[11px] px-2 py-1 border rounded-sm uppercase cursor-pointer transition-colors ${
                                                selectedSize === size
                                                    ? 'border-[#F8C6D7] bg-[#F8C6D7]/10'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
