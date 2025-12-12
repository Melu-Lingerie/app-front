import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState } from '@/store';
import { motion } from 'framer-motion';

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
type PaymentMethod = 'sbp' | 'card' | 'installments';
type DeliveryService = 'cdek' | 'yandex';

// Форматирование чисел
const numberFormat = (value: number): string => {
    return value.toLocaleString('ru-RU');
};

export function CheckoutPage() {
    const navigate = useNavigate();
    const { items, itemsCount } = useSelector((state: RootState) => state.cart);
    const { isAuthenticated } = useSelector((state: RootState) => state.user);

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
    const [deliveryType, setDeliveryType] = useState<DeliveryType>('courier');
    const [deliveryService, setDeliveryService] = useState<DeliveryService>('cdek');
    const [postalCode, setPostalCode] = useState('');
    const [address, setAddress] = useState('');
    const [comment, setComment] = useState('');

    // Оплата
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('sbp');

    // Промокод
    const [promoCode, setPromoCode] = useState('');

    // Расчеты (TODO: подключить CDEK API для расчета)
    const [deliveryCost, _setDeliveryCost] = useState(0);
    const [deliveryDays, _setDeliveryDays] = useState<number | null>(null);
    const [isCalculating, _setIsCalculating] = useState(false);
    // Эти сеттеры будут использоваться при интеграции с CDEK API
    void _setDeliveryCost; void _setDeliveryDays; void _setIsCalculating;

    // Суммы
    const subtotal = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);
    }, [items]);

    const total = subtotal + deliveryCost;

    // Валидация
    const isFormValid = firstName && lastName && phone && email && city && address && agreePolicy;

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

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-[60px]">
                {/* Левая колонка — форма */}
                <div className="w-full lg:w-[910px] lg:flex-shrink-0">
                    {/* Разделитель */}
                    <div className="w-full h-[1px] bg-[#CCC] dark:bg-white/10 mb-[30px]" />

                    {/* Данные получателя */}
                    <section className="mb-[30px]">
                        <h2 className="text-[14px] font-medium uppercase mb-[20px]">Данные получателя</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[75px] gap-y-4">
                            <div>
                                <label className="block text-[14px] font-medium uppercase mb-2">Имя получателя</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Ваше имя"
                                    className="w-full h-14 px-5 bg-[#F7F7F7] dark:bg-white/5 border border-transparent text-[12px] font-medium outline-none focus:border-[#F8C6D7] placeholder:text-[#999]"
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-medium uppercase mb-2">Фамилия получателя</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Ваша фамилия"
                                    className="w-full h-14 px-5 bg-[#F7F7F7] dark:bg-white/5 border border-transparent text-[12px] font-medium outline-none focus:border-[#F8C6D7] placeholder:text-[#999]"
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-medium uppercase mb-2">Телефон</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Номер телефона"
                                    className="w-full h-14 px-5 bg-[#F7F7F7] dark:bg-white/5 border border-transparent text-[12px] font-medium outline-none focus:border-[#F8C6D7] placeholder:text-[#999]"
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-medium uppercase mb-2">E-mail</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="E-mail"
                                    className="w-full h-14 px-5 bg-[#F7F7F7] dark:bg-white/5 border border-transparent text-[12px] font-medium outline-none focus:border-[#F8C6D7] placeholder:text-[#999]"
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
                                <span className="text-[11px] font-medium leading-[14px]">
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
                                <span className="text-[11px] font-medium leading-[14px]">
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
                        <h2 className="text-[14px] font-medium uppercase mb-[20px]">Доставка</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[75px] gap-y-4">
                            <div>
                                <label className="block text-[14px] font-medium uppercase mb-2">Населенный пункт</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Начните вводить название города"
                                    className="w-full h-14 px-5 bg-[#F7F7F7] dark:bg-white/5 border border-transparent text-[12px] font-medium outline-none focus:border-[#F8C6D7] placeholder:text-[#999]"
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-medium uppercase mb-2">Тип доставки</label>
                                <div className="flex">
                                    <button
                                        type="button"
                                        onClick={() => setDeliveryType('pickup')}
                                        className={`w-[222px] h-14 border text-[16px] font-normal transition-colors ${
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
                                        className={`w-[222px] h-14 border-t border-b border-r text-[16px] font-normal transition-colors ${
                                            deliveryType === 'courier'
                                                ? 'border-[#2A2A2B] dark:border-white bg-[#FAFAFA] dark:bg-transparent'
                                                : 'border-[#999] text-[#999]'
                                        }`}
                                    >
                                        Курьер
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[14px] font-medium uppercase mb-2">Индекс</label>
                                <input
                                    type="text"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    placeholder="XXX XXX"
                                    className="w-full h-14 px-5 bg-[#F7F7F7] dark:bg-white/5 border border-transparent text-[12px] font-medium outline-none focus:border-[#F8C6D7] placeholder:text-[#999]"
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-medium uppercase mb-2">Адрес</label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Введите вашу улицу, дом, квартиру"
                                    className="w-full h-14 px-5 bg-[#F7F7F7] dark:bg-white/5 border border-transparent text-[12px] font-medium outline-none focus:border-[#F8C6D7] placeholder:text-[#999]"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-[14px] font-medium uppercase mb-2">Комментарий</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Сообщение курьеру"
                                className="w-full h-40 px-5 py-5 bg-[#F7F7F7] dark:bg-white/5 border border-transparent text-[12px] font-medium outline-none focus:border-[#F8C6D7] resize-none placeholder:text-[#999]"
                            />
                        </div>

                        {/* Ссылка на сертификат */}
                        <p className="mt-4 text-[11px] font-medium">
                            {isAuthenticated ? (
                                <span className="text-[#999]">Вы можете использовать сертификат при оформлении.</span>
                            ) : (
                                <>
                                    <span className="underline cursor-pointer" onClick={() => navigate('/account')}>Авторизуйтесь</span>
                                    <span className="text-[#999]">, чтобы воспользоваться сертификатом.</span>
                                </>
                            )}
                        </p>

                        {/* Службы доставки */}
                        <div className="mt-6">
                            <label className="block text-[14px] font-medium uppercase mb-4">Службы доставки</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[75px] gap-y-4">
                                {/* CDEK */}
                                <button
                                    type="button"
                                    onClick={() => setDeliveryService('cdek')}
                                    className={`w-96 h-14 flex items-center px-3 border transition-colors bg-[#FAFAFA] dark:bg-transparent ${
                                        deliveryService === 'cdek'
                                            ? 'border-[#2A2A2B] dark:border-white'
                                            : 'border-[#CCC] dark:border-white/20'
                                    }`}
                                >
                                    <div className="w-32 h-9 bg-[#F5F5F5] dark:bg-white/10 flex items-center justify-center mr-3">
                                        <CdekLogo />
                                    </div>
                                    <span className="text-[14px] font-medium uppercase">CDEK</span>
                                    <span className="text-[14px] font-medium ml-2">
                                        {isCalculating ? '...' : `${numberFormat(deliveryCost || 1290)} ₽`}
                                    </span>
                                    <span className="text-[12px] font-medium text-[#999] ml-2">
                                        {deliveryDays ? `${deliveryDays} дн.` : '4 дня'}
                                    </span>
                                </button>

                                {/* Yandex - неактивна */}
                                <button
                                    type="button"
                                    disabled
                                    className="w-96 h-14 flex items-center px-3 border border-[rgba(23,23,23,0.3)] dark:border-white/10 bg-[rgba(250,250,250,0.3)] text-[rgba(23,23,23,0.3)] cursor-not-allowed"
                                >
                                    <div className="w-32 h-9 bg-[rgba(245,245,245,0.3)] dark:bg-white/5 flex items-center justify-center mr-3">
                                        <YandexDeliveryLogo />
                                    </div>
                                    <span className="text-[14px] font-medium uppercase">YANDEX</span>
                                    <span className="text-[14px] font-medium ml-2">1 290 ₽</span>
                                    <span className="text-[12px] font-medium ml-2">4 дня</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Разделитель */}
                    <div className="w-full h-[1px] bg-[#CCC] dark:bg-white/10 mb-[30px]" />

                    {/* Оплата */}
                    <section className="mb-[30px]">
                        <h2 className="text-[14px] font-medium uppercase mb-[20px]">Оплата</h2>

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
                                <span className="text-[14px] font-medium uppercase ml-3">Система быстрых платежей</span>
                            </button>

                            {/* Банковская карта - неактивна */}
                            <button
                                type="button"
                                disabled
                                className="w-96 h-14 flex items-center px-5 border border-[rgba(23,23,23,0.3)] dark:border-white/10 bg-[rgba(250,250,250,0.3)] text-[rgba(23,23,23,0.3)] cursor-not-allowed"
                            >
                                <span className="text-[14px] font-medium uppercase">Банковской картой</span>
                            </button>

                            {/* Долями - неактивна */}
                            <button
                                type="button"
                                disabled
                                className="w-96 h-14 flex items-center px-5 border border-[rgba(23,23,23,0.3)] dark:border-white/10 bg-[rgba(250,250,250,0.3)] text-[rgba(23,23,23,0.3)] cursor-not-allowed"
                            >
                                <DolyamiLogo />
                                <span className="text-[14px] font-medium uppercase ml-2">Сервис долями</span>
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
                    <div className="flex justify-between items-baseline mb-2">
                        <h3 className="text-[16px] font-medium uppercase">Сумма заказа</h3>
                        <span className="text-[16px] font-medium uppercase">{numberFormat(subtotal)} ₽</span>
                    </div>

                    <div className="space-y-1 mb-4">
                        <div className="flex justify-between text-[12px] font-medium text-[#999]">
                            <span>Подытог:</span>
                            <span>{numberFormat(subtotal)} ₽</span>
                        </div>
                        <div className="flex justify-between text-[12px] font-medium text-[#999]">
                            <span>Доставка:</span>
                            <span>{deliveryCost === 0 ? '0 ₽' : `${numberFormat(deliveryCost)} ₽`}</span>
                        </div>
                    </div>

                    <div className="w-full h-[1px] bg-[#CCC] dark:bg-white/10 mb-4" />

                    <div className="flex justify-between text-[16px] font-medium uppercase mb-4">
                        <span>Итого</span>
                        <span>{numberFormat(total)} ₽</span>
                    </div>

                    <div className="w-full h-[1px] bg-[#CCC] dark:bg-white/10 mb-6" />

                    {/* Промокод */}
                    <div className="mb-6">
                        <p className="text-[16px] font-medium text-[#999] mb-3">Ввести промокод</p>
                        <div className="flex items-center border border-[#CCC] dark:border-white/10 bg-white dark:bg-transparent">
                            <input
                                type="text"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                placeholder="Промокод"
                                className="flex-1 h-14 px-5 bg-transparent text-[12px] font-medium outline-none placeholder:text-[#CCC]"
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
                        disabled={!isFormValid}
                        className="w-full h-14 rounded-lg bg-[#F8C6D7] border border-[#FFFBF5] text-[14px] font-medium uppercase transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Оплатить
                    </button>

                    {/* Ссылки */}
                    <div className="mt-[120px] space-y-2">
                        <p className="text-[12px] font-medium text-[#999] underline cursor-pointer">Войти в личный кабинет</p>
                        <p className="text-[12px] font-medium text-[#999] underline cursor-pointer">Условия доставки</p>
                        <p className="text-[12px] font-medium text-[#999] underline cursor-pointer">Условия обмена и возврата</p>
                        <p className="text-[12px] font-medium text-[#999] underline cursor-pointer">Информация об оплате</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
