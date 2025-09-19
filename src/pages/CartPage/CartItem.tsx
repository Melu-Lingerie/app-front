import { type CartItemDetailsFacadeResponseDto } from '@/api';
import WishListInCard from '@/assets/WishListInCard.svg';
import DeleteInCart from '@/assets/DeleteInCart.svg';
import { numberFormat } from '@/utils/utils';
import { DotsLoader } from '@/components/DotsLoader';

type Props = {
    item: CartItemDetailsFacadeResponseDto;
    isRemoving?: boolean;
    isUpdating?: boolean;
    onIncrease?: (itemId: number) => void;
    onDecrease?: (itemId: number) => void;
    onRemove?: (itemId: number) => void;
    onAddToFavorites?: (itemId: number) => void;
};

export const CartItem = ({
                             item,
                             isRemoving = false,
                             isUpdating = false,
                             onIncrease,
                             onDecrease,
                             onRemove,
                             onAddToFavorites,
                         }: Props) => {
    return (
        <div className="relative border-t border-[#CCC] pt-6 w-full">
            {(isRemoving || isUpdating) && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                    <DotsLoader size={8} />
                </div>
            )}
            <div className={`flex gap-6 w-full ${isRemoving || isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
                {/* Картинка */}
                <div className="w-[104px] h-[135px] bg-gray-100 flex items-center justify-center overflow-hidden rounded-md shrink-0">
                    {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} className="object-cover w-full h-full" />
                    ) : (
                        <span className="text-gray-400 text-xs">Нет фото</span>
                    )}
                </div>

                {/* Правая часть */}
                <div className="flex-1 flex flex-col justify-between w-full">
                    <p className="text-[#999] text-[12px] leading-[18px]">{item.productSku}</p>
                    <div className="mt-[15px] flex items-center justify-between w-full">
                        <h2 className="truncate text-[16px] font-normal leading-[22px] max-w-[200px]" title={item.productName}>
                            {item.productName}
                        </h2>
                        <div className="flex items-center gap-[62px] ml-auto">
                            {item.variantColor && (
                                <div className="flex items-center text-[#999] font-normal leading-[22px]">
                  <span
                      className="inline-block rounded-full mr-2"
                      style={{
                          width: '14px',
                          height: '14px',
                          backgroundColor: item.variantColor,
                          border: '1px solid #ccc',
                      }}
                  />
                                    <span className="text-sm">{item.variantColor}</span>
                                </div>
                            )}
                            {item.variantSize && (
                                <span className="text-sm font-normal leading-[22px]">{item.variantSize}</span>
                            )}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onDecrease?.(item.itemId!)}
                                    className="text-[#999] text-[24px] font-medium leading-[26px] cursor-pointer select-none"
                                >
                                    −
                                </button>
                                <span className="w-6 text-center text-[#999] font-normal leading-[22px]">{item.quantity}</span>
                                <button
                                    onClick={() => onIncrease?.(item.itemId!)}
                                    className="text-[#999] text-[24px] font-medium leading-[26px] cursor-pointer select-none"
                                >
                                    +
                                </button>
                            </div>
                            <span className="text-[16px] font-normal leading-[22px] text-[#999]">
                {`${numberFormat(item.totalPrice ?? 0)} ₽`}
              </span>
                            <button
                                onClick={() => onRemove?.(item.itemId!)}
                                className="w-[17px] h-[17px] flex items-center justify-center cursor-pointer hover:opacity-70"
                            >
                                <img src={DeleteInCart} alt="Удалить" className="w-[17px] h-[17px]" />
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => onAddToFavorites?.(item.itemId!)}
                        className="flex items-center gap-2 mt-4 cursor-pointer transition hover:opacity-80"
                    >
                        <img src={WishListInCard} alt="Избранное" className="w-[12px] h-[17px]" />
                        <span className="text-[#999] text-[12px] font-medium leading-[18px]">Добавить в избранное</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
