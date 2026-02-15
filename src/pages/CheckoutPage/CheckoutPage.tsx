import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState, type AppDispatch } from '@/store';
import { motion } from 'framer-motion';
import { OrderService } from '@/api/services/OrderService';
import { DeliveryService } from '@/api/services/DeliveryService';
import type { TariffResponseDto, DeliveryPointResponseDto } from '@/api/models/DeliveryDto';
import type { PaymentMethod, DeliveryMethod } from '@/api/models/CheckoutRequestDto';
import { fetchLoyaltyAccount, selectLoyaltyBalance } from '@/store/loyaltySlice';

// Иконка СБП
const SbpIcon = () => (
    <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.56 10L14.68 13.3L10 22.5L30.92 10H20.56Z" fill="#8F4794"/>
        <path d="M18.24 15.25L14.68 17.55L10 26.75L30.92 15.25H20.56H18.24Z" fill="#E40646"/>
        <path d="M14.68 10V17.55L10 26.75V10H14.68Z" fill="#F9B429"/>
        <path d="M10 10L14.68 17.55L20.56 22.5H30.92L10 10Z" fill="#EF8019"/>
        <path d="M10 17.55V30L14.68 22.5V17.55L10 17.55Z" fill="#78B72A"/>
        <path d="M20.56 22.5L14.68 25.8L10 35L30.92 22.5H20.56Z" fill="#00853F"/>
        <path d="M10 13.3V26.3L14.68 21.5V17.2L10 13.3Z" fill="#5B57A2"/>
        <path d="M16.48 18L16.49 18.01L10 13.3L14.68 17.2L27.6 25H32.92L16.48 18Z" fill="#0698D6"/>
    </svg>
);

// Логотип СДЭК
const CdekLogo = () => (
    <svg width="64" height="20" viewBox="0 0 64 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12.416 4.6H10.414C6.389 4.6 2.959 14.4 7.698 14.4H10.75C12.507 14.4 13.809 15 13.235 16.7L12.444 19H9.21L6.578 18.97C3.218 18.94 1.048 17.34 0.264 14.9C-0.59 12.27 0.614 6.79 4.079 3.27C6.088 1.23 8.874 0 12.444 0H19.045L18.009 2.88C17.344 4.74 15.972 4.6 15.202 4.6H12.416Z" fill="#00A952"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M46.504 14.4H35.878C34.121 14.4 33.323 14.87 33.001 15.85L32 19H42.626C44.383 19 45.181 18.5 45.503 17.53L46.504 14.4ZM51.558 0H40.932C39.175 0 38.377 0.48 38.055 1.45L37.061 4.59H47.687C49.444 4.59 50.242 4.11 50.564 3.13L51.558 0Z" fill="#00A952"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M24.066 4.58H26.719C28.98 4.58 28.462 7.32 27.314 9.99C26.306 12.33 24.528 14.41 22.407 14.41H17.997C16.24 14.41 15.428 14.89 15.085 15.87L14 19H17.227L20.384 18.97C23.191 18.95 25.48 18.75 28.168 16.4C31.003 13.91 34.307 7.48 33.74 3.77C33.299 0.86 31.689 0 27.776 0H20.664L16.52 11.78H19.152C20.713 11.78 21.511 11.8 22.337 9.63L24.066 4.58Z" fill="#00A952"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M47 19H52.012L54.161 13L56.401 11.19L58.172 16.6C58.718 18.27 59.278 19 60.51 19H64.353L60.391 8.39L69.904 0H63.758L57.983 5.98C57.311 6.67 56.625 7.36 55.953 8.18H55.897L58.76 0H53.748L47 19Z" fill="#00A952"/>
    </svg>
);

// Логотип Долями
const DolyamiLogo = () => (
    <span className="text-[14px] font-bold tracking-tight">llll ДОЛЯМИ</span>
);

// Логотип Яндекс Доставка
const YandexDeliveryLogo = () => (
    <div className="flex items-center gap-1">
        <div className="w-5 h-5 bg-[#FC3F1D] rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">Я</span>
        </div>
        <span className="text-sm">Доставка</span>
    </div>
);

