import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronDown } from 'lucide-react';
import { type RootState } from '@/store';
import { Spinner } from '@/components/Spinner';
import { Card } from '@/components';
import { Carousel } from '@/components/Carousel/Carousel';
import { useNotifications } from '@/hooks/useNotifications';
import { useIsMobile } from '@/hooks/useIsMobile';
import { numberFormat } from '@/utils/utils';
import { resolveColor } from '@/utils/colorMap';
import api from '@/axios/api';

type StyleOption = { id: number; name: string };
type ColorOption = { id: number; name: string; hexCode: string };
type FrequencyOption = { value: string; label: string };

type SecretBoxPlan = {
    id: number;
    name: string;
    articleNumber: string;
    price: number;
    description: string;
    heroImageUrl?: string;
    heroTitle: string;
    heroSubtitle: string;
    whatIncluded: string;
    paymentDeliveryInfo: string;
    styles: StyleOption[];
    colors: ColorOption[];
    frequencies: FrequencyOption[];
    availableSizes: string[];
};

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-[#CCC] dark:border-white/10">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-4 text-[13px] uppercase tracking-wide cursor-pointer"
            >
                <span>{title}</span>
                <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[500px] pb-4' : 'max-h-0'}`}>
                <div className="text-[13px] leading-[20px] text-[#666] dark:text-[#AAA] whitespace-pre-line">{children}</div>
            </div>
        </div>
    );
}

