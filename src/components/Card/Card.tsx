import { type CSSProperties, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { numberFormat } from '@/utils/utils.ts';
import EmptyWishList from '@/assets/EmptyWishList.svg';
import FillWishList from '@/assets/FillWishList.svg';

// redux
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch } from '@/store';
import {
    toggleWishlistItem,
    selectWishlistId,
    selectWishlistItems,
    selectTogglingProductIds,
} from '@/store/wishlistSlice';
import type { ProductCatalogResponseDto } from '@/api';
import { resolveColor } from '@/utils/colorMap';

type Props = {
    card: Required<ProductCatalogResponseDto>;
    widthStyle?: CSSProperties;
    reportImageHeight?: (h: number) => void;
};

export const Card = ({
                         card: { s3url, name, productStatus, price, colors = [], productId },
                         widthStyle,
                         reportImageHeight,
                     }: Props) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();

    const dispatch = useDispatch<AppDispatch>();
    const wishlistId = useSelector(selectWishlistId);
    const wishlistItems = useSelector(selectWishlistItems);
    const togglingProductIds = useSelector(selectTogglingProductIds);

    const inWishlist = wishlistItems.some((w) => w.productCatalogResponseDto?.productId === productId);
    const wishlistLoading = togglingProductIds.includes(productId);

    const handleClick = () => {
        navigate(`/catalog/${productId}`);
    };

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (!wishlistId || wishlistLoading) return;
        dispatch(toggleWishlistItem({ wishlistId: Number(wishlistId), productId }));
    };

    return (
        <div
            style={widthStyle}
            onClick={handleClick}
            className='cursor-pointer'
        >
            {/* Image block */}
            <div className='relative w-full aspect-[2/3]'>
                {!isLoaded && (
                    <div className='w-full h-full bg-[#F0EDE8] animate-pulse' />
                )}

                <img
                    ref={(el) => {
                        if (el && el.complete && !isLoaded) {
                            setIsLoaded(true);
                            if (reportImageHeight) reportImageHeight(el.clientHeight);
                        }
                    }}
                    className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    src={s3url}
                    alt={name}
                    onLoad={(e) => {
                        setIsLoaded(true);
                        if (reportImageHeight) reportImageHeight((e.target as HTMLImageElement).clientHeight);
                    }}
                    loading='lazy'
                />

                {/* Bookmark / Wishlist icon — top right */}
                <div
                    className={`absolute top-[10px] right-[10px] transition ${
                        wishlistLoading
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer hover:opacity-80 active:scale-95'
                    }`}
                    onClick={handleWishlistClick}
                >
                    <img
                        src={inWishlist ? FillWishList : EmptyWishList}
                        alt='Избранное'
                    />
                </div>

                {/* "Скоро в продаже" badge */}
                {productStatus === 'SOON' && (
                    <div
                        className='absolute bottom-[10px] right-[10px] px-3 py-1 text-xs uppercase
                           rounded-lg border border-[#FFFBF5]
                           bg-[rgba(245,245,245,0.70)] backdrop-blur-[12px]
                           text-[#141414] leading-[18px]'
                    >
                        скоро в продаже
                    </div>
                )}
            </div>

            {/* Info */}
            <div className='w-full mt-3 md:mt-4'>
                {/* Name + NEW */}
                <div className='w-full mb-1 flex items-baseline justify-between gap-2'>
                    <p className='text-[12px] md:text-[13px] leading-[18px] truncate uppercase'>
                        {name}
                    </p>
                    {productStatus === 'NEW' && (
                        <span className='text-[#F895B7] text-[12px] md:text-[13px] leading-[18px] shrink-0'>NEW</span>
                    )}
                </div>

                {/* Price + Color dots */}
                <div className='w-full flex items-center'>
                    <p className='text-[12px] md:text-[13px] leading-[18px] mr-2'>{`${numberFormat(price)} \u20BD`}</p>
                    {colors.length > 0 && (
                        <ul className='flex'>
                            {[...new Set(colors)].map((color, index) => (
                                <li
                                    key={index}
                                    className='w-2.5 h-2.5 md:w-3 md:h-3 rounded-full mr-0.5 md:mr-1 last:mr-0'
                                    style={{
                                        backgroundColor: resolveColor(color),
                                        border: '1px solid rgba(0,0,0,0.12)',
                                    }}
                                    aria-label={`Цвет: ${color}`}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};
