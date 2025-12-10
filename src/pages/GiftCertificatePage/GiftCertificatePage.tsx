import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, X } from 'lucide-react';
import { Carousel, Card } from '@/components';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

// Номиналы сертификатов
const DENOMINATIONS = [
    { value: 5000, label: '5 000 ₽' },
    { value: 10000, label: '10 000 ₽' },
    { value: 15000, label: '15 000 ₽' },
    { value: 20000, label: '20 000 ₽' },
    { value: 30000, label: '30 000 ₽' },
    { value: 50000, label: '50 000 ₽' },
];

// Превью изображений сертификата
const CERTIFICATE_PREVIEWS = [
    { id: 1, src: '/images/certificate-1.jpg' },
    { id: 2, src: '/images/certificate-2.jpg' },
    { id: 3, src: '/images/certificate-3.jpg' },
    { id: 4, src: '/images/certificate-4.jpg' },
    { id: 5, src: '/images/certificate-5.jpg' },
];

export const GiftCertificatePage = () => {
    const isMobile = useIsMobile();
    const { getItems } = useRecentlyViewed();
    const [selectedDenomination, setSelectedDenomination] = useState(DENOMINATIONS[1].value);
    const [customAmount, setCustomAmount] = useState('');
    const [showDenominationDropdown, setShowDenominationDropdown] = useState(false);
    const [selectedPreview, setSelectedPreview] = useState(CERTIFICATE_PREVIEWS[0].id);
    const [showTermsModal, setShowTermsModal] = useState(false);

    // Получаем недавно просмотренные товары
    const recentlyViewed = getItems(undefined, 10);

    const currentDenomination = DENOMINATIONS.find(d => d.value === selectedDenomination);

    const handleCustomAmountChange = (value: string) => {
        // Только цифры
        const numericValue = value.replace(/\D/g, '');
        setCustomAmount(numericValue);
        if (numericValue) {
            setSelectedDenomination(0);
        }
    };

    const handleDenominationSelect = (value: number) => {
        setSelectedDenomination(value);
        setCustomAmount('');
        setShowDenominationDropdown(false);
    };

    const finalAmount = customAmount ? parseInt(customAmount, 10) : selectedDenomination;
    const isValidAmount = finalAmount >= 500 && finalAmount <= 500000;

    return (
        <div className="w-full">
            {/* Основной контент */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 px-4 md:px-10 pt-[30px] md:pt-[60px]">
                {/* Левая часть - изображение сертификата */}
                <div className="w-full lg:flex-1 lg:max-w-[1220px]">
                    {/* Главное изображение - соотношение примерно 1220:846 */}
                    <div className="w-full bg-[#CCC] rounded-2xl overflow-hidden" style={{ aspectRatio: '1220 / 846' }}>
                        <img
                            src={CERTIFICATE_PREVIEWS.find(p => p.id === selectedPreview)?.src || '/images/certificate-placeholder.jpg'}
                            alt="Подарочный сертификат"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                </div>

                {/* Правая часть - информация */}
                <div className="w-full lg:w-[600px] lg:shrink-0">
                    {/* Заголовок */}
                    <h1 className="text-[24px] leading-[26px] font-medium uppercase mb-2">
                        Подарочный сертификат
                    </h1>
                    <p className="text-[#999] text-[16px] leading-[18px] mb-6">
                        ID: BF2524830015
                    </p>

                    {/* Превью дизайнов - 4 в первом ряду, 1 во втором */}
                    <div className="mb-6">
                        <div className="flex gap-3 mb-3">
                            {CERTIFICATE_PREVIEWS.slice(0, 4).map((preview) => (
                                <button
                                    key={preview.id}
                                    type="button"
                                    onClick={() => setSelectedPreview(preview.id)}
                                    className={`w-[128px] h-[80px] shrink-0 rounded-lg overflow-hidden border transition-colors cursor-pointer ${
                                        selectedPreview === preview.id
                                            ? 'border-[#CCC]'
                                            : 'border-transparent'
                                    }`}
                                >
                                    <div className="w-full h-full bg-neutral-100" />
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            {CERTIFICATE_PREVIEWS.slice(4).map((preview) => (
                                <button
                                    key={preview.id}
                                    type="button"
                                    onClick={() => setSelectedPreview(preview.id)}
                                    className={`w-[128px] h-[80px] shrink-0 rounded-lg overflow-hidden border transition-colors cursor-pointer ${
                                        selectedPreview === preview.id
                                            ? 'border-[#CCC]'
                                            : 'border-transparent'
                                    }`}
                                >
                                    <div className="w-full h-full bg-neutral-100" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Выбор номинала */}
                    <p className="text-[#565656] text-[16px] leading-[20px] mb-4">
                        Выберите номинал или введите сумму
                    </p>

                    <div className="flex gap-4 mb-6">
                        {/* Dropdown с номиналами */}
                        <div className="relative flex-1">
                            <button
                                type="button"
                                onClick={() => setShowDenominationDropdown(!showDenominationDropdown)}
                                className="w-full h-[56px] px-5 bg-[#FFFAF4] dark:bg-[#2A2A2B] rounded-lg border border-[#CCC] dark:border-white/10 flex items-center justify-between cursor-pointer"
                            >
                                <span className="text-[16px] font-medium">
                                    {currentDenomination?.label || 'Выбрать'}
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${showDenominationDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {showDenominationDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#2A2A2B] rounded-lg border border-[#CCC] dark:border-white/10 shadow-lg z-10 overflow-hidden"
                                    >
                                        {DENOMINATIONS.map((denomination) => (
                                            <button
                                                key={denomination.value}
                                                type="button"
                                                onClick={() => handleDenominationSelect(denomination.value)}
                                                className={`w-full px-5 py-3 text-left text-[16px] hover:bg-[#F4F4F4] dark:hover:bg-white/10 cursor-pointer transition-colors ${
                                                    selectedDenomination === denomination.value ? 'bg-[#F4F4F4] dark:bg-white/10' : ''
                                                }`}
                                            >
                                                {denomination.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Поле для ввода произвольной суммы */}
                        <div className="flex-1">
                            <input
                                type="text"
                                value={customAmount}
                                onChange={(e) => handleCustomAmountChange(e.target.value)}
                                placeholder="500–500 000 ₽"
                                className="w-full h-[56px] px-5 bg-[#FFFAF4] dark:bg-[#2A2A2B] rounded-lg border border-[#CCC] dark:border-white/10 text-[16px] font-medium placeholder:text-[#999] placeholder:font-medium outline-none focus:border-[#F8C6D7]"
                            />
                        </div>
                    </div>

                    {/* Кнопка оформления */}
                    <button
                        type="button"
                        disabled={!isValidAmount}
                        className="w-full h-[56px] bg-[#F8C6D7] rounded-lg text-[14px] font-medium uppercase cursor-pointer hover:bg-[#f0b4c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Оформить покупку
                    </button>

                    {/* Описание */}
                    <p className="text-[16px] leading-[20px] mt-10 mb-10">
                        Подарок, который говорит о вашей заботе. Melu дарит возможность выбрать именно то, что придется по душе. Цифровой сертификат — мгновенно онлайн, или изящный физический — в наших бутиках. Любой из них откроет мир изысканного белья и приятных покупок на сайте, в приложении и во всех магазинах Melu.
                    </p>

                    {/* Разделитель */}
                    <div className="w-full h-px bg-[#CCC] dark:bg-white/10" />

                    {/* Условия использования */}
                    <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="w-full py-5 flex items-center justify-between cursor-pointer"
                    >
                        <span className="text-[16px] font-medium uppercase">
                            Условия использования
                        </span>
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Разделитель */}
                    <div className="w-full h-px bg-[#CCC] dark:bg-white/10" />
                </div>
            </div>

            {/* Разделитель на всю ширину */}
            <div className="w-full h-px bg-[#CCC] dark:bg-white/10 mt-[60px] md:mt-[90px]" />

            {/* Вы недавно смотрели */}
            {recentlyViewed.length > 0 && (
                <div className="px-4 md:px-10 mt-[40px] md:mt-[60px]">
                    <h2 className="text-[18px] md:text-[24px] font-medium leading-[22px] md:leading-[26px] uppercase mb-[30px] md:mb-[60px]">
                        Вы недавно смотрели
                    </h2>

                    <Carousel
                        items={recentlyViewed}
                        visibleCount={isMobile ? 2 : 4}
                        gap={isMobile ? 12 : 20}
                        loading={false}
                        renderItem={(item, { widthStyle, idx, reportImageHeight }) => (
                            <div key={idx} style={widthStyle}>
                                <Card card={item} reportImageHeight={reportImageHeight} />
                            </div>
                        )}
                    />
                </div>
            )}

            {/* Модальное окно с условиями использования */}
            <AnimatePresence>
                {showTermsModal && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 z-50"
                            onClick={() => setShowTermsModal(false)}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed right-0 top-0 h-full w-full md:w-[640px] bg-[#FFFAF4] dark:bg-[#2A2A2B] z-50 overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-[#FFFAF4] dark:bg-[#2A2A2B] px-6 md:px-10 py-5 border-b border-[#CCC] dark:border-white/10 flex items-center justify-between">
                                <h2 className="text-[20px] md:text-[24px] font-medium uppercase">
                                    Условия использования
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowTermsModal(false)}
                                    className="cursor-pointer p-1"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="px-6 md:px-10 py-8">
                                <div className="space-y-6">
                                    {/* 1. Срок действия и номинал */}
                                    <div>
                                        <h3 className="text-[16px] font-medium uppercase mb-2">
                                            1. Срок действия и номинал
                                        </h3>
                                        <ul className="text-[#565656] text-[16px] leading-[20px] space-y-1">
                                            <li>Срок действия: Ваш подарок будет ждать своего часа целых 3 года с момента приобретения.</li>
                                            <li>Номинал: Вы сами выбираете сумму — от 500 до 500 000 рублей.</li>
                                        </ul>
                                    </div>

                                    {/* 2. Доставка виртуального сертификата */}
                                    <div>
                                        <h3 className="text-[16px] font-medium uppercase mb-2">
                                            2. Доставка виртуального сертификата
                                        </h3>
                                        <ul className="text-[#565656] text-[16px] leading-[20px] space-y-1">
                                            <li>Электронный сертификат мы моментально отправим в СМС-сообщении.</li>
                                            <li>Хотите сделать сюрприз? Вы можете заранее назначить дату и время доставки.</li>
                                        </ul>
                                    </div>

                                    {/* 3. Как активировать и использовать */}
                                    <div>
                                        <h3 className="text-[16px] font-medium uppercase mb-2">
                                            3. Как активировать и использовать
                                        </h3>
                                        <ul className="text-[#565656] text-[16px] leading-[20px] space-y-1">
                                            <li>Простая активация: Виртуальный сертификат можно легко привязать к вашему личному кабинету Melu (при оформлении заказа или позже, указав номер телефона).</li>
                                            <li>Оплата онлайн: Для использования на сайте или в приложении просто выберите способ оплаты «Картой онлайн» и введите код сертификата.</li>
                                            <li>Оплата в магазине:</li>
                                            <li className="pl-4">• Физический сертификат: Предъявите оригинал на кассе.</li>
                                            <li className="pl-4">• Виртуальный сертификат: Покажите SMS с кодом или письмо от Melu.</li>
                                        </ul>
                                    </div>

                                    {/* 4. Где и как можно расплатиться? */}
                                    <div>
                                        <h3 className="text-[16px] font-medium uppercase mb-2">
                                            4. Где и как можно расплатиться?
                                        </h3>
                                        <ul className="text-[#565656] text-[16px] leading-[20px] space-y-1">
                                            <li>Действует везде: Оплачивайте покупки в любых магазинах Melu, на сайте и в приложении.</li>
                                            <li>Гибкая оплата: Сертификатом можно оплатить весь заказ или его часть, а также доставку. Сумму можно разделить на несколько покупок.</li>
                                            <li>Недействителен для предзаказов.</li>
                                        </ul>
                                    </div>

                                    {/* 5. Совместимость с другими акциями */}
                                    <div>
                                        <h3 className="text-[16px] font-medium uppercase mb-2">
                                            5. Совместимость с другими акциями
                                        </h3>
                                        <ul className="text-[#565656] text-[16px] leading-[20px] space-y-1">
                                            <li>Да! Сертификат можно комбинировать с бонусными баллами и промокодами.</li>
                                            <li>Нет: При покупке самого сертификата бонусные баллы не начисляются.</li>
                                        </ul>
                                    </div>

                                    {/* 6. Возврат */}
                                    <div>
                                        <h3 className="text-[16px] font-medium uppercase mb-2">
                                            6. Возврат
                                        </h3>
                                        <ul className="text-[#565656] text-[16px] leading-[20px] space-y-1">
                                            <li>Возврат сертификата: Возврат физического или виртуального сертификата возможен только в розничных магазинах Melu.</li>
                                            <li>Возврат товара, купленного за сертификат: При возврате товара средства возвращаются наличными или на банковскую карту.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Кнопка закрыть */}
                                <button
                                    type="button"
                                    onClick={() => setShowTermsModal(false)}
                                    className="w-full h-[56px] bg-[#F4F4F4] dark:bg-white/10 rounded-lg text-[14px] font-medium uppercase cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-white/20 transition-colors mt-10"
                                >
                                    Закрыть
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
