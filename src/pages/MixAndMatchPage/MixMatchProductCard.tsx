import { type CSSProperties, useCallback, useEffect, useState } from 'react';
import { numberFormat } from '@/utils/utils';
import { ProductsService, type ProductCardResponse, type ProductVariantCardDto } from '@/api';
import type { ProductCatalogResponseDto } from '@/api';
import type { SelectedItem } from './useMixMatchState';
import EmptyWishList from '@/assets/EmptyWishList.svg';

type Props = {
    product: ProductCatalogResponseDto;
    isSelected: boolean;
    onSelect: (item: SelectedItem) => void;
    onDeselect: () => void;
    widthStyle?: CSSProperties;
};

export function MixMatchProductCard({ product, isSelected, onSelect, onDeselect }: Props) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [productInfo, setProductInfo] = useState<ProductCardResponse | null>(null);
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [showVariants, setShowVariants] = useState(false);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    const handleAddClick = useCallback(async () => {
        if (isSelected) {
            onDeselect();
            setShowVariants(false);
            setSelectedColor(null);
            setSelectedSize(null);
            return;
        }

        // Load variants if not loaded
        if (!productInfo) {
            setLoadingInfo(true);
            try {
                const data = await ProductsService.getProductCardInfo(product.productId!);
                setProductInfo(data);
                // If only 1 variant, auto-select
                if (data.productVariants?.length === 1) {
                    const v = data.productVariants[0];
                    onSelect({
                        productId: product.productId!,
                        variantId: v.id!,
                        name: product.name || '',
                        price: v.price ?? product.price ?? 0,
                        imageUrl: v.productVariantMedia?.[0]?.url || product.s3url || '',
                        color: v.colorName,
                        size: v.size,
                    });
                    return;
                }
                setShowVariants(true);
                const colors = [...new Set(data.productVariants?.map(v => v.colorName))];
                if (colors.length === 1) setSelectedColor(colors[0]);
            } catch (e) {
                console.error('Failed to load product info', e);
            } finally {
                setLoadingInfo(false);
            }
        } else {
            if (productInfo.productVariants?.length === 1) {
                const v = productInfo.productVariants[0];
                onSelect({
                    productId: product.productId!,
                    variantId: v.id!,
                    name: product.name || '',
                    price: v.price ?? product.price ?? 0,
                    imageUrl: v.productVariantMedia?.[0]?.url || product.s3url || '',
                    color: v.colorName,
                    size: v.size,
                });
                return;
            }
            setShowVariants(true);
        }
    }, [isSelected, onDeselect, onSelect, product, productInfo]);

    // When both color and size are selected → fire onSelect
    useEffect(() => {
        if (!selectedColor || !selectedSize || !productInfo) return;
        const variant = productInfo.productVariants?.find(
            (v: ProductVariantCardDto) => v.colorName === selectedColor && v.size === selectedSize
        );
        if (variant) {
            onSelect({
                productId: product.productId!,
                variantId: variant.id!,
                name: product.name || '',
                price: variant.price ?? product.price ?? 0,
                imageUrl: variant.productVariantMedia?.[0]?.url || product.s3url || '',
                color: selectedColor,
                size: selectedSize,
            });
            setShowVariants(false);
        }
    }, [selectedColor, selectedSize, productInfo, product, onSelect]);

    const uniqueColors = productInfo
        ? [...new Set(productInfo.productVariants?.map(v => v.colorName))]
        : [];
    const sizesForColor = productInfo && selectedColor
        ? productInfo.productVariants?.filter(v => v.colorName === selectedColor).map(v => v.size) ?? []
        : [];

    return (
        <div className="flex flex-col">
            {/* Image */}
            <div className="relative w-full aspect-[2/3] mb-2">
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
                {/* Wishlist icon */}
                <div className="absolute top-[10px] right-[10px]">
                    <img src={EmptyWishList} alt="Избранное" />
                </div>
            </div>

            {/* Info */}
            <p className="text-[12px] md:text-sm truncate uppercase mb-0.5">{product.name}</p>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-[12px] md:text-sm">{String(numberFormat(product.price ?? 0))} ₽</span>
                <div className="flex gap-0.5">
                    {(product.colors ?? []).map((color, i) => (
                        <span
                            key={i}
                            className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full"
                            style={{ backgroundColor: color, border: '1px solid #BFBFBF' }}
                        />
                    ))}
                </div>
            </div>

            {/* Variant selection (when expanded) */}
            {showVariants && !isSelected && (
                <div className="mb-2 space-y-2">
                    {uniqueColors.length > 1 && (
                        <div className="flex gap-1.5 flex-wrap">
                            {uniqueColors.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => { setSelectedColor(color); setSelectedSize(null); }}
                                    className={`text-[10px] px-2 py-0.5 border rounded-sm uppercase cursor-pointer transition-colors ${
                                        selectedColor === color
                                            ? 'border-[#F8C6D7] bg-[#F8C6D7]/10'
                                            : 'border-gray-300'
                                    }`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    )}
                    {selectedColor && sizesForColor.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap">
                            {sizesForColor.map(size => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setSelectedSize(size)}
                                    className={`text-[10px] px-2 py-0.5 border rounded-sm uppercase cursor-pointer transition-colors ${
                                        selectedSize === size
                                            ? 'border-[#F8C6D7] bg-[#F8C6D7]/10'
                                            : 'border-gray-300'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add button */}
            <button
                type="button"
                onClick={handleAddClick}
                disabled={loadingInfo}
                className={`w-full h-[36px] md:h-[40px] text-[11px] md:text-[12px] uppercase font-medium cursor-pointer transition-colors rounded-sm ${
                    isSelected
                        ? 'bg-[#F8C6D7] text-black border border-[#F8C6D7] hover:bg-[#f0b4c7]'
                        : 'bg-white dark:bg-transparent text-black dark:text-white border border-[#CCC] dark:border-white/20 hover:border-[#F8C6D7]'
                } disabled:opacity-50`}
            >
                {loadingInfo ? '...' : isSelected ? 'Выбрано ✓' : 'Добавить в корзину'}
            </button>
        </div>
    );
}