type DeliveryType = 'pickup' | 'courier';
type PaymentMethodUI = 'sbp' | 'card' | 'installments';

// Форматирование чисел
const numberFormat = (value: number): string => {
    return value.toLocaleString('ru-RU');
};

// Средний вес товара в граммах (для расчета доставки)
const AVERAGE_ITEM_WEIGHT = 300;

export function CheckoutPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { items, itemsCount, cartId } = useSelector((state: RootState) => state.cart);
    const { isAuthenticated } = useSelector((state: RootState) => state.user);
    const crumbsBalance = useSelector(selectLoyaltyBalance);

    // Форма получателя
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    // Согласия
    const [agreeMarketing, setAgreeMarketing] = useState(false);
    const [agreePolicy, setAgreePolicy] = useState(false);

    // Доставка
    const [city, setCity] = useState('');
    const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup');
    const [postalCode, setPostalCode] = useState('');
    const [address, setAddress] = useState('');
    const [comment, setComment] = useState('');

    // Пункты выдачи
    const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPointResponseDto[]>([]);
    const [selectedPoint, setSelectedPoint] = useState<DeliveryPointResponseDto | null>(null);
    const [isLoadingPoints, setIsLoadingPoints] = useState(false);

    // Тарифы доставки
    const [tariffs, setTariffs] = useState<TariffResponseDto[]>([]);
    const [selectedTariff, setSelectedTariff] = useState<TariffResponseDto | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    // Оплата
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodUI>('sbp');

    // Промокод
    const [promoCode, setPromoCode] = useState('');

    // Лояльность (крошки)
    const [useCrumbsDiscount, setUseCrumbsDiscount] = useState(false);

    // Checkout state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Суммы
    const subtotal = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);
    }, [items]);

    const deliveryCost = selectedTariff?.deliverySum ?? 0;
    const total = subtotal + deliveryCost;

    // Общий вес товаров
    const totalWeight = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.quantity ?? 1) * AVERAGE_ITEM_WEIGHT, 0);
    }, [items]);

    // Загрузка пунктов выдачи при изменении города
    const loadDeliveryPoints = useCallback(async (cityName: string) => {
        if (!cityName || cityName.length < 2) {
            setDeliveryPoints([]);
            return;
        }

        setIsLoadingPoints(true);
        try {
            const points = await DeliveryService.getDeliveryPointsByCity(cityName);
            setDeliveryPoints(points);
        } catch (err) {
            console.error('Failed to load delivery points:', err);
            setDeliveryPoints([]);
        } finally {
            setIsLoadingPoints(false);
        }
    }, []);

    // Расчет стоимости доставки
    const calculateDelivery = useCallback(async (cityName: string, tariffCode?: number) => {
        if (!cityName || cityName.length < 2 || totalWeight === 0) {
            setTariffs([]);
            setSelectedTariff(null);
            return;
        }

        setIsCalculating(true);
        try {
            const result = await DeliveryService.calculateDeliveryCost({
                city: cityName,
                weight: totalWeight,
                tariffCode,
            });
            setTariffs(result);
            // Автоматически выбираем первый тариф
            if (result.length > 0) {
                setSelectedTariff(result[0]);
            }
        } catch (err) {
            console.error('Failed to calculate delivery:', err);
            setTariffs([]);
            setSelectedTariff(null);
        } finally {
            setIsCalculating(false);
        }
    }, [totalWeight]);

    // Загрузка баланса крошек
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchLoyaltyAccount());
        }
    }, [isAuthenticated, dispatch]);

    // Debounced city search - только загрузка ПВЗ
    useEffect(() => {
        const timer = setTimeout(() => {
            if (city.length >= 2) {
                loadDeliveryPoints(city);
            }
        }, 500);

        setSelectedPoint(null);
        setTariffs([]);
        setSelectedTariff(null);

        return () => clearTimeout(timer);
    }, [city, loadDeliveryPoints]);

    // Расчет тарифов после выбора ПВЗ
    useEffect(() => {
        if (selectedPoint && city.length >= 2) {
            calculateDelivery(city, 136);
        }
    }, [selectedPoint, city, calculateDelivery]);

    // Валидация формы
    const isFormValid = useMemo(() => {
        const baseValid = firstName && lastName && phone && email && city && agreePolicy && selectedTariff;

        if (deliveryType === 'pickup') {
            return baseValid && selectedPoint;
        } else {
            return baseValid && address;
        }
    }, [firstName, lastName, phone, email, city, agreePolicy, selectedTariff, deliveryType, selectedPoint, address]);

    // Обработка оформления заказа
    const handleCheckout = async () => {
        if (!isFormValid || !cartId || !selectedTariff) return;

        setIsSubmitting(true);
        setError(null);

        try {
            // Маппинг UI типов в API типы
            const apiPaymentMethod: PaymentMethod = paymentMethod === 'sbp' ? 'SBP' : 'CARD';
            const apiDeliveryMethod: DeliveryMethod = deliveryType === 'pickup' ? 'CDEK_POINT' : 'CDEK_COURIER';

            const response = await OrderService.checkout({
                cartId,
                paymentMethod: apiPaymentMethod,
                deliveryMethod: apiDeliveryMethod,
                city,
                address: deliveryType === 'courier' ? address : selectedPoint?.address,
                postalCode: postalCode || undefined,
                deliveryPointCode: deliveryType === 'pickup' ? selectedPoint?.code : undefined,
                deliveryPointName: deliveryType === 'pickup' ? selectedPoint?.name : undefined,
                recipientName: `${firstName} ${lastName}`,
                recipientPhone: phone,
                recipientEmail: email || undefined,
                promoCode: promoCode || undefined,
                customerComment: comment || undefined,
                tariffCode: selectedTariff.tariffCode,
                useCrumbsDiscount: useCrumbsDiscount || undefined,
            });

            // Если есть URL для оплаты - редиректим
            if (response.confirmationUrl) {
                window.location.href = response.confirmationUrl;
            } else {
                // Иначе переходим на страницу заказа
                navigate(`/account/orders/${response.orderId}`);
            }
        } catch (err) {
            console.error('Checkout failed:', err);
            setError('Не удалось оформить заказ. Попробуйте еще раз.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (itemsCount === 0) {
        return (
            <div className="pt-[30px] md:pt-[60px] px-4 md:px-[110px] pb-[60px] flex flex-col items-center">
                <h1 className="text-[24px] md:text-[36px] uppercase mb-6">Оформление заказа</h1>
                <p className="text-[#999] text-[14px] md:text-[16px] mb-6">Ваша корзина пуста</p>
                <button
                    onClick={() => navigate('/catalog')}
                    className="px-6 py-3 bg-[#F8C6D7] rounded-lg text-sm uppercase font-medium"
                >
                    Перейти в каталог
                </button>
            </div>
        );
    }

    return (
        <div className="pt-[30px] md:pt-[60px] px-4 sm:px-8 md:px-[60px] lg:px-[195px] pb-[60px]">
            <h1 className="text-[28px] md:text-[36px] font-medium uppercase leading-[32px] md:leading-[38px] mb-[30px]">
                Оформление заказа
            </h1>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-[60px]">
                {/* Левая колонка — форма */}
                <div className="w-full lg:w-[910px] lg:flex-shrink-0">
                    {/* Разделитель */}
                    <div className="w-full h-[1px] bg-[#CCC] dark:bg-white/10 mb-[30px]" />

                    {/* Данные получателя */}
                    <section className="mb-[30px]">
                        <h2 className="text-base font-medium uppercase mb-[20px]">Данные получателя</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[75px] gap-y-4">
                            <div>
                                <label className="block text-sm font-medium uppercase mb-2">Имя получателя</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Ваше имя"
                                    className="w-full h-14 px-5 bg-[#F7F7F7] dark:bg-white/5 border border-transparent text-sm font-medium outline-none focus:border-[#F8C6D7] placeholder:text-[#999]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium uppercase mb-2">Фамилия получателя</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Ваша фамилия"
                                    className="w-full h-14 px-5 bg-[#F7F7F7] dark:bg-white/5 border border-transparent text-sm font-medium outline-none focus:border-[#F8C6D7] placeholder:text-[#999]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium uppercase mb-2">Телефон</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Номер телефона"
                                    className="w-full h-14 px-5 bg-[#F7F7F7] dark:bg-white/5 border border-transparent text-sm font-medium outline-none focus:border-[#F8C6D7] placeholder:text-[#999]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium uppercase mb-2">E-mail</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="E-mail"
                                    className="w-full h-14 px-5 bg-[#F7F7F7] dark:bg-white/5 border border-transparent text-sm font-medium outline-none focus:border-[#F8C6D7] placeholder:text-[#999]"
                                />
                            </div>
                        </div>

                        {/* Чекбоксы согласий */}
                        <div className="mt-5 space-y-3">
                            <label className="flex items-start gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreeMarketing}
                                    onChange={(e) => setAgreeMarketing(e.target.checked)}
                                    className="w-4 h-4 mt-0.5 accent-[#F8C6D7] border border-[#CCC]"
                                />
                                <span className="text-xs font-medium leading-4">
                                    Я согласен(-на) на получение рекламно-информационной рассылки (e-mail, whatsapp, sms).
                                </span>
                            </label>
                            <label className="flex items-start gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreePolicy}
                                    onChange={(e) => setAgreePolicy(e.target.checked)}
                                    className="w-4 h-4 mt-0.5 accent-[#F8C6D7] border border-[#CCC]"
                                />
                                <span className="text-xs font-medium leading-4">
                                    Я согласен(-на) с{' '}
                                    <span className="underline cursor-pointer">политикой конфиденциальности</span>
                                    {' '}и{' '}
                                    <span className="underline cursor-pointer">договором оферты</span>
                                </span>
                            </label>
                        </div>
                    </section>

                    {/* Разделитель */}
                    <div className="w-full h-[1px] bg-[#CCC] dark:bg-white/10 mb-[30px]" />

                    {/* Доставка */}
                    <section className="mb-[30px]">
                        <h2 className="text-base font-medium uppercase mb-[20px]">Доставка</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[75px] gap-y-4">
                            <div>
                                <label className="block text-sm font-medium uppercase mb-2">Адрес</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Город, улица"
                                    className="w-full h-14 px-5 bg-[#F7F7F7] dark:bg-white/5 border border-transparent text-sm font-medium outline-none focus:border-[#F8C6D7] placeholder:text-[#999]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium uppercase mb-2">Тип доставки</label>
                                <div className="flex">
                                    <button
                                        type="button"
                                        onClick={() => setDeliveryType('pickup')}
                                        className={`w-[222px] h-14 border text-base font-normal transition-colors ${
                                            deliveryType === 'pickup'
                                                ? 'border-[#2A2A2B] dark:border-white bg-[#FAFAFA] dark:bg-transparent'
                                                : 'border-[#999] text-[#999]'
                                        }`}
                                    >
                                        Самовывоз
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeliveryType('courier')}
                                        className={`w-[222px] h-14 border-t border-b border-r text-base font-normal transition-colors ${
                                            deliveryType === 'courier'
                                                ? 'border-[#2A2A2B] dark:border-white bg-[#FAFAFA] dark:bg-transparent'
                                                : 'border-[#999] text-[#999]'
                                        }`}
                                    >
                                        Курьер
                                    </button>
                                </div>
                            </div>

                            {/* Пункты выдачи для самовывоза */}
                            {deliveryType === 'pickup' && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium uppercase mb-2">Пункт выдачи</label>
                                    {isLoadingPoints ? (
                                        <div className="text-sm text-[#999]">Загрузка пунктов выдачи...</div>
                                    ) : deliveryPoints.length > 0 ? (
                                        <div className="max-h-60 overflow-y-auto border border-[#CCC] dark:border-white/10">
                                            {deliveryPoints.map((point) => (
                                                <button
                                                    key={point.code}
                                                    type="button"
                                                    onClick={() => setSelectedPoint(point)}
                                                    className={`w-full p-4 text-left border-b border-[#CCC] dark:border-white/10 last:border-b-0 transition-colors ${
                                                        selectedPoint?.code === point.code
                                                            ? 'bg-[#F8C6D7]/20'
                                                            : 'hover:bg-[#F7F7F7] dark:hover:bg-white/5'
                                                    }`}
                                                >
                                                    <div className="text-sm font-medium">{point.name}</div>
                                                    <div className="text-xs text-[#999] mt-1">{point.address}</div>
                                                    {point.workTime && (
                                                        <div className="text-xs text-[#999] mt-1">{point.workTime}</div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ) : city.length >= 2 ? (
                                        <div className="text-sm text-[#999]">Пункты выдачи не найдены</div>
                                    ) : (
                                        <div className="text-sm text-[#999]">Введите город для поиска пунктов выдачи</div>
                                    )}
                                </div>
                            )}

                            {/* Адрес для курьера */}
                            {deliveryType === 'courier' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium uppercase mb-2">Индекс</label>
                                        <input
                                            type="text"
                                            value={postalCode}
                                            onChange={(e) => setPostalCode(e.target.value)}
                                            placeholder="XXX XXX"
                                            className="w-full h-14 px-5 bg-[#F7F7F7] dark:bg-white/5 border border-transparent text-sm font-medium outline-none focus:border-[#F8C6D7] placeholder:text-[#999]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium uppercase mb-2">Адрес</label>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Введите вашу улицу, дом, квартиру"
                                            className="w-full h-14 px-5 bg-[#F7F7F7] dark:bg-white/5 border border-transparent text-sm font-medium outline-none focus:border-[#F8C6D7] placeholder:text-[#999]"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium uppercase mb-2">Комментарий</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Сообщение курьеру"
                                className="w-full h-40 px-5 py-5 bg-[#F7F7F7] dark:bg-white/5 border border-transparent text-sm font-medium outline-none focus:border-[#F8C6D7] resize-none placeholder:text-[#999]"
                            />
                        </div>

                        {/* Ссылка на сертификат */}
                        <p className="mt-4 text-xs font-medium">
                            {isAuthenticated ? (
                                <span className="text-[#999]">Вы можете использовать сертификат при оформлении.</span>
                            ) : (
                                <>
                                    <span className="underline cursor-pointer" onClick={() => navigate('/account')}>Авторизуйтесь</span>
                                    <span className="text-[#999]">, чтобы воспользоваться сертификатом.</span>
                                </>
                            )}
                        </p>

                        {/* Тарифы доставки */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium uppercase mb-4">Тарифы доставки</label>
                            {isCalculating ? (
                                <div className="text-sm text-[#999]">Расчет стоимости доставки...</div>
                            ) : tariffs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {tariffs.map((tariff) => (
                                        <button
                                            key={tariff.tariffCode}
                                            type="button"
                                            onClick={() => setSelectedTariff(tariff)}
                                            className={`w-full h-auto min-h-14 flex items-center px-3 py-3 border transition-colors bg-[#FAFAFA] dark:bg-transparent ${
                                                selectedTariff?.tariffCode === tariff.tariffCode
                                                    ? 'border-[#2A2A2B] dark:border-white'
                                                    : 'border-[#CCC] dark:border-white/20'
                                            }`}
                                        >
                                            <div className="w-20 h-9 bg-[#F5F5F5] dark:bg-white/10 flex items-center justify-center mr-3 flex-shrink-0">
                                                <CdekLogo />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="text-sm font-medium">{tariff.tariffName}</div>
                                                <div className="text-xs text-[#999]">
                                                    {tariff.periodMin}-{tariff.periodMax} дн.
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium ml-2">
                                                {numberFormat(tariff.deliverySum)} ₽
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : city.length >= 2 ? (
                                <div className="text-sm text-[#999]">Тарифы не найдены для данного города</div>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    className="w-96 h-14 flex items-center px-3 border border-[#CCC] dark:border-white/20 bg-[#FAFAFA] dark:bg-transparent"
                                >
                                    <div className="w-32 h-9 bg-[#F5F5F5] dark:bg-white/10 flex items-center justify-center mr-3">
                                        <CdekLogo />
                                    </div>
                                    <span className="text-sm font-medium text-[#999]">Введите город</span>
                                </button>
                            )}
                        </div>

                        {/* Яндекс доставка - неактивна */}
                        <div className="mt-4">
                            <button
                                type="button"
                                disabled
                                className="w-96 h-14 flex items-center px-3 border border-[rgba(23,23,23,0.3)] dark:border-white/10 bg-[rgba(250,250,250,0.3)] text-[rgba(23,23,23,0.3)] cursor-not-allowed"
                            >
                                <div className="w-32 h-9 bg-[rgba(245,245,245,0.3)] dark:bg-white/5 flex items-center justify-center mr-3">
                                    <YandexDeliveryLogo />
                                </div>
                                <span className="text-sm font-medium uppercase">Скоро</span>
                            </button>
                        </div>
                    </section>

                    {/* Разделитель */}
                    <div className="w-full h-[1px] bg-[#CCC] dark:bg-white/10 mb-[30px]" />

                    {/* Оплата */}
                    <section className="mb-[30px]">
                        <h2 className="text-base font-medium uppercase mb-[20px]">Оплата</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[75px] gap-y-4">
                            {/* СБП */}
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('sbp')}
                                className={`w-96 h-14 flex items-center px-5 border transition-colors bg-[#FAFAFA] dark:bg-transparent ${
                                    paymentMethod === 'sbp'
                                        ? 'border-[#2A2A2B] dark:border-white'
                                        : 'border-[#CCC] dark:border-white/20'
                                }`}
                            >
                                <SbpIcon />
                                <span className="text-sm font-medium uppercase ml-3">Система быстрых платежей</span>
                            </button>

                            {/* Банковская карта */}
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('card')}
                                className={`w-96 h-14 flex items-center px-5 border transition-colors bg-[#FAFAFA] dark:bg-transparent ${
                                    paymentMethod === 'card'
                                        ? 'border-[#2A2A2B] dark:border-white'
                                        : 'border-[#CCC] dark:border-white/20'
                                }`}
                            >
                                <span className="text-sm font-medium uppercase">Банковской картой</span>
                            </button>

                            {/* Долями - неактивна */}
                            <button
                                type="button"
                                disabled
                                className="w-96 h-14 flex items-center px-5 border border-[rgba(23,23,23,0.3)] dark:border-white/10 bg-[rgba(250,250,250,0.3)] text-[rgba(23,23,23,0.3)] cursor-not-allowed"
                            >
                                <DolyamiLogo />
                                <span className="text-sm font-medium uppercase ml-2">Скоро</span>
                            </button>
                        </div>
                    </section>
                </div>

                {/* Правая колонка — сумма заказа */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full lg:w-96 lg:flex-shrink-0 lg:sticky lg:top-[100px] h-fit"
                >
                    {/* Товары в заказе */}
                    <h3 className="text-base font-medium uppercase mb-3">Ваш заказ</h3>
                    <div className="space-y-3 mb-6">
                        {items.map((item) => (
                            <div key={item.itemId} className="flex gap-3">
                                <div className="w-14 h-14 flex-shrink-0 bg-[#F7F7F7] dark:bg-white/5 rounded overflow-hidden">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#999] text-[10px]">Нет фото</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium truncate">{item.productName}</div>
                                    <div className="text-[11px] text-[#999]">
                                        {item.variantColor && <span>{item.variantColor}</span>}
                                        {item.variantColor && item.variantSize && <span> / </span>}
                                        {item.variantSize && <span>{item.variantSize}</span>}
                                    </div>
                                    <div className="text-[11px] text-[#999]">
                                        {item.quantity} × {numberFormat(item.unitPrice)} ₽
                                    </div>
                                </div>
                                <div className="text-xs font-medium whitespace-nowrap">
                                    {numberFormat(item.totalPrice ?? 0)} ₽
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="w-full h-[1px] bg-[#CCC] dark:bg-white/10 mb-4" />

                    <div className="flex justify-between items-baseline mb-2">
                        <h3 className="text-base font-medium uppercase">Сумма заказа</h3>
                        <span className="text-base font-medium uppercase">{numberFormat(subtotal)} ₽</span>
                    </div>

                    <div className="space-y-1 mb-4">
                        <div className="flex justify-between text-xs font-medium text-[#999]">
                            <span>Подытог:</span>
                            <span>{numberFormat(subtotal)} ₽</span>
                        </div>
                        <div className="flex justify-between text-xs font-medium text-[#999]">
                            <span>Доставка:</span>
                            <span>
                                {isCalculating ? '...' : deliveryCost === 0 ? 'Выберите тариф' : `${numberFormat(deliveryCost)} ₽`}
                            </span>
                        </div>
                    </div>

                    <div className="w-full h-[1px] bg-[#CCC] dark:bg-white/10 mb-4" />

                    <div className="flex justify-between text-base font-medium uppercase mb-4">
                        <span>Итого</span>
                        <span>{numberFormat(total)} ₽</span>
                    </div>

                    <div className="w-full h-[1px] bg-[#CCC] dark:bg-white/10 mb-6" />

                    {/* Скидка крошками */}
                    {isAuthenticated && crumbsBalance >= 10 && (
                        <div className="mb-6">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={useCrumbsDiscount}
                                    onChange={(e) => setUseCrumbsDiscount(e.target.checked)}
                                    className="w-4 h-4 mt-0.5 accent-[#F8C6D7] border border-[#CCC]"
                                />
                                <div>
                                    <span className="text-sm font-medium">
                                        Использовать 10 крошек для скидки 10%
                                    </span>
                                    <div className="text-xs text-[#999] mt-1">
                                        Ваш баланс: {crumbsBalance.toFixed(1)} крошек
                                    </div>
                                </div>
                            </label>
                        </div>
                    )}

                    {/* Промокод */}
                    <div className="mb-6">
                        <p className="text-base font-medium text-[#999] mb-3">Ввести промокод</p>
                        <div className="flex items-center border border-[#CCC] dark:border-white/10 bg-white dark:bg-transparent">
                            <input
                                type="text"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                placeholder="Промокод"
                                className="flex-1 h-14 px-5 bg-transparent text-xs font-medium outline-none placeholder:text-[#CCC]"
                            />
                            <button className="px-4 text-[#999]">
                                <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.328 8.5L5.822 4.994L6.824 3.992L11.332 8.5L6.824 13.008L5.822 12.006L9.328 8.5Z" fill="currentColor"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Кнопка оплаты */}
                    <button
                        onClick={handleCheckout}
                        disabled={!isFormValid || isSubmitting}
                        className="w-full h-14 rounded-lg bg-[#F8C6D7] border border-[#FFFBF5] text-sm font-medium uppercase transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isSubmitting ? (
                            <span className="animate-pulse">Оформление...</span>
                        ) : (
                            'Оплатить'
                        )}
                    </button>

                    {/* Ссылки */}
                    <div className="mt-[120px] space-y-2">
                        <p className="text-xs font-medium text-[#999] underline cursor-pointer" onClick={() => navigate('/account')}>
                            Войти в личный кабинет
                        </p>
                        <p className="text-xs font-medium text-[#999] underline cursor-pointer">Условия доставки</p>
                        <p className="text-xs font-medium text-[#999] underline cursor-pointer">Условия обмена и возврата</p>
                        <p className="text-xs font-medium text-[#999] underline cursor-pointer">Информация об оплате</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
