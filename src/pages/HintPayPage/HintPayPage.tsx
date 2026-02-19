import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HintService, type CartHintPublicInfo } from '@/api/services/HintService';
import { Spinner } from '@/components/Spinner';

export function HintPayPage() {
    const { shareToken } = useParams<{ shareToken: string }>();
    const [hint, setHint] = useState<CartHintPublicInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        if (!shareToken) return;
        setLoading(true);
        HintService.getHintInfo(shareToken)
            .then((data) => setHint(data))
            .catch(() => setError('Ссылка недействительна или срок действия истёк'))
            .finally(() => setLoading(false));
    }, [shareToken]);

    const handlePay = async (method: 'CARD' | 'SBP') => {
        if (!shareToken) return;
        setPaying(true);
        try {
            const response = await HintService.payHint(shareToken, { paymentMethod: method });
            window.location.href = response.confirmationUrl;
        } catch {
            setError('Не удалось инициировать оплату');
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Spinner className="text-gray-500" size={48} />
            </div>
        );
    }

    if (error || !hint) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                <h1 className="text-[24px] md:text-[36px] uppercase mb-4">
                    {error || 'Ссылка не найдена'}
                </h1>
                <p className="text-[#999] text-[14px]">
                    Возможно, ссылка уже была использована или срок её действия истёк.
                </p>
            </div>
        );
    }

    if (hint.status !== 'ACTIVE') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                <h1 className="text-[24px] md:text-[36px] uppercase mb-4">
                    {hint.status === 'PAID' ? 'Подарок уже оплачен' : 'Ссылка недействительна'}
                </h1>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="w-full max-w-[480px]">
                <h1 className="text-[24px] md:text-[36px] leading-[28px] md:leading-[40px] uppercase mb-4">
                    Вам намекнули на подарок!
                </h1>

                <p className="text-[#999] text-[14px] md:text-[16px] mb-2">
                    {hint.ownerFirstName} собрал(а) для вас подарок
                </p>

                <div className="text-[32px] md:text-[48px] font-semibold my-6">
                    {hint.totalAmount.toLocaleString()} ₽
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        disabled={paying}
                        onClick={() => handlePay('CARD')}
                        className="w-full h-[56px] rounded-[8px] border border-[#FFFBF5] dark:border-white/10 bg-[#F8C6D7] text-[14px] leading-[18px] uppercase font-medium cursor-pointer hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {paying ? 'Переходим к оплате...' : 'Оплатить картой'}
                    </button>
                    <button
                        disabled={paying}
                        onClick={() => handlePay('SBP')}
                        className="w-full h-[56px] rounded-[8px] border border-[#CCC] dark:border-white/10 text-[14px] leading-[18px] uppercase font-medium cursor-pointer hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Оплатить через СБП
                    </button>
                </div>

                <p className="text-[#999] text-[11px] mt-4">
                    Ссылка действительна до {new Date(hint.expiresAt).toLocaleDateString('ru-RU')}
                </p>
            </div>
        </div>
    );
}