/** Styled select matching the design — rounded border, chevron */
function StyledSelect({ value, onChange, children, hasColorDot, dotColor }: {
    value: string;
    onChange: (v: string) => void;
    children: React.ReactNode;
    hasColorDot?: boolean;
    dotColor?: string;
}) {
    return (
        <div className="relative">
            {hasColorDot && dotColor && (
                <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-[#DDD]"
                    style={{ backgroundColor: dotColor }}
                />
            )}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full h-[48px] border border-[#CCC] dark:border-white/20 rounded-[8px] text-[14px] appearance-none cursor-pointer bg-transparent ${
                    hasColorDot ? 'pl-10 pr-10' : 'px-4 pr-10'
                }`}
            >
                {children}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999] pointer-events-none" />
        </div>
    );
}

export function SecretBoxPage() {
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const isMobile = useIsMobile();

    const isAuthenticated = useSelector((s: RootState) => s.user.isAuthenticated);

    const [plan, setPlan] = useState<SecretBoxPlan | null>(null);
    const [loading, setLoading] = useState(true);

    const [selectedStyle, setSelectedStyle] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedFrequency, setSelectedFrequency] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [boxProducts, setBoxProducts] = useState<any[]>([]);
    const [boxLoading, setBoxLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/secret-box/plans');
                if (data.length > 0) {
                    const p = data[0];
                    setPlan(p);
                    if (p.styles?.length) setSelectedStyle(p.styles[0].name);
                    if (p.colors?.length) setSelectedColor(p.colors[0].name);
                    if (p.availableSizes?.length) setSelectedSize(p.availableSizes[0]);
                    if (p.frequencies?.length) setSelectedFrequency(p.frequencies[0].value);
                }
            } catch {
                addNotification('Не удалось загрузить Secret Box', 'error');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/products/catalog', { params: { size: 12 } });
                setBoxProducts(data.content || []);
            } catch { /* ignore */ }
            finally { setBoxLoading(false); }
        })();
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!isAuthenticated) {
            window.dispatchEvent(new Event('open-login-modal'));
            return;
        }
        if (!plan) return;

        setSubmitting(true);
        try {
            await api.post('/secret-box/orders', {
                planId: plan.id,
                style: selectedStyle,
                colorPalette: selectedColor,
                size: selectedSize,
                frequency: selectedFrequency,
            });
            addNotification('Подписка Secret Box оформлена!', 'success');
            navigate('/account/orders');
        } catch (e: any) {
            const msg = e?.response?.data?.message || 'Не удалось оформить подписку';
            addNotification(msg, 'error');
        } finally {
            setSubmitting(false);
        }
    }, [plan, selectedStyle, selectedColor, selectedSize, selectedFrequency, isAuthenticated, navigate, addNotification]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner className="text-gray-500" size={48} />
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-[#999]">Secret Box пока недоступен</p>
            </div>
        );
    }

    const selectedColorObj = plan.colors.find(c => c.name === selectedColor);
    const dotColor = selectedColorObj?.hexCode || resolveColor(selectedColorObj?.name || '');

    return (
        <div className="pb-[60px]">
            {/* Hero + Form — full width, two columns */}
            <div className="flex flex-col md:flex-row w-full min-h-[600px] md:min-h-[700px]">

                {/* Left — Hero image with overlay text */}
                <div className="w-full md:w-1/2 relative bg-[#E8D5C4]">
                    {plan.heroImageUrl ? (
                        <img
                            src={plan.heroImageUrl}
                            alt="Secret Box"
                            className="w-full h-full object-cover absolute inset-0"
                        />
                    ) : (
                        <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-[#E8D5C4] to-[#F5DDD0]" />
                    )}

                    {/* Text overlay — top-left */}
                    <div className="relative z-10 p-6 md:p-10 flex flex-col justify-start h-full">
                        <p className="text-[11px] uppercase tracking-widest text-[#2A2A2B] mb-4">
                            Подписка SECRET BOX
                        </p>
                        <h1 className="text-[22px] md:text-[28px] leading-[26px] md:leading-[34px] font-bold uppercase max-w-[400px]">
                            {plan.heroTitle || 'ОФОРМИ ПОДПИСКУ НА SECRET BOX. УДИВИ СЕБЯ НЕОЖИДАННЫМ ПОДАРКОМ.'}
                        </h1>
                    </div>
                </div>

                {/* Right — Form */}
                <div className="w-full md:w-1/2 px-4 md:px-10 py-6 md:py-8">
                    <div className="md:max-w-[440px]">
                        {/* Title */}
                        <h2 className="text-[18px] md:text-[20px] leading-[22px] uppercase font-semibold mb-1">
                            Подписка «{plan.name}»
                        </h2>
                        <p className="text-[11px] text-[#999] mb-2">ID: {plan.articleNumber}</p>
                        <p className="text-[18px] md:text-[20px] mb-6">{String(numberFormat(plan.price))} ₽</p>

                        {/* Style */}
                        <div className="mb-5">
                            <label className="block text-[12px] uppercase tracking-wide font-semibold mb-2">Выбери стиль</label>
                            <StyledSelect value={selectedStyle} onChange={setSelectedStyle}>
                                {plan.styles.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                            </StyledSelect>
                        </div>

                        {/* Color */}
                        <div className="mb-5">
                            <label className="block text-[12px] uppercase tracking-wide font-semibold mb-2">Цветовая гамма</label>
                            <StyledSelect value={selectedColor} onChange={setSelectedColor} hasColorDot dotColor={dotColor}>
                                {plan.colors.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </StyledSelect>
                        </div>

                        {/* Size */}
                        <div className="mb-5">
                            <label className="block text-[12px] uppercase tracking-wide font-semibold mb-1">Размер</label>
                            <p className="text-[11px] text-[#999] underline mb-2 cursor-pointer">Таблица размеров</p>
                            <StyledSelect value={selectedSize} onChange={setSelectedSize}>
                                {plan.availableSizes.map(s => <option key={s} value={s}>{s}</option>)}
                            </StyledSelect>
                        </div>

                        {/* Frequency */}
                        <div className="mb-6">
                            <label className="block text-[12px] uppercase tracking-wide font-semibold mb-2">Частота получения</label>
                            <StyledSelect value={selectedFrequency} onChange={setSelectedFrequency}>
                                {plan.frequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </StyledSelect>
                        </div>

                        {/* Button */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full h-[48px] bg-[#F8C6D7] text-[13px] uppercase tracking-wide font-medium rounded-[8px] cursor-pointer hover:bg-[#f0b4c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                        >
                            {submitting ? 'Оформление...' : 'Перейти в корзину →'}
                        </button>

                        {/* Accordions */}
                        <div className="mt-6">
                            <Accordion title="Что такое подписка «SECRET BOX»" defaultOpen>
                                {plan.description}
                            </Accordion>
                            <Accordion title="Что входит в подписку">
                                {plan.whatIncluded}
                            </Accordion>
                            <Accordion title="Оплата и доставка">
                                {plan.paymentDeliveryInfo}
                            </Accordion>
                        </div>
                    </div>
                </div>
            </div>

            {/* "Положи в BOX" */}
            <div className="px-4 md:px-10 mt-10 md:mt-[60px]">
                <h2 className="text-[18px] md:text-[24px] uppercase font-medium mb-4 md:mb-6">
                    Положи в BOX
                </h2>
                <Carousel
                    items={boxProducts}
                    gap={isMobile ? 8 : 12}
                    loading={boxLoading}
                    visibleCount={6}
                    mobileVisibleCount={2}
                    renderItem={(item, { widthStyle, idx, reportImageHeight }) => (
                        <div key={idx} style={widthStyle}>
                            <Card card={item} reportImageHeight={reportImageHeight} />
                        </div>
                    )}
                />
            </div>
        </div>
    );
}
