import { type CartItemDetailsFacadeResponseDto } from '@/api';
import WishListInCard from '@/assets/WishListInCard.svg';
import DeleteInCart from '@/assets/DeleteInCart.svg';
import { numberFormat } from '@/utils/utils';
import { DotsLoader } from '@/components/DotsLoader';

type Props = {
    item: CartItemDetailsFacadeResponseDto;
    isRemoving?: boolean;
    isUpdating?: boolean;
    isSelected?: boolean;
    onToggleSelect?: (itemId: number) => void;
    onIncrease?: (itemId: number) => void;
    onDecrease?: (itemId: number) => void;
    onRemove?: (itemId: number) => void;
    onAddToFavorites?: (itemId: number) => void;
};

export const CartItem = ({
                             item,
                             isRemoving = false,
                             isUpdating = false,
                             isSelected = true,
                             onToggleSelect,
                             onIncrease,
                             onDecrease,
                             onRemove,
                             onAddToFavorites,
                         }: Props) => {
    const isLoading = isRemoving || isUpdating;

    return (
        <div className="relative border-t border-[#CCC] dark:border-white/10 pt-6 w-full">
            {/* Лоадер с плавным появлением */}
            <div
                className={`absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-white/10 transition-opacity duration-300 ${
                    isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className={`transition-all duration-300 transform ${
                        isLoading ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                    }`}
                >
                    <DotsLoader size={8} />
                </div>
            </div>

            <div
                className={`flex gap-4 md:gap-6 w-full transition-opacity duration-300 ${
                    isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'
                }`}
            >
                {/* Чекбокс */}
                <div className="flex items-center shrink-0">
                    <button
                        type="button"
                        onClick={() => onToggleSelect?.(item.itemId!)}
                        className={`w-5 h-5 md:w-6 md:h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
                            isSelected
                                ? 'bg-[#F8C6D7] border-[#F8C6D7]'
                                : 'bg-transparent border-[#CCC] dark:border-white/30'
                        }`}
                    >
                        {isSelected && (
                            <svg
                                className="w-3 h-3 md:w-4 md:h-4 text-black"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Картинка */}
                <div className="w-[80px] h-[104px] md:w-[104px] md:h-[135px] bg-gray-100 flex items-center justify-center overflow-hidden rounded-md shrink-0">
                    {item.imageUrl ? (
                        <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <span className="text-gray-400 text-xs">Нет фото</span>
                    )}
                </div>

                {/* Правая часть */}
                <div className="flex-1 flex flex-col justify-between w-full min-w-0">
                    {/* SKU */}
                    <p className="text-[#999] text-[10px] md:text-[12px] leading-[16px] md:leading-[18px]">
                        {item.productSku}
                    </p>

                    {/* Название и опции - на мобилке вертикально */}
                    <div className="mt-2 md:mt-[15px] flex flex-col md:flex-row md:items-center md:justify-between w-full gap-2 md:gap-0">
                        <h2
                            className="truncate text-[14px] md:text-[16px] font-normal leading-[20px] md:leading-[22px] max-w-full md:max-w-[200px]"
                            title={item.productName}
                        >
                            {item.productName}
                        </h2>

                        {/* Цвет и размер - на мобилке в строку */}
                        <div className="flex items-center gap-3 md:gap-[62px] md:ml-auto flex-wrap">
                            {item.variantColor && (
                                <div className="flex items-center text-[#999] font-normal leading-[22px]">
                                    <span
                                        className="inline-block rounded-full mr-1 md:mr-2"
                                        style={{
                                            width: '12px',
                                            height: '12px',
                                            backgroundColor: item.variantColor,
                                            border: '1px solid #ccc',
                                        }}
                                    />
                                    <span className="text-xs md:text-sm">
                                        {item.variantColor}
                                    </span>
                                </div>
                            )}
                            {item.variantSize && (
                                <span className="text-xs md:text-sm font-normal leading-[22px]">
                                    {item.variantSize}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Количество, цена, удалить - на мобилке в ряд */}
                    <div className="mt-2 md:mt-3 flex items-center justify-between gap-2 md:gap-4">
                        {/* Количество */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onDecrease?.(item.itemId!)}
                                className="text-[#999] text-[20px] md:text-[24px] font-medium leading-[22px] md:leading-[26px] cursor-pointer select-none"
                            >
                                −
                            </button>
                            <span className="w-5 md:w-6 text-center text-[#999] text-[14px] md:text-[16px] font-normal leading-[20px] md:leading-[22px]">
                                {item.quantity}
                            </span>
                            <button
                                onClick={() => onIncrease?.(item.itemId!)}
                                className="text-[#999] text-[20px] md:text-[24px] font-medium leading-[22px] md:leading-[26px] cursor-pointer select-none"
                            >
                                +
                            </button>
                        </div>

                        {/* Цена */}
                        <span className="text-[14px] md:text-[16px] font-normal leading-[20px] md:leading-[22px] text-[#999]">
                            {`${numberFormat(item.totalPrice ?? 0)} ₽`}
                        </span>

                        {/* Удалить */}
                        <button
                            onClick={() => onRemove?.(item.itemId!)}
                            className="w-[15px] h-[15px] md:w-[17px] md:h-[17px] flex items-center justify-center cursor-pointer hover:opacity-70"
                        >
                            <img
                                src={DeleteInCart}
                                alt="Удалить"
                                className="w-full h-full"
                            />
                        </button>
                    </div>

                    {/* Избранное */}
                    <button
                        onClick={() => onAddToFavorites?.(item.itemId!)}
                        className="flex items-center gap-2 mt-3 md:mt-4 cursor-pointer transition hover:opacity-80"
                    >
                        <img
                            src={WishListInCard}
                            alt="Избранное"
                            className="w-[10px] h-[14px] md:w-[12px] md:h-[17px]"
                        />
                        <span className="text-[#999] text-[11px] md:text-[12px] font-medium leading-[16px] md:leading-[18px]">
                            Добавить в избранное
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
