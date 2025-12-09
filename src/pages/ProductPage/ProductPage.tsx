import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import FillWishList from '@/assets/FillWishList.svg';
import ArrowRightInCard from '@/assets/ArrowRightInCard.svg';
import ArrowRightSmallIcon from '@/assets/ArrowRightSmallIcon.svg';
import { FilterAccordion } from '@/pages/Catalog/FilterSidebar/FilterAccordion.tsx';
import { Card } from '@/components';
import { Carousel } from '@/components/Carousel/Carousel';
import { DotsLoader } from '@/components/DotsLoader';
import { RatingStars } from './RatingStars.tsx';

// redux
import { useDispatch, useSelector } from 'react-redux';
import { type RootState, type AppDispatch } from '@/store';
import { addItemToCart, fetchCart } from '@/store/cartSlice';
import {
    toggleWishlistItem,
    selectWishlistId,
    selectWishlistItems,
    selectWishlistLoading,
} from '@/store/wishlistSlice.ts';
import { selectAppInitialized } from '@/store/appSlice';
import api from '@/axios/api.ts';

export function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const { addNotification } = useNotifications();
    const navigate = useNavigate();

    const dispatch = useDispatch<AppDispatch>();
    const cartId = useSelector((state: RootState) => state.cart.cartId);
    const items = useSelector((state: RootState) => state.cart.items);
    const loadingCart = useSelector((state: RootState) => state.cart.loading);

    const wishlistId = useSelector(selectWishlistId);
    const wishlistItems = useSelector(selectWishlistItems);
    const wishlistLoading = useSelector(selectWishlistLoading);
    const appInitialized = useSelector(selectAppInitialized);

    const [product, setProduct] = useState<ProductCardResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [activeVariant, setActiveVariant] =
        useState<ProductVariantCardDto | null>(null);

    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
    const [isStructureOpen, setIsStructureOpen] = useState(false);
    const [isReviewsOpen, setIsReviewsOpen] = useState(false);

    const [relatedGoods, setRelatedGoods] = useState<any[]>([]);
    const [relatedLoading, setRelatedLoading] = useState(false);

    // есть ли товар в корзине?
    const inCart = items.some(
        (i) =>
            i.productId === product?.productId && i.variantId === activeVariant?.id
    );

    // есть ли товар в избранном?
    const inWishlist = wishlistItems.some(
        (w) => w.productCatalogResponseDto?.productId === product?.productId
    );

    // загрузка товара
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

    // загрузка похожих товаров
    useEffect(() => {
        const fetchRelated = async () => {
            if (!product?.categoryId) return;
            try {
                setRelatedLoading(true);
                const res = await api.get('/products/catalog', {
                    params: { categories: [product.categoryId] },
                    paramsSerializer: { indexes: null },
                });
                setRelatedGoods(res.data.content || []);
            } catch {
                addNotification('Не удалось загрузить похожие товары', 'error');
            } finally {
                setRelatedLoading(false);
            }
        };

        fetchRelated();
    }, [product?.categoryId]);

    // добавление в корзину
    const handleAddToCart = async () => {
        if (!cartId || !product || !activeVariant) {
            addNotification('Ошибка: корзина или товар не найдены', 'error');
            return;
        }

        try {
            await dispatch(
                addItemToCart({
                    cartId,
                    productId: product.productId,
                    variantId: activeVariant.id,
                })
            ).unwrap();

            await dispatch(fetchCart(cartId));
            addNotification('Товар добавлен в корзину', 'success');
        } catch (e: any) {
            addNotification(e?.message || 'Ошибка при добавлении в корзину', 'error');
        }
    };

    // toggle избранного
    const handleToggleWishlist = () => {
        if (!wishlistId || !product) {
            addNotification('Ошибка: список избранного не найден', 'error');
            return;
        }
        dispatch(toggleWishlistItem({ wishlistId: Number(wishlistId), productId: product.productId }));
    };

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

    const colors = Array.from(new Set(product.productVariants?.map((v) => v.colorName)));
    const sizes =
        product.productVariants?.filter((v) => v.colorName === selectedColor) ?? [];
    const images = activeVariant?.productVariantMedia.slice(0, 4) ?? [];

    return (
        <div className="w-full">
            <div className="flex w-full gap-5 mb-20">
                {/* Картинки */}
                <div className="flex-1 mr-5">
                    <ProductImages images={images} />
                </div>

                {/* Инфоблок */}
                <div className="flex-1 shrink-0 pr-10 mt-[60px]">
                    <div className="sticky top-[20px]">
                        {/* Заголовок + цена */}
                        <div className="flex flex-col gap-[24px]">
                            <h1 className="text-[24px] leading-[26px] font-bold uppercase">
                                {product.name}
                            </h1>
                            <p className="text-[#999] leading-[18px]">
                                {product.articleNumber}
                            </p>
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
                                        product.productVariants?.filter(
                                            (v) => v.colorName === color
                                        ) ?? [];
                                    const hasAvailable = variantsForColor.some(
                                        (v) => v.isAvailable
                                    );

                                    return (
                                        <button
                                            key={color}
                                            disabled={!hasAvailable}
                                            onClick={() => {
                                                if (hasAvailable) {
                                                    setSelectedColor(color);
                                                    const variantForColor =
                                                        variantsForColor.find(
                                                            (v) => v.isAvailable
                                                        ) ?? null;
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
                                            }`}
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
                                        }`}
                                    >
                                        {variant.size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Кнопка Добавить в корзину */}
                        <div className="mt-[30px]">
                            {!appInitialized ? (
                                <div className="w-full h-[56px] rounded-[8px] bg-gray-200 animate-pulse" />
                            ) : inCart ? (
                                <button
                                    onClick={() => navigate('/cart')}
                                    className="w-full h-[56px] rounded-[8px] border bg-[#F8C6D7] border-[#F8C6D7]
                                        text-[14px] leading-[18px] uppercase
                                        cursor-pointer transition active:scale-95
                                        flex items-center justify-center"
                                >
                                    <span>Перейти в корзину</span>
                                    <img
                                        src={ArrowRightSmallIcon}
                                        alt="Перейти в корзину"
                                        className="w-5 h-5 ml-1"
                                    />
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={loadingCart}
                                    className="w-full h-[56px] rounded-[8px] border border-[#2A2A2B]
                                        text-[14px] leading-[18px] uppercase
                                        cursor-pointer transition active:scale-95
                                        hover:bg-gray-100 flex items-center justify-center"
                                >
                                    {loadingCart ? (
                                        <DotsLoader color="#2A2A2B" size={6} />
                                    ) : (
                                        'Добавить в корзину'
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Кнопка Добавить в избранное */}
                        <div className="mt-[20px]">
                            {!appInitialized ? (
                                <div className="w-[220px] h-[24px] rounded-[6px] bg-gray-200 animate-pulse" />
                            ) : (
                                <button
                                    onClick={handleToggleWishlist}
                                    disabled={wishlistLoading}
                                    className={`flex items-center gap-2 cursor-pointer transition 
                                        ${
                                        wishlistLoading
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:opacity-80'
                                    }`}
                                >
                                    <img
                                        src={inWishlist ? FillWishList : WishListInCard}
                                        alt="Избранное"
                                        className="w-5 h-5"
                                    />
                                    <span
                                        className={`text-[16px] leading-[22px] ${
                                            inWishlist ? 'text-[#F8C6D7]' : 'text-[#999]'
                                        }`}
                                    >
                                        {inWishlist ? 'В избранном' : 'Добавить в избранное'}
                                    </span>
                                </button>
                            )}
                        </div>

                        {/* Кнопки коллекция/категория */}
                        <div className="mt-[30px] flex gap-3">
                            <button className="flex items-center justify-between w-full h-[45px] rounded-[8px] border border-[#999] px-[20px] cursor-pointer transition hover:bg-gray-50">
                                <span className="text-[#999] text-[12px] leading-[18px]">
                                    Все товары из коллекции
                                </span>
                                <img src={ArrowRightInCard} alt="Коллекция" className="w-2 h-2" />
                            </button>

                            <button
                                onClick={() => {
                                    if (product?.categoryId) {
                                        navigate(`/catalog?types=${product.categoryId}`);
                                    }
                                }}
                                className="flex items-center justify-between w-full h-[45px] rounded-[8px] border border-[#999] px-[20px] cursor-pointer transition hover:bg-gray-50"
                            >
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
                                    <div className="mr-10">
                                        <RatingStars value={product.score ?? 0} />
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

            {/* Возможно вам понравится */}
            {relatedGoods.length > 0 && (
                <div className="px-10 mt-[60px]">
                    <h1 className="text-[24px] leading-[26px] uppercase mb-6">
                        Возможно вам понравится
                    </h1>

                        <Carousel
                            items={relatedGoods}
                            gap={20}
                            loading={relatedLoading}
                            visibleCount={6}
                            renderItem={(item, {widthStyle, idx, reportImageHeight}) => (
                                <div key={idx} style={widthStyle}>
                                    <Card card={item} reportImageHeight={reportImageHeight}/>
                                </div>
                            )}
                        />
                </div>
            )}

            {/* Divider */}
            <div className="w-full h-[1px] bg-[#CCC] mt-[90px]" />
        </div>
    );
}
