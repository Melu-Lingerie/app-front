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
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed.ts';
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
    const { addItem: addToRecentlyViewed } = useRecentlyViewed();
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

    // сохранение товара в историю просмотров
    useEffect(() => {
        if (!product || !activeVariant) return;

        // Преобразуем в формат ProductCatalogResponseDto для хранения
        addToRecentlyViewed({
            productId: product.productId,
            name: product.name,
            price: activeVariant.price,
            s3url: activeVariant.productVariantMedia?.[0]?.url || '',
            colors: product.productVariants?.map(v => v.colorName) || [],
            productStatus: 'AVAILABLE',
        });
    }, [product, activeVariant, addToRecentlyViewed]);

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
        <div className="w-full pt-4 md:pt-6">
            <div className="flex flex-col md:flex-row w-full gap-5 mb-10 md:mb-20">
                {/* Картинки */}
                <div className="w-full md:flex-1 md:mr-5 px-4 md:px-0">
                    <ProductImages images={images} />
                </div>

                {/* Инфоблок */}
                <div className="w-full md:flex-1 md:shrink-0 px-4 md:pr-10 md:px-0 mt-6 md:mt-[60px]">
                    <div className="md:sticky md:top-[20px]">
                        {/* Заголовок + цена */}
                        <div className="flex flex-col gap-3 md:gap-[24px]">
                            <h1 className="text-[18px] md:text-[24px] leading-[22px] md:leading-[26px] font-bold uppercase">
                                {product.name}
                            </h1>
                            <p className="text-[#999] text-[14px] md:text-[16px] leading-[18px]">
                                {product.articleNumber}
                            </p>
                            {activeVariant ? (
                                <p className="text-[20px] md:text-[24px] leading-[24px] md:leading-[26px]">
                                    {`${numberFormat(activeVariant.price)} ₽`}
                                </p>
                            ) : (
                                <p className="text-red-500">Нет доступных размеров</p>
                            )}
                        </div>

                        {/* Цвета и Размеры - Mobile Dropdowns */}
                        <div className="md:hidden mt-6 flex gap-3">
                            {/* Color Dropdown */}
                            <div className="flex-1 relative">
                                <select
                                    value={selectedColor || ''}
                                    onChange={(e) => {
                                        const color = e.target.value;
                                        setSelectedColor(color);
                                        const variantsForColor = product.productVariants?.filter(v => v.colorName === color) ?? [];
                                        const variantForColor = variantsForColor.find(v => v.isAvailable) ?? null;
                                        setActiveVariant(variantForColor);
                                    }}
                                    className="w-full h-[56px] px-4 bg-[#FFFAF4] dark:bg-[#2A2A2B] border border-[#999] rounded-lg text-[14px] appearance-none cursor-pointer"
                                >
                                    {colors.map((color) => (
                                        <option key={color} value={color}>{color}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                                        <path d="M8.49996 9.33027L12.0061 5.82422L13.0078 6.82595L8.49996 11.3338L3.99219 6.82595L4.99392 5.82422L8.49996 9.33027Z" fill="#999"/>
                                    </svg>
                                </div>
                            </div>
                            {/* Size Dropdown */}
                            <div className="flex-1 relative">
                                <select
                                    value={activeVariant?.id || ''}
                                    onChange={(e) => {
                                        const variant = sizes.find(v => String(v.id) === e.target.value);
                                        if (variant) setActiveVariant(variant);
                                    }}
                                    className="w-full h-[56px] px-4 bg-[#FFFAF4] dark:bg-[#2A2A2B] border border-[#999] rounded-lg text-[14px] appearance-none cursor-pointer"
                                >
                                    {sizes.map((variant) => (
                                        <option key={variant.id} value={variant.id} disabled={!variant.isAvailable}>
                                            {variant.size}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                                        <path d="M8.49996 9.33027L12.0061 5.82422L13.0078 6.82595L8.49996 11.3338L3.99219 6.82595L4.99392 5.82422L8.49996 9.33027Z" fill="#999"/>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Цвета - Desktop */}
                        <div className="hidden md:block mt-8">
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
                                                    ? 'border-black font-semibold dark:border-gray-300'
                                                    : 'border-gray-300 text-gray-600 dark:border-black'
                                            }
                                                ${
                                                !hasAvailable
                                                    ? 'opacity-30 cursor-not-allowed'
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

                        {/* Размеры - Desktop */}
                        <div className="hidden md:block mt-6">
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
                                                ? 'border-black font-semibold dark:border-gray-300'
                                                : 'border-gray-300 text-gray-600 dark:border-black'
                                        }
                                            ${
                                            !variant.isAvailable
                                                ? 'opacity-30 cursor-not-allowed'
                                                : 'hover:border-black'
                                        }`}
                                    >
                                        {variant.size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Кнопка Добавить в корзину */}
                        <div className="mt-4 md:mt-[30px]">
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
                                    className="w-full h-[56px] rounded-[8px] border border-[#2A2A2B] dark:border-white/10
                                        text-[14px] leading-[18px] uppercase
                                        cursor-pointer transition active:scale-95
                                        hover:bg-gray-100 hover:dark:bg-white/10 flex items-center justify-center"
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
                        <div className="mt-3 md:mt-[20px]">
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
                        <div className="mt-4 md:mt-[30px] flex flex-col md:flex-row gap-2 md:gap-3">
                            <button className="flex items-center justify-between w-full h-[44px] md:h-[45px] rounded-[8px] border border-[#999] px-4 md:px-[20px] cursor-pointer transition hover:bg-gray-50 hover:dark:bg-white/10">
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
                                className="flex items-center justify-between w-full h-[44px] md:h-[45px] rounded-[8px] border border-[#999] px-4 md:px-[20px] cursor-pointer transition hover:bg-gray-50 hover:dark:bg-white/10"
                            >
                                <span className="text-[#999] text-[12px] leading-[18px]">
                                    Все товары из категории
                                </span>
                                <img src={ArrowRightInCard} alt="Категория" className="w-2 h-2" />
                            </button>
                        </div>

                        {/* Аккордеоны */}
                        <div className="mt-8 md:mt-[62px] flex flex-col divide-y divide-[#CCC]">
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
                <div className="px-4 md:px-10 mt-10 md:mt-[60px]">
                    <h1 className="text-[18px] md:text-[24px] leading-[22px] md:leading-[26px] uppercase mb-4 md:mb-6">
                        Возможно вам понравится
                    </h1>

                        <Carousel
                            items={relatedGoods}
                            gap={10}
                            loading={relatedLoading}
                            visibleCount={6}
                            mobileVisibleCount={2}
                            renderItem={(item, {widthStyle, idx, reportImageHeight}) => (
                                <div key={idx} style={widthStyle}>
                                    <Card card={item} reportImageHeight={reportImageHeight}/>
                                </div>
                            )}
                        />
                </div>
            )}

            {/* Divider */}
            <div className="w-full h-[1px] bg-[#CCC] dark:bg-white/10 mt-10 md:mt-[90px]" />
        </div>
    );
}
