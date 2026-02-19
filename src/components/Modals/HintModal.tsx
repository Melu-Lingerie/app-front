import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { type RootState } from '@/store';
import { HintService, type CartHintCreateResponse } from '@/api/services/HintService';
import { useNotifications } from '@/hooks/useNotifications';
import api from '@/axios/api';
import type { AddressFacadeResponseDto } from '@/api/models/AddressFacadeResponseDto';
import { QRCodeSVG } from 'qrcode.react';

interface HintModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HintModal: React.FC<HintModalProps> = ({ isOpen, onClose }) => {
    const { addNotification } = useNotifications();
    const userId = useSelector((state: RootState) => state.user.userId);
    const cartId = useSelector((state: RootState) => state.cart.cartId);

    // Form state
    const [addresses, setAddresses] = useState<AddressFacadeResponseDto[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [showNewAddress, setShowNewAddress] = useState(false);
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');
    const [agreePolicy, setAgreePolicy] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Result state
    const [result, setResult] = useState<CartHintCreateResponse | null>(null);
    const [copied, setCopied] = useState(false);

    // Load saved addresses
    useEffect(() => {
        if (!isOpen || !userId) return;
        api.get(`/users/${userId}/addresses`)
            .then(res => {
                setAddresses(res.data || []);
                if (res.data?.length > 0) {
                    setSelectedAddressId(res.data[0].id);
                }
            })
            .catch(() => {});
    }, [isOpen, userId]);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setResult(null);
            setCopied(false);
            setShowNewAddress(false);
            setCity('');
            setAddress('');
            setPostalCode('');
            setAgreePolicy(false);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!userId || !cartId) return;
        setSubmitting(true);
        try {
            const request = showNewAddress || !selectedAddressId
                ? {
                    cartId,
                    city,
                    address,
                    postalCode,
                    recipientName,
                    recipientPhone,
                }
                : {
                    cartId,
                    savedAddressId: selectedAddressId,
                    city: '',
                    recipientName: '',
                    recipientPhone: '',
                };

            const response = await HintService.createHint(userId, request);
            setResult(response);
        } catch (err: any) {
            addNotification(err?.message || 'Не удалось сформировать ссылку', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopy = () => {
        if (result?.shareUrl) {
            navigator.clipboard.writeText(result.shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <motion.div
                    className="absolute inset-0 bg-black/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                />
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    className="relative z-10 w-[520px] max-w-[90vw] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#2A2A2B] rounded-[12px] p-6 shadow-xl"
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        type="button"
                        aria-label="Закрыть"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 dark:text-white text-xl cursor-pointer"
                    >
                        ✕
                    </button>

                    {!result ? (
                        /* === FORM STATE === */
                        <>
                            <h3 className="text-[16px] leading-[18px] uppercase font-semibold mb-4">
                                Намекнуть
                            </h3>
                            <p className="text-[#999] text-[13px] leading-[18px] mb-6">
                                Твои вещи собраны, нужно только указать свой адрес доставки
                                и отправить ссылку на оплату другому пользователю.
                            </p>

                            {/* Saved addresses */}
                            {addresses.length > 0 && (
                                <>
                                    <p className="text-[12px] uppercase font-medium mb-2">
                                        Адреса указанные в{' '}
                                        <span className="underline cursor-pointer" onClick={() => window.open('/account', '_blank')}>
                                            личном кабинете
                                        </span>
                                    </p>
                                    <select
                                        value={selectedAddressId ?? ''}
                                        onChange={(e) => {
                                            setSelectedAddressId(Number(e.target.value));
                                            setShowNewAddress(false);
                                        }}
                                        className="w-full h-[56px] border border-[#CCC] dark:border-white/10 rounded px-4 mb-4 outline-none bg-white dark:bg-[#2A2A2B]"
                                    >
                                        {addresses.map((addr) => (
                                            <option key={addr.id} value={addr.id}>
                                                {addr.country}, {addr.city}, {addr.streetAddress}
                                            </option>
                                        ))}
                                    </select>
                                </>
                            )}

                            {/* Toggle new address */}
                            <button
                                type="button"
                                onClick={() => setShowNewAddress(!showNewAddress)}
                                className="text-[12px] uppercase font-medium mb-4 flex items-center gap-1 cursor-pointer"
                            >
                                Укажите другой адрес
                                <span className="text-[10px]">{showNewAddress ? '▲' : '▼'}</span>
                            </button>

                            {/* New address form */}
                            {showNewAddress && (
                                <div className="flex flex-col gap-3 mb-4">
                                    <label className="block">
                                        <span className="text-[12px] uppercase">Город</span>
                                        <input
                                            className="mt-1 w-full h-[56px] border border-[#CCC] dark:border-white/10 rounded px-4 outline-none"
                                            placeholder="Введите название города"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-[12px] uppercase">Адрес</span>
                                        <input
                                            className="mt-1 w-full h-[56px] border border-[#CCC] dark:border-white/10 rounded px-4 outline-none"
                                            placeholder="Введите улицу, дом и квартиру"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-[12px] uppercase">Почтовый индекс</span>
                                        <input
                                            className="mt-1 w-full h-[56px] border border-[#CCC] dark:border-white/10 rounded px-4 outline-none"
                                            placeholder="Введите почтовый индекс вашего адреса"
                                            value={postalCode}
                                            onChange={(e) => setPostalCode(e.target.value)}
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-[12px] uppercase">Имя получателя</span>
                                        <input
                                            className="mt-1 w-full h-[56px] border border-[#CCC] dark:border-white/10 rounded px-4 outline-none"
                                            placeholder="Введите имя получателя"
                                            value={recipientName}
                                            onChange={(e) => setRecipientName(e.target.value)}
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-[12px] uppercase">Телефон</span>
                                        <input
                                            className="mt-1 w-full h-[56px] border border-[#CCC] dark:border-white/10 rounded px-4 outline-none"
                                            placeholder="Введите телефон"
                                            value={recipientPhone}
                                            onChange={(e) => setRecipientPhone(e.target.value)}
                                        />
                                    </label>
                                </div>
                            )}

                            {/* Policy checkbox */}
                            <label className="flex items-start gap-2 mb-6 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreePolicy}
                                    onChange={(e) => setAgreePolicy(e.target.checked)}
                                    className="mt-1"
                                />
                                <span className="text-[12px] leading-[16px] text-[#999]">
                                    Я согласен с{' '}
                                    <a href="/customers/privacy" className="underline text-black dark:text-white">Политикой конфиденциальности</a>
                                    {' '}и{' '}
                                    <a href="/customers/offer" className="underline text-black dark:text-white">Договором оферты</a>
                                </span>
                            </label>

                            {/* Submit */}
                            <button
                                type="button"
                                disabled={!agreePolicy || submitting || (!selectedAddressId && !showNewAddress)}
                                onClick={handleSubmit}
                                className="w-full h-[56px] border border-[#FFFBF5] dark:border-white/10 rounded bg-[#F8C6D7] text-[14px] leading-[18px] uppercase font-medium cursor-pointer hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Формируем...' : 'Сформировать ссылку'}
                            </button>
                        </>
                    ) : (
                        /* === RESULT STATE === */
                        <div className="flex flex-col items-center text-center">
                            <h3 className="text-[18px] leading-[22px] uppercase font-semibold mb-2">
                                Ссылка сформирована!
                            </h3>
                            <p className="text-[#999] text-[13px] leading-[18px] mb-6">
                                Осталось отправить ссылку на оплату другому пользователю.
                            </p>

                            {/* Share URL */}
                            <div
                                className="w-full flex items-center border border-[#CCC] dark:border-white/10 rounded px-4 py-3 mb-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition"
                                onClick={handleCopy}
                            >
                                <span className="flex-1 text-left text-[13px] truncate">
                                    {result.shareUrl}
                                </span>
                                <span className="ml-2 text-[12px] text-[#999]">
                                    {copied ? 'Скопировано!' : '📋'}
                                </span>
                            </div>

                            {/* QR Code */}
                            <div className="mb-6 p-4 bg-white rounded-lg">
                                <QRCodeSVG value={result.shareUrl} size={160} />
                            </div>

                            {/* Back to main */}
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-[14px] uppercase underline cursor-pointer"
                            >
                                На главную
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
