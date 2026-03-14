import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductsService, type ProductCatalogResponseDto, type ProductCardResponse, type ProductVariantCardDto } from '@/api';
import { resolveColor } from '@/utils/colorMap';
import type { SelectedItem } from './useMixMatchState';

type Props = {
    products: ProductCatalogResponseDto[];
    loading: boolean;
    selection: SelectedItem | null;
    onSelect: (item: SelectedItem) => void;
    onDeselect: () => void;
};

export function MixMatchCarouselStep({ products, loading, onSelect }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [productInfo, setProductInfo] = useState<ProductCardResponse | null>(null);
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    const currentProduct = products[currentIndex] ?? null;

    // Load product details when current product changes
    useEffect(() => {
        if (!currentProduct) return;
        let cancelled = false;
        (async () => {
            setLoadingInfo(true);
            setSelectedColor(null);
            setSelectedSize(null);
            try {
                const data = await ProductsService.getProductCardInfo(currentProduct.productId!);
                if (!cancelled) {
                    setProductInfo(data);
                    // Auto-select first color
                    const colors = [...new Set(data.productVariants?.map(v => v.colorName))];
                    if (colors.length > 0) setSelectedColor(colors[0]);
                }
            } catch (e) {
                console.error('Failed to load product info', e);
            } finally {
                if (!cancelled) setLoadingInfo(false);
            }
        })();
        return () => { cancelled = true; };
    }, [currentProduct?.productId]);

    // When color + size selected → fire onSelect
    useEffect(() => {
        if (!selectedColor || !selectedSize || !productInfo || !currentProduct) return;
        const variant = productInfo.productVariants?.find(
            (v: ProductVariantCardDto) => v.colorName === selectedColor && v.size === selectedSize
        );
        if (variant) {
            const mediaUrl = variant.productVariantMedia?.[0]?.url || currentProduct.s3url || '';
            onSelect({
                productId: currentProduct.productId!,
                variantId: variant.id!,
                name: currentProduct.name || '',
                price: variant.price ?? currentProduct.price ?? 0,
                imageUrl: mediaUrl,
                color: selectedColor,
                size: selectedSize,
            });
        }
    }, [selectedColor, selectedSize, productInfo, currentProduct, onSelect]);

    const handlePrev = useCallback(() => {
        setCurrentIndex(i => Math.max(0, i - 1));
    }, []);

    const handleNext = useCallback(() => {
        setCurrentIndex(i => Math.min(products.length - 1, i + 1));
    }, [products.length]);

    const handleRandom = useCallback(() => {
        if (products.length <= 1) return;
        let idx: number;
        do { idx = Math.floor(Math.random() * products.length); } while (idx === currentIndex);
        setCurrentIndex(idx);
    }, [products.length, currentIndex]);

    const uniqueColors = productInfo
        ? [...new Set(productInfo.productVariants?.map(v => v.colorName))]
        : (currentProduct?.colors ?? []);

    const sizesForColor = productInfo && selectedColor
        ? productInfo.productVariants
            ?.filter(v => v.colorName === selectedColor)
            .map(v => v.size) ?? []
        : [];

    if (loading) {
        return (
            <div className="flex justify-center">
                <div className="w-full max-w-[500px] aspect-[2/3] bg-gray-200 animate-pulse rounded-md" />
            </div>
        );
    }

    if (!currentProduct) return null;

    // Get image for selected color
    const currentImage = (() => {
        if (productInfo && selectedColor) {
            const variant = productInfo.productVariants?.find(v => v.colorName === selectedColor);
            if (variant?.productVariantMedia?.[0]?.url) return variant.productVariantMedia[0].url;
        }
        return currentProduct.s3url;
    })();

    return (
        <div className="flex flex-col items-center">
            {/* Model type and selected color */}
            <div className="text-center mb-3 md:mb-4">
                <p className="text-[12px] md:text-[14px] text-[#999]">
                    Тип модели: <span className="text-[#F895B7] cursor-pointer">{currentProduct.name}</span>
                </p>
                {selectedColor && (
                    <p className="text-[12px] md:text-[14px] text-[#999]">
                        Выбранный цвет: <span className="text-[#F895B7]">{selectedColor}</span>
                    </p>
                )}
            </div>

            {/* Large product image with nav arrows */}
            <div className="relative w-full flex items-center justify-center mb-4">
                <button
                    type="button"
                    onClick={handleRandom}
                    className="hidden md:block absolute left-0 text-[12px] text-[#999] hover:text-[#F895B7] cursor-pointer transition-colors uppercase"
                >
                    Случайный выбор
                </button>

                <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="absolute left-0 md:left-[140px] w-10 h-10 rounded-full bg-[#F5F5F5] dark:bg-white/10 flex items-center justify-center cursor-pointer disabled:opacity-30 transition-opacity z-10"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="w-[280px] md:w-[400px] aspect-[2/3] overflow-hidden rounded-md border border-[#E5E5E5] dark:border-white/10">
                    {loadingInfo ? (
                        <div className="w-full h-full bg-gray-100 animate-pulse" />
                    ) : (
                        <img
                            src={currentImage}
                            alt={currentProduct.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentIndex >= products.length - 1}
                    className="absolute right-0 md:right-[140px] w-10 h-10 rounded-full bg-[#F5F5F5] dark:bg-white/10 flex items-center justify-center cursor-pointer disabled:opacity-30 transition-opacity z-10"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Color picker dots */}
            <div className="flex items-center gap-3 mb-3">
                <span className="text-[12px] md:text-[13px] text-[#999]">Выберите цвет</span>
                <div className="flex gap-2">
                    {uniqueColors.map((color, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => { setSelectedColor(color); setSelectedSize(null); }}
                            className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 cursor-pointer transition-transform ${
                                selectedColor === color ? 'border-[#F8C6D7] scale-110' : 'border-[#BFBFBF]'
                            }`}
                            style={{ backgroundColor: resolveColor(color) }}
                            title={color}
                        />
                    ))}
                </div>
            </div>

            {/* Size selector */}
            {selectedColor && sizesForColor.length > 0 && (
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[12px] md:text-[13px] text-[#999]">Размер:</span>
                    <div className="flex gap-1.5">
                        {sizesForColor.map(size => (
                            <button
                                key={size}
                                type="button"
                                onClick={() => setSelectedSize(size)}
                                className={`text-[11px] md:text-[12px] px-3 py-1 border rounded-sm uppercase cursor-pointer transition-colors ${
                                    selectedSize === size
                                        ? 'border-[#F8C6D7] bg-[#F8C6D7]/10 text-black dark:text-white'
                                        : 'border-gray-300 hover:border-gray-400 text-[#666]'
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
