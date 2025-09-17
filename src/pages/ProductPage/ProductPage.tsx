import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from '@/components/Spinner';
import {
    ProductsService,
    type ProductCardResponse,
    type ProductVariantCardDto,
} from '@/api';
import { ProductImages } from './ProductImages.tsx';
import { useNotifications } from '@/hooks/useNotifications.ts';
import { numberFormat } from '@/utils/utils.ts';
import WishListInCard from '@/assets/WishListInCard.svg';
import ArrowRightInCard from '@/assets/ArrowRightInCard.svg';
import { FilterAccordion } from '../../pages/Catalog/FilterSidebar/FilterAccordion';

export function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const { addNotification } = useNotifications();
    const [product, setProduct] = useState<ProductCardResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [activeVariant, setActiveVariant] = useState<ProductVariantCardDto | null>(null);

    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
    const [isStructureOpen, setIsStructureOpen] = useState(false);
    const [isReviewsOpen, setIsReviewsOpen] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await ProductsService.getProductCardInfo(Number(id));
                setProduct(data);

                if (data.productVariants && data.productVariants.length > 0) {
                    const firstAvailable =
                        data.productVariants.find((v) => v.isAvailable) ?? null;
                    if (firstAvailable) {
                        setSelectedColor(firstAvailable.colorName);
                        setActiveVariant(firstAvailable);
                    }
                }
            } catch {
                addNotification('Ошибка загрузки товара', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full min-h-[300px]">
                <Spinner className="text-gray-500" size={48} />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex items-center justify-center w-full min-h-[300px]">
                <p className="text-gray-600">Товар не найден</p>
            </div>
        );
    }

    const colors = Array.from(
        new Set(product.productVariants?.map((v) => v.colorName))
    );

    const sizes =
        product.productVariants?.filter((v) => v.colorName === selectedColor) ?? [];

    const images = activeVariant?.productVariantMedia.slice(0, 4) ?? [];

    return (
        <div className="w-full">
            <div className="flex w-full gap-5">
                {/* Картинки */}
                <div className="flex-1">
                    <ProductImages images={images} />
                </div>

                {/* Инфоблок */}
                <div className="w-[560px] shrink-0 pr-10 mt-[60px]">
                    {/* Заголовок + цена */}
                    <div className="flex flex-col gap-[24px]">
                        <h1 className="text-[24px] leading-[26px] font-bold uppercase">
                            {product.name}
                        </h1>
                        <p className="text-[#999] leading-[18px]">{product.articleNumber}</p>
                        {activeVariant ? (
                            <p className="text-[24px] leading-[26px]">
                                {`${numberFormat(activeVariant.price)} ₽`}
                            </p>
                        ) : (
                            <p className="text-red-500">Нет доступных размеров</p>
                        )}
                    </div>

                    {/* Цвета */}
                    <div className="mt-8">
                        <h3 className="mb-2 font-medium">Цвет</h3>
                        <div className="flex flex-wrap gap-2">
                            {colors.map((color) => {
                                const variantsForColor =
                                    product.productVariants?.filter((v) => v.colorName === color) ??
                                    [];
                                const hasAvailable = variantsForColor.some((v) => v.isAvailable);

                                return (
                                    <button
                                        key={color}
                                        disabled={!hasAvailable}
                                        onClick={() => {
                                            if (hasAvailable) {
                                                setSelectedColor(color);
                                                const variantForColor =
                                                    variantsForColor.find((v) => v.isAvailable) ?? null;
                                                setActiveVariant(variantForColor);
                                            }
                                        }}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-md border text-sm transition
                      ${
                                            selectedColor === color
                                                ? 'border-black font-semibold'
                                                : 'border-gray-300 text-gray-600'
                                        }
                      ${
                                            !hasAvailable
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:border-black'
                                        }
                    `}
                                    >
                    <span
                        className="inline-block rounded-full"
                        style={{
                            width: '17px',
                            height: '17px',
                            backgroundColor: color,
                            border: '1px solid #ccc',
                        }}
                    />
                                        {color}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Размеры */}
                    <div className="mt-6">
                        <h3 className="mb-2 font-medium">Размер</h3>
                        <div className="flex flex-wrap gap-2">
                            {sizes.map((variant) => (
                                <button
                                    key={`${variant.id}-${variant.size}`}
                                    disabled={!variant.isAvailable}
                                    onClick={() => {
                                        if (variant.isAvailable) {
                                            setActiveVariant(variant);
                                        }
                                    }}
                                    className={`px-3 py-1 rounded-md border text-sm transition
                    ${
                                        activeVariant?.id === variant.id
                                            ? 'border-black font-semibold'
                                            : 'border-gray-300 text-gray-600'
                                    }
                    ${
                                        !variant.isAvailable
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:border-black'
                                    }
                  `}
                                >
                                    {variant.size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Кнопка Добавить в корзину */}
                    <div className="mt-[30px]">
                        <button
                            className="w-full h-[56px] rounded-[8px] border border-[#2A2A2B]
                         text-[14px] leading-[18px] uppercase
                         cursor-pointer transition
                         hover:bg-gray-100 active:scale-95"
                        >
                            Добавить в корзину
                        </button>
                    </div>

                    {/* Кнопка Добавить в избранное */}
                    <div className="mt-[20px]">
                        <button className="flex items-center gap-2 cursor-pointer transition hover:opacity-80">
                            <img src={WishListInCard} alt="Избранное" className="w-5 h-5" />
                            <span className="text-[16px] leading-[22px] text-[#999]">
                Добавить в избранное
              </span>
                        </button>
                    </div>

                    {/* Кнопки коллекция/категория */}
                    <div className="mt-[30px] flex gap-3">
                        <button className="flex items-center justify-between w-full h-[45px] rounded-[8px] border border-[#999] px-[20px] cursor-pointer transition hover:bg-gray-50">
              <span className="text-[#999] text-[12px] leading-[18px]">
                Все товары из коллекции
              </span>
                            <img src={ArrowRightInCard} alt="Коллекция" className="w-2 h-2" />
                        </button>

                        <button className="flex items-center justify-between w-full h-[45px] rounded-[8px] border border-[#999] px-[20px] cursor-pointer transition hover:bg-gray-50">
              <span className="text-[#999] text-[12px] leading-[18px]">
                Все товары из категории
              </span>
                            <img src={ArrowRightInCard} alt="Категория" className="w-2 h-2" />
                        </button>
                    </div>

                    {/* Аккордеоны */}
                    <div className="mt-[62px] flex flex-col divide-y divide-[#CCC]">
                        <FilterAccordion
                            title="ОПИСАНИЕ"
                            isOpen={isDescriptionOpen}
                            onToggle={() => setIsDescriptionOpen(!isDescriptionOpen)}
                        >
                            <p className="text-[#999] leading-[22px] text-[14px] mt-[22px]">
                                {product.description || 'Описание отсутствует'}
                            </p>
                        </FilterAccordion>

                        <FilterAccordion
                            title="СОСТАВ"
                            isOpen={isStructureOpen}
                            onToggle={() => setIsStructureOpen(!isStructureOpen)}
                        >
                            <p className="text-[#999] leading-[22px] text-[14px] mt-[22px]">
                                {product.structure || 'Состав отсутствует'}
                            </p>
                        </FilterAccordion>

                        <FilterAccordion
                            title="ОТЗЫВЫ"
                            isOpen={isReviewsOpen}
                            onToggle={() => setIsReviewsOpen(!isReviewsOpen)}
                            rightContent={
                                <div className="flex items-center ml-[40px]">
      <span className="text-[#999] text-[14px] mr-2">
        {product.score?.toFixed(1) ?? '0.0'}
      </span>
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            const diff = (product.score ?? 0) - star + 1;
                                            let fill = '#E5E7EB'; // по умолчанию пустая

                                            if (diff >= 1) {
                                                fill = '#F8C6D7'; // полная
                                            }

                                            // если звезда частично закрашена
                                            if (diff > 0 && diff < 1) {
                                                const percent = Math.round(diff * 100); // % закрашивания
                                                return (
                                                    <svg
                                                        key={star}
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        className="w-4 h-4"
                                                    >
                                                        <defs>
                                                            <linearGradient id={`grad-${star}`}>
                                                                <stop offset={`${percent}%`} stopColor="#F8C6D7" />
                                                                <stop offset={`${percent}%`} stopColor="#E5E7EB" />
                                                            </linearGradient>
                                                        </defs>
                                                        <path
                                                            fill={`url(#grad-${star})`}
                                                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                                        />
                                                    </svg>
                                                );
                                            }

                                            // полная или пустая
                                            return (
                                                <svg
                                                    key={star}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill={fill}
                                                    className="w-4 h-4"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            );
                                        })}
                                    </div>
                                </div>
                            }
                        >
                            <p className="text-[#999] leading-[22px] text-[14px] mt-[22px]">
                                Здесь будут отзывы покупателей.
                            </p>
                        </FilterAccordion>

                    </div>
                </div>
            </div>
        </div>
    );
}
