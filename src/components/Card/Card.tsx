import { type CSSProperties, type RefObject, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { numberFormat } from '@/utils/utils.ts';
import { useIsTruncated } from '@/hooks/useIsTruncated';
import EmptyWishList from '@/assets/EmptyWishList.svg';

type Props = {
    card: {
        productId: number;
        s3url: string;
        name: string;
        productStatus: 'AVAILABLE' | 'NEW' | 'SOON';
        price: string;
        colors: string[];
    };
    widthStyle?: CSSProperties;
    imageRef?: RefObject<HTMLDivElement | null>;
};

export const Card = ({
                         card: { s3url, name, productStatus, price, colors, productId },
                         widthStyle,
                         imageRef,
                     }: Props) => {
    const { ref: textRef, isTruncated } = useIsTruncated<HTMLParagraphElement>();
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/catalog/${productId}`);
    };

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // отменяем переход
    };

    return (
        <div
            style={widthStyle}
            onClick={handleClick}
            className="cursor-pointer transition-transform hover:scale-[1.01]"
        >
            {/* Image block */}
            <div className="relative mb-5 h-[666px]" ref={imageRef}>
                {!isLoaded && (
                    <div className="w-full h-full bg-gray-200 animate-pulse rounded-md" />
                )}

                <img
                    className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    src={s3url}
                    alt="Фото товара"
                    onLoad={() => setIsLoaded(true)}
                    loading="lazy"
                />

                {/* Иконка избранного */}
                <div
                    className="absolute top-[10px] right-[10px] cursor-pointer hover:opacity-80 active:scale-95 transition"
                    onClick={handleWishlistClick}
                >
                    <img src={EmptyWishList} alt="Избранное" />
                </div>

                {/* Плашка "Скоро в продаже" */}
                {productStatus === 'SOON' && (
                    <div
                        className="absolute bottom-[10px] right-[10px] px-3 py-1 text-xs uppercase
                       rounded-lg border border-[var(--Active-Main-Button-Stroke,#FFFBF5)]
                       bg-[rgba(245,245,245,0.70)] backdrop-blur-[12px]
                       text-[#141414] leading-[18px]"
                    >
                        скоро в продаже
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="w-full mt-5">
                <div className="w-full mb-1.5 flex items-center justify-between">
                    <span className="relative group max-w-[80%]">
                        <p ref={textRef} className="w-full text-sm truncate">
                            {name.toUpperCase()}
                        </p>
                        {isTruncated && (
                            <span
                                className="absolute left-0 top-full mt-1 px-2 py-1 bg-black text-white text-xs rounded-md z-10
                                   opacity-0 invisible translate-y-1 transition-all duration-200 ease-in-out
                                   group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                                   max-w-[250px] whitespace-normal"
                            >
                                {name}
                            </span>
                        )}
                    </span>
                    {productStatus === 'NEW' && <p className="text-[#F895B7]">NEW</p>}
                </div>

                <div className="w-full flex items-center">
                    <p className="text-sm truncate mr-2">{`${numberFormat(price)} ₽`}</p>
                    <ul className="flex">
                        {colors.map((color, index) => (
                            <li
                                key={index}
                                className="w-3.5 h-3.5 rounded-full mr-1 last:mr-0"
                                style={{
                                    backgroundColor: color,
                                    border: '2px solid #BFBFBF',
                                }}
                                aria-label={`Цвет: ${color}`}
                            />
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
