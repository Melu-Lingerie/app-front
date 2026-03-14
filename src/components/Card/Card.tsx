import { type CSSProperties, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { numberFormat } from '@/utils/utils.ts';
import { Heart } from 'lucide-react';

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
    const [isHovered, setIsHovered] = useState(false);
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
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className='cursor-pointer'
        >
            {/* Image block */}
            <div className='relative w-full aspect-[2/3] overflow-hidden'>
                {!isLoaded && (
                    <div className='w-full h-full bg-[#F0EDE8] animate-pulse' />
                )}

                <img
                    ref={(el) => {
                        if (el && el.complete && !isLoaded) {
                            setIsLoaded(true);
                            if (reportImageHeight) {
                                reportImageHeight(el.clientHeight);
                            }
                        }
                    }}
                    className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-500 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                    } ${isHovered ? 'scale-[1.03]' : 'scale-100'}`}
                    src={s3url}
                    alt={name}
                    onLoad={(e) => {
                        setIsLoaded(true);
                        if (reportImageHeight) {
                            reportImageHeight((e.target as HTMLImageElement).clientHeight);
                        }
                    }}
                    loading='lazy'
                />

                {/* NEW badge — top-left */}
                {productStatus === 'NEW' && (
                    <div
                        className='absolute top-[10px] left-[10px] px-[7px] py-[3px] text-[9px] uppercase tracking-[0.15em]'
                        style={{ background: '#1C1A18', color: '#FAF8F4' }}
                    >
                        new
                    </div>
                )}

                {/* SOON badge */}
                {productStatus === 'SOON' && (
                    <div
                        className='absolute top-[10px] left-[10px] px-[7px] py-[3px] text-[9px] uppercase tracking-[0.15em]'
                        style={{ background: '#1C1A18', color: '#FAF8F4' }}
                    >
                        скоро
                    </div>
                )}

                {/* Wishlist heart — top-right */}
                <button
                    type="button"
                    className={`absolute top-[10px] right-[10px] transition-opacity duration-200 ${
                        wishlistLoading ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    onClick={handleWishlistClick}
                    style={{ opacity: inWishlist ? 1 : isHovered ? 0.7 : 0.4 }}
                >
                    <Heart
                        size={18}
                        fill={inWishlist ? '#8B2E2E' : 'none'}
                        stroke={inWishlist ? '#8B2E2E' : '#8B2E2E'}
                        strokeWidth={1.5}
                    />
                </button>

                {/* Hover overlay — "Смотреть" button */}
                <div
                    className={`absolute bottom-0 left-0 right-0 h-[36px] flex items-center justify-center transition-all duration-300 ${
                        isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                    style={{ background: 'rgba(28,26,24,0.75)' }}
                >
                    <span className='text-white text-[10px] uppercase tracking-[0.14em]'>
                        Смотреть
                    </span>
                </div>
            </div>

            {/* Info */}
            <div style={{ padding: '14px 0 0', minHeight: '70px' }}>
                {/* Name — serif, lowercase */}
                <p
                    className='truncate mb-1'
                    style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontWeight: 300,
                        fontSize: '15px',
                        letterSpacing: '0.03em',
                        color: '#2A2A2B',
                    }}
                >
                    {name.toLowerCase()}
                </p>

                {/* Color dots */}
                {colors.length > 0 && (
                    <div className='flex gap-[5px] mb-[6px]'>
                        {[...new Set(colors)].map((color, index) => (
                            <span
                                key={index}
                                className='w-[10px] h-[10px] rounded-full inline-block'
                                style={{
                                    backgroundColor: resolveColor(color),
                                    border: '0.5px solid rgba(0,0,0,0.15)',
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Price */}
                <p
                    style={{
                        fontSize: '13px',
                        fontWeight: 300,
                        color: '#3a3a3a',
                    }}
                >
                    {`${numberFormat(price)} \u20BD`}
                </p>
            </div>
        </div>
    );
};
