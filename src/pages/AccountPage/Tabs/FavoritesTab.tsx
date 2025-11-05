import { useSelector } from 'react-redux';
import { selectWishlistItems } from '@/store/wishlistSlice';
import { selectAppInitialized } from '@/store/appSlice';
import ForWishListSkeleton from '@/assets/ForWishListSkeleton.svg';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {ProductSkeleton} from '@/pages/Catalog/ProductSkeleton';
import {Card} from "@/components";

export const FavoritesTab = () => {
    const navigate = useNavigate();
    const wishListItems = useSelector(selectWishlistItems);
    const initialized = useSelector(selectAppInitialized);
    const items: any = wishListItems.map((wishlistItem) => {
        return wishlistItem.productCatalogResponseDto;
    });

    // Логика отображения
    if (!initialized) {
        return (
            <div>
                <h2 className="text-[24px] leading-[26px] uppercase font-semibold mb-23">
                    Избранные товары
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-[60px]">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <ProductSkeleton key={`skeleton-${i}`} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-[24px] leading-[26px] uppercase font-semibold mb-23">
                Избранные товары
            </h2>
            {items.length === 0 ? (
                <div className="flex flex-col items-center mt-[160px]">
                    <div className="flex gap-6 mb-[60px]">
                        {[1,2,3].map(i => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="relative w-[135px] h-[202px] bg-[#F5F5F5] rounded-md mb-[6px]">
                                    <img src={ForWishListSkeleton} className="absolute top-2 right-2 w-5 h-5" />
                                </div>
                                <div className="w-[109px] h-[4px] bg-[#F5F5F5] mb-[4px]" />
                                <div className="w-[69px] h-[4px] bg-[#F5F5F5]" />
                            </div>
                        ))}
                    </div>

                    <p className="text-[16px] leading-[18px] uppercase mb-[20px]">В избранном пусто</p>

                    <p className="text-[16px] leading-[22px] font-normal text-center mb-[30px] max-w-[520px]">
                        Нажмите на символ «добавить в избранное» рядом с понравившейся моделью, чтобы добавить товар в раздел Избранное.
                    </p>

                    <button
                        onClick={() => navigate('/catalog')}
                        className="w-[243px] h-[56px] rounded-[8px] border border-[#FFFBF5] bg-[#F8C6D7] text-[14px] leading-[18px] uppercase cursor-pointer hover:shadow-md transition"
                    >
                        каталог товаров
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
                    <AnimatePresence>
                        {items.map((item, idx) => (
                            <motion.div
                                key={item.productId || idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                            >
                                <Card card={item as any} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};