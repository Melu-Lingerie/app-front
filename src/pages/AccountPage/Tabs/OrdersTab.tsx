import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { selectAppInitialized } from '@/store/appSlice';
import { addItemToCart, fetchCart } from '@/store/cartSlice';
import { OrderService } from '@/api/services/OrderService';
import { useNotifications } from '@/hooks/useNotifications';
import type { OrderListResponseDto, OrderResponseDto, OrderItemDto } from '@/api/models/OrderResponseDto';
import type { OrderStatus } from '@/api/models/CheckoutResponseDto';
import type { PaymentMethod, DeliveryMethod } from '@/api/models/CheckoutRequestDto';
import type { AppDispatch, RootState } from '@/store';

const STATUS_LABELS: Record<OrderStatus, string> = {
    NEW: 'Новый',
    PAID: 'Оплачен',
    SHIPPED: 'Отправлен',
    DELIVERED: 'Доставлен',
    CANCELLED: 'Отменен',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
    NEW: 'bg-blue-100 text-blue-800',
    PAID: 'bg-green-100 text-green-800',
    SHIPPED: 'bg-yellow-100 text-yellow-800',
    DELIVERED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800',
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
    CARD: 'Банковская карта',
    SBP: 'СБП',
};

const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
    CDEK_POINT: 'СДЭК (пункт выдачи)',
    CDEK_COURIER: 'СДЭК (курьер)',
};

const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatPrice = (amount: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);

const OrderItemRow = ({ item, onAddToCart }: { item: OrderItemDto; onAddToCart: (item: OrderItemDto) => void }) => (
    <div className="flex items-center gap-4 py-[16px] border-b border-[#EEEEEE] last:border-b-0">
        <div className="w-[80px] h-[100px] bg-[#F5F5F5] rounded-[4px] overflow-hidden flex-shrink-0">
            {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-[#CCCCCC] text-[12px]">Нет фото</div>
            )}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[14px] leading-[18px] font-medium truncate">{item.productName}</p>
            <p className="text-[12px] leading-[16px] text-[#999999] mt-[4px]">Артикул: {item.articleNumber}</p>
            <div className="flex items-center gap-3 mt-[4px]">
                {item.color && (
                    <span className="text-[12px] leading-[16px] text-[#999999]">{item.color}</span>
                )}
                {item.size && (
                    <span className="text-[12px] leading-[16px] text-[#999999]">Размер: {item.size}</span>
                )}
            </div>
            <p className="text-[14px] leading-[18px] mt-[4px]">
                {formatPrice(item.unitPrice)} x {item.quantity}
            </p>
        </div>
        <button
            onClick={() => onAddToCart(item)}
            className="h-[36px] px-[16px] rounded-[8px] border border-[#F8C6D7] bg-white text-[12px] leading-[16px] uppercase whitespace-nowrap cursor-pointer hover:bg-[#F8C6D7]/20 active:scale-95 transition"
        >
            В корзину
        </button>
    </div>
);

const OrderCard = ({ order }: { order: OrderListResponseDto }) => {
    const dispatch = useDispatch<AppDispatch>();
    const cartId = useSelector((state: RootState) => state.cart.cartId);
    const { addNotification } = useNotifications();
    const [expanded, setExpanded] = useState(false);
    const [details, setDetails] = useState<OrderResponseDto | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const handleExpand = async () => {
        if (expanded) {
            setExpanded(false);
            return;
        }
        setExpanded(true);
        if (!details) {
            setDetailsLoading(true);
            try {
                const data = await OrderService.getOrder(order.id);
                setDetails(data);
            } catch {
                addNotification('Не удалось загрузить детали заказа', 'error');
            } finally {
                setDetailsLoading(false);
            }
        }
    };

    const handleAddToCart = async (item: OrderItemDto) => {
        if (!cartId) {
            addNotification('Корзина не инициализирована', 'error');
            return;
        }
        try {
            await dispatch(addItemToCart({ cartId, productId: item.productId, variantId: item.variantId })).unwrap();
            await dispatch(fetchCart(cartId));
            addNotification('Товар добавлен в корзину', 'success');
        } catch {
            addNotification('Не удалось добавить товар', 'error');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-[#CCCCCC] rounded-[8px] overflow-hidden"
        >
            <button
                onClick={handleExpand}
                className="w-full p-[20px] flex items-start justify-between cursor-pointer hover:bg-[#FAFAFA] transition-colors text-left"
            >
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-[8px]">
                        <span className={`px-[10px] py-[4px] rounded-full text-[12px] leading-[16px] font-medium ${STATUS_COLORS[order.status]}`}>
                            {STATUS_LABELS[order.status]}
                        </span>
                        <span className="text-[14px] leading-[18px] text-[#999999]">{formatDate(order.createdAt)}</span>
                    </div>
                    <p className="text-[14px] leading-[18px] mb-[4px]">
                        Заказ №{order.orderNumber}
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px] leading-[18px] text-[#666666]">
                        <span>{DELIVERY_LABELS[order.deliveryMethod]}</span>
                        <span>{PAYMENT_LABELS[order.paymentMethod]}</span>
                        <span>{order.itemsCount} {order.itemsCount === 1 ? 'товар' : order.itemsCount < 5 ? 'товара' : 'товаров'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                    <span className="text-[16px] leading-[18px] font-semibold whitespace-nowrap">{formatPrice(order.totalAmount)}</span>
                    <ChevronDown
                        size={20}
                        className={`text-[#999999] transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                </div>
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-[20px] pb-[20px] border-t border-[#EEEEEE]">
                            {detailsLoading ? (
                                <div className="py-[20px] space-y-3">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-[80px] h-[100px] bg-gray-200 animate-pulse rounded-[4px]" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3" />
                                                <div className="h-3 bg-gray-200 animate-pulse rounded w-1/3" />
                                                <div className="h-3 bg-gray-200 animate-pulse rounded w-1/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : details ? (
                                <div className="pt-[16px]">
                                    {details.items.map((item) => (
                                        <OrderItemRow
                                            key={item.id}
                                            item={item}
                                            onAddToCart={handleAddToCart}
                                        />
                                    ))}
                                    {details.deliveryAddress && (
                                        <div className="mt-[16px] pt-[16px] border-t border-[#EEEEEE]">
                                            <p className="text-[12px] leading-[16px] text-[#999999] uppercase mb-[8px]">Адрес доставки</p>
                                            <p className="text-[14px] leading-[18px]">
                                                {details.deliveryAddress.city}
                                                {details.deliveryAddress.address && `, ${details.deliveryAddress.address}`}
                                                {details.deliveryAddress.deliveryPointName && ` (${details.deliveryAddress.deliveryPointName})`}
                                            </p>
                                            <p className="text-[13px] leading-[18px] text-[#666666]">
                                                {details.deliveryAddress.recipientName}, {details.deliveryAddress.recipientPhone}
                                            </p>
                                        </div>
                                    )}
                                    <div className="mt-[16px] pt-[16px] border-t border-[#EEEEEE] flex flex-wrap gap-x-8 gap-y-1 text-[13px] leading-[18px]">
                                        <span>Товары: {formatPrice(details.itemsTotal)}</span>
                                        <span>Доставка: {formatPrice(details.deliveryCost)}</span>
                                        {details.discountAmount > 0 && <span>Скидка: -{formatPrice(details.discountAmount)}</span>}
                                        <span className="font-semibold">Итого: {formatPrice(details.totalAmount)}</span>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export const OrdersTab = () => {
    const navigate = useNavigate();
    const initialized = useSelector(selectAppInitialized);
    const [orders, setOrders] = useState<OrderListResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        if (!initialized) return;
        setLoading(true);
        OrderService.getMyOrders(0, 20)
            .then((res) => {
                setOrders(res.content);
                setTotalPages(res.totalPages);
                setPage(0);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [initialized]);

    const loadMore = async () => {
        const nextPage = page + 1;
        setLoadingMore(true);
        try {
            const res = await OrderService.getMyOrders(nextPage, 20);
            setOrders((prev) => [...prev, ...res.content]);
            setPage(nextPage);
            setTotalPages(res.totalPages);
        } catch {
            // silent
        } finally {
            setLoadingMore(false);
        }
    };

    if (!initialized || loading) {
        return (
            <div>
                <h2 className="text-[24px] leading-[26px] uppercase font-semibold mb-[60px]">Мои заказы</h2>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-[100px] bg-gray-200 animate-pulse rounded-[8px]" />
                    ))}
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div>
                <h2 className="text-[24px] leading-[26px] uppercase font-semibold mb-[60px]">Мои заказы</h2>
                <div className="flex flex-col items-center mt-[120px]">
                    <p className="text-[16px] leading-[18px] uppercase mb-[20px]">У вас пока нет заказов</p>
                    <p className="text-[16px] leading-[22px] font-normal text-center mb-[30px] max-w-[520px] text-[#666666]">
                        Здесь будут отображаться все ваши заказы. Перейдите в каталог, чтобы выбрать товары.
                    </p>
                    <button
                        onClick={() => navigate('/catalog')}
                        className="w-[243px] h-[56px] rounded-[8px] border border-[#FFFBF5] bg-[#F8C6D7] text-[14px] leading-[18px] uppercase cursor-pointer hover:shadow-md transition"
                    >
                        Перейти в каталог
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-[24px] leading-[26px] uppercase font-semibold mb-[60px]">Мои заказы</h2>
            <div className="space-y-[16px]">
                {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>

            {page + 1 < totalPages && (
                <div className="mt-[30px] flex justify-center">
                    <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className={`h-[48px] px-[32px] rounded-[8px] border border-[#CCCCCC] text-[14px] leading-[18px] uppercase transition ${
                            loadingMore
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-pointer hover:border-[#F8C6D7] hover:bg-[#F8C6D7]/10'
                        }`}
                    >
                        {loadingMore ? 'Загрузка...' : 'Загрузить ещё'}
                    </button>
                </div>
            )}
        </div>
    );
};
