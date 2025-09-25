import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState, type AppDispatch } from '@/store';
import {
    clearCartApi,
    removeItemFromCart,
    updateItemQuantity,
} from '@/store/cartSlice';
import { Spinner } from '@/components/Spinner';
import { CartItem } from './CartItem';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Carousel } from '@/components/Carousel';
import api from '@/axios/api.ts';
import { useNotifications } from '@/hooks/useNotifications.ts';
import { Card } from '@/components';

const getTovarWord = (count: number) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return 'товар';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'товара';
    return 'товаров';
};

export function CartPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const {
        cartId,
        items,
        itemsCount,
        totalAmount,
        loading,
        removingItemIds,
        updatingItemIds,
    } = useSelector((state: RootState) => state.cart);
    const { addNotification } = useNotifications();

    const [relatedGoods, setRelatedGoods] = useState<any[]>([]);
    const [relatedLoading, setRelatedLoading] = useState(false);

    const categoryIds = useMemo(() => {
        const ids = items.map((i) => i.categoryId).filter(Boolean);
        return Array.from(new Set(ids));
    }, [items]);

    // загрузка товаров для "Дополните образ"
    useEffect(() => {
        if (!cartId) return;
        if (!items.length) return;       // ждём пока в корзине появятся товары
        if (!categoryIds.length) return; // если нет категорий, не идём в API

        const fetchRelated = async () => {
            try {
                setRelatedLoading(true);
                const res = await api.get('/products/catalog', {
                    params: {
                        categories: categoryIds,
                        limit: 20, // можно добавить ограничение
                    },
                    paramsSerializer: { indexes: null },
                });
                setRelatedGoods(res.data.content || []);
            } catch {
                addNotification('Не удалось загрузить подборку товаров', 'error');
            } finally {
                setRelatedLoading(false);
            }
        };

        fetchRelated();
    }, [cartId, items, categoryIds, addNotification]);

    if (!cartId || loading) {
        return (
            <div className="flex items-center justify-center w-full min-h-[300px]">
                <Spinner className="text-gray-500" size={48} />
            </div>
        );
    }

    if (itemsCount === 0) {
        return (
            <div className="pt-[60px] px-[195px] pb-[120px] flex flex-col items-center text-center">
                <h1 className="text-[36px] leading-[38px] uppercase mb-6">Корзина</h1>
                <p className="text-[#999] text-[16px] leading-[22px]">Ваша корзина пуста</p>
            </div>
        );
    }

    return (
        <div className="pt-[60px] pb-[90px]">
            <div className="px-[195px] flex justify-between items-start gap-10">
                {/* Левая колонка */}
                <div className="flex-1">
                    <div className="flex items-baseline justify-between mb-[30px]">
                        <div className="flex items-baseline gap-3">
                            <h1 className="text-[36px] leading-[38px] uppercase">Корзина</h1>
                            {itemsCount > 0 && (
                                <span className="text-[#999] text-[16px] font-normal leading-[22px]">
                                    {itemsCount} {getTovarWord(itemsCount)}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-6">
                            <span
                                className="text-[#999] text-[16px] font-normal leading-[22px] cursor-pointer"
                                onClick={() => navigate('/catalog')}
                            >
                                Продолжить покупки
                            </span>
                            <span
                                className="text-[#999] text-[16px] font-normal leading-[22px] cursor-pointer"
                                onClick={() => {
                                    if (cartId) dispatch(clearCartApi(cartId));
                                }}
                            >
                                Очистить корзину
                            </span>
                        </div>
                    </div>

                    {/* Список товаров */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.1 } },
                        }}
                        className="flex flex-col gap-6"
                    >
                        <AnimatePresence mode="popLayout">
                            {items.map((item) => (
                                <motion.div
                                    key={item.itemId}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 },
                                    }}
                                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                >
                                    <CartItem
                                        item={item}
                                        isRemoving={removingItemIds.includes(item.itemId!)}
                                        isUpdating={updatingItemIds.includes(item.itemId!)}
                                        onRemove={(itemId) =>
                                            dispatch(
                                                removeItemFromCart({ cartId: cartId!, itemId })
                                            )
                                        }
                                        onIncrease={(itemId) =>
                                            dispatch(
                                                updateItemQuantity({
                                                    cartId: cartId!,
                                                    itemId,
                                                    quantity: (item.quantity ?? 1) + 1,
                                                })
                                            )
                                        }
                                        onDecrease={(itemId) =>
                                            item.quantity &&
                                            item.quantity > 1 &&
                                            dispatch(
                                                updateItemQuantity({
                                                    cartId: cartId!,
                                                    itemId,
                                                    quantity: item.quantity - 1,
                                                })
                                            )
                                        }
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Правая колонка — Оплата */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="w-[445px] h-[310px] border border-[#242424] rounded-md px-[20px] pt-[30px] pb-[60px] flex flex-col sticky top-[60px]"
                >
                    <div className="flex items-center justify-between mb-[12px]">
                        <span className="font-medium leading-[18px] uppercase">Цена</span>
                        <span className="font-medium leading-[18px] uppercase">
                            {totalAmount?.toLocaleString()} ₽
                        </span>
                    </div>
                    <div className="flex items-center justify-between mb-[35px]">
                        <span className="text-[#999] text-[12px] font-medium leading-[18px]">
                            Доставка
                        </span>
                        <span className="text-[#999] text-[12px] font-medium leading-[18px]">
                            Рассчитывается при оформлении
                        </span>
                    </div>
                    <button className="w-[405px] h-[56px] rounded-[8px] border border-[#FFFBF5] bg-[#F8C6D7] text-[14px] leading-[18px] uppercase font-medium cursor-pointer hover:opacity-90 transition">
                        Оформить заказ
                    </button>
                    <div className="w-full h-[1px] bg-[#CCC] my-[20px]" />
                    <p className="text-[#999] text-[12px] font-medium leading-[18px]">
                        Войдите или зарегистрируйтесь, чтобы применить промокод или получить баллы за
                        покупку.
                    </p>
                </motion.div>
            </div>

            {/* Divider */}
            <div className="relative left-1/2 ml-[-50vw] w-screen h-[1px] bg-[#CCC] mt-[60px]" />

            {/* Дополните образ */}
            <div className="px-[195px] mt-[60px]">
                <h2 className="text-[24px] font-medium leading-[26px] uppercase mb-[60px]">
                    Дополните образ
                </h2>

                {relatedLoading ? (
                    <div className="flex justify-center">
                        <Spinner className="text-gray-500" size={32} />
                    </div>
                ) : (
                    <Carousel
                        items={relatedGoods}
                        visibleCount={5}
                        gap={20}
                        renderItem={(item, { widthStyle, idx }) => (
                            <div key={idx} style={widthStyle}>
                                <Card card={item} />
                            </div>
                        )}
                    />
                )}
            </div>
        </div>
    );
}
