import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState, type AppDispatch } from '@/store';
import {
    clearCartApi,
    removeItemFromCart,
    updateItemQuantity,
} from '@/store/cartSlice';
import { selectWishlistId, selectWishlistItems, toggleWishlistItem } from '@/store/wishlistSlice';
import { selectIsAuthenticated } from '@/store/userSlice';
import { Spinner } from '@/components/Spinner';
import { CartItem } from './CartItem';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Carousel } from '@/components/Carousel';
import api from '@/axios/api.ts';
import { useNotifications } from '@/hooks/useNotifications.ts';
import { Card } from '@/components';
import { useIsMobile } from '@/hooks/useIsMobile';
import { HintModal } from '@/components/Modals/HintModal';

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
    const isMobile = useIsMobile();
    const {
        cartId,
        items,
        itemsCount,
        loading,
        removingItemIds,
        updatingItemIds,
    } = useSelector((state: RootState) => state.cart);
    const { addNotification } = useNotifications();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const wishlistId = useSelector(selectWishlistId);
    const wishlistItems = useSelector(selectWishlistItems);

    const favoriteProductIds = useMemo(() => {
        return new Set(wishlistItems.map(i => i.productCatalogResponseDto?.productId).filter(Boolean));
    }, [wishlistItems]);

    const [hintModalOpen, setHintModalOpen] = useState(false);
    const [relatedGoods, setRelatedGoods] = useState<any[]>([]);
    const [relatedLoading, setRelatedLoading] = useState(false);

    // Состояние выбранных товаров для оформления
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

    // При загрузке корзины выбираем все товары по умолчанию
    useEffect(() => {
        if (items.length > 0) {
            setSelectedItems(new Set(items.map(item => item.itemId!).filter(Boolean)));
        }
    }, [items]);

    // Переключение выбора товара
    const toggleItemSelect = (itemId: number) => {
        setSelectedItems(prev => {
            const next = new Set(prev);
            if (next.has(itemId)) {
                next.delete(itemId);
            } else {
                next.add(itemId);
            }
            return next;
        });
    };

    // Сумма выбранных товаров
    const selectedTotalAmount = useMemo(() => {
        return items
            .filter(item => selectedItems.has(item.itemId!))
            .reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);
    }, [items, selectedItems]);

    // Количество выбранных товаров
    const selectedCount = selectedItems.size;

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
            <div className="pt-[30px] md:pt-[60px] px-4 md:px-[195px] pb-[60px] md:pb-[120px] flex flex-col items-center text-center">
                <h1 className="text-[24px] md:text-[36px] leading-[26px] md:leading-[38px] uppercase mb-6">Корзина</h1>
                <p className="text-[#999] text-[14px] md:text-[16px] leading-[20px] md:leading-[22px]">Ваша корзина пуста</p>
            </div>
        );
    }

    return (
        <div className="pt-[30px] md:pt-[60px]">
            <div className="px-4 md:px-[195px] flex flex-col md:flex-row md:justify-between md:items-start gap-6 md:gap-10">
                {/* Левая колонка */}
                <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-[20px] md:mb-[30px] gap-2 md:gap-0">
                        <div className="flex items-baseline gap-2 md:gap-3">
                            <h1 className="text-[24px] md:text-[36px] leading-[26px] md:leading-[38px] uppercase">Корзина</h1>
                            {itemsCount > 0 && (
                                <span className="text-[#999] text-[14px] md:text-[16px] font-normal leading-[20px] md:leading-[22px]">
                                    {itemsCount} {getTovarWord(itemsCount)}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-4 md:gap-6">
                            <span
                                className="text-[#999] text-[12px] md:text-[16px] font-normal leading-[18px] md:leading-[22px] cursor-pointer hover:underline"
                                onClick={() => navigate('/catalog')}
                            >
                                Продолжить покупки
                            </span>
                            <span
                                className="text-[#999] text-[12px] md:text-[16px] font-normal leading-[18px] md:leading-[22px] cursor-pointer hover:underline"
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
                                        isSelected={selectedItems.has(item.itemId!)}
                                        isFavorite={favoriteProductIds.has(item.productId!)}
                                        onToggleSelect={toggleItemSelect}
                                        onRemove={(itemId) =>
                                            dispatch(
                                                removeItemFromCart({ cartId: cartId!, itemId })
                                            ).unwrap().catch(() => {
                                                addNotification('Не удалось удалить товар из корзины', 'error');
                                            })
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
                                        onAddToFavorites={() => {
                                            if (!wishlistId) {
                                                addNotification('Избранное не инициализировано', 'error');
                                                return;
                                            }
                                            const isInFavorites = favoriteProductIds.has(item.productId!);
                                            dispatch(toggleWishlistItem({ wishlistId: Number(wishlistId), productId: item.productId! }))
                                                .unwrap()
                                                .then(() => addNotification(
                                                    isInFavorites ? 'Товар убран из избранного' : 'Товар добавлен в избранное',
                                                    'success'
                                                ))
                                                .catch(() => addNotification(
                                                    isInFavorites ? 'Не удалось убрать из избранного' : 'Не удалось добавить в избранное',
                                                    'error'
                                                ));
                                        }}
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
                    className="w-full md:w-[445px] h-auto border border-[#242424] rounded-md px-4 md:px-[20px] pt-[20px] md:pt-[30px] pb-[20px] md:pb-[30px] flex flex-col md:sticky md:top-[60px]"
                >
                    <div className="flex items-center justify-between mb-[8px]">
                        <span className="text-[14px] md:text-[16px] font-medium leading-[18px] uppercase">К оплате</span>
                        <span className="text-[14px] md:text-[16px] font-medium leading-[18px] uppercase">
                            {selectedTotalAmount.toLocaleString()} ₽
                        </span>
                    </div>
                    <div className="text-[#999] text-[11px] md:text-[12px] font-medium leading-[18px] mb-[12px]">
                        Выбрано {selectedCount} из {itemsCount} {getTovarWord(itemsCount)}
                    </div>
                    <div className="flex items-center justify-between mb-[20px] md:mb-[35px]">
                        <span className="text-[#999] text-[11px] md:text-[12px] font-medium leading-[18px]">
                            Доставка
                        </span>
                        <span className="text-[#999] text-[11px] md:text-[12px] font-medium leading-[18px]">
                            0 ₽
                        </span>
                    </div>
                    <button
                        disabled={selectedCount === 0}
                        onClick={() => navigate('/checkout')}
                        className="w-full h-[48px] md:h-[56px] rounded-[8px] border border-[#FFFBF5] dark:border-white/10 bg-[#F8C6D7] text-[13px] md:text-[14px] leading-[18px] uppercase font-medium cursor-pointer hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Оформить заказ
                    </button>
                    {selectedCount > 0 && (
                        <button
                            onClick={() => setHintModalOpen(true)}
                            className="w-full h-[48px] md:h-[56px] rounded-[8px] border border-[#CCC] dark:border-white/10 text-[13px] md:text-[14px] leading-[18px] uppercase font-medium cursor-pointer hover:opacity-90 transition mt-3"
                        >
                            Намекнуть о подарке
                        </button>
                    )}
                    {!isAuthenticated && (
                        <>
                            <div className="w-full h-[1px] bg-[#CCC] dark:bg-white/10 my-[15px] md:my-[20px]" />
                            <p className="text-[#999] text-[11px] md:text-[12px] font-medium leading-[18px]">
                                <span className="text-[#F8C6D7] underline cursor-pointer">Войдите</span> или <span className="text-[#F8C6D7] underline cursor-pointer">зарегистрируйтесь</span>, чтобы применить промокод или получить баллы за покупку.
                            </p>
                        </>
                    )}
                </motion.div>
            </div>

            {/* Divider */}
            <div className="relative left-1/2 ml-[-50vw] w-screen h-[1px] bg-[#CCC] dark:bg-white/10 mt-[30px] md:mt-[60px]" />

            {/* Дополните образ */}
            <div className="px-4 md:px-[195px] mt-[30px] md:mt-[60px]">
                <h2 className="text-[18px] md:text-[24px] font-medium leading-[22px] md:leading-[26px] uppercase mb-[30px] md:mb-[60px]">
                    Дополните образ
                </h2>

                    <Carousel
                        items={relatedGoods}
                        visibleCount={isMobile ? 2 : 5}
                        gap={isMobile ? 12 : 20}
                        loading={relatedLoading}
                        renderItem={(item, {widthStyle, idx, reportImageHeight}) => (
                            <div key={idx} style={widthStyle}>
                                <Card card={item} reportImageHeight={reportImageHeight}/>
                            </div>
                        )}
                    />
            </div>

            {/* Divider */}
            <div className="relative left-1/2 ml-[-50vw] w-screen h-[1px] bg-[#CCC] dark:bg-white/10 mt-[60px] md:mt-[120px]" />

            {/* Hint Modal */}
            <HintModal isOpen={hintModalOpen} onClose={() => setHintModalOpen(false)} />
        </div>
    );
}
