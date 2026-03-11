import { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState, type AppDispatch } from '@/store';
import { fetchCart } from '@/store/cartSlice';
import { Spinner } from '@/components/Spinner';
import { useNotifications } from '@/hooks/useNotifications';
import api from '@/axios/api';

import { useMixMatchSteps } from './useMixMatchSteps';
import { useMixMatchState } from './useMixMatchState';
import { MixMatchStep } from './MixMatchStep';
import { MixMatchSummary } from './MixMatchSummary';
import { MixMatchCompletionModal } from './MixMatchCompletionModal';

export function MixAndMatchPage() {
    const dispatch = useDispatch<AppDispatch>();
    const cartId = useSelector((state: RootState) => state.cart.cartId);
    const { addNotification } = useNotifications();

    const { steps, loading: stepsLoading } = useMixMatchSteps();
    const { selections, select, deselect, isComplete, totalPrice, selectedItems } = useMixMatchState(steps);

    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleBuySet = useCallback(async () => {
        if (!cartId || !isComplete) return;

        const items = selectedItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: 1,
        }));

        setSubmitting(true);
        try {
            await api.post(`/cart/${cartId}/sets`, { items });
            dispatch(fetchCart(cartId));
            setShowModal(true);
        } catch {
            addNotification('Не удалось добавить комплект в корзину', 'error');
        } finally {
            setSubmitting(false);
        }
    }, [cartId, isComplete, selectedItems, dispatch, addNotification]);

    if (stepsLoading) {
        return (
            <div className="flex items-center justify-center w-full min-h-[400px]">
                <Spinner className="text-gray-500" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-[120px]">
            {/* Header */}
            <div className="px-4 md:px-[195px] pt-[30px] md:pt-[60px] mb-6 md:mb-10">
                <h1 className="text-[28px] md:text-[42px] uppercase font-medium leading-tight">
                    Mix'n'Match
                </h1>
                <p className="text-[13px] md:text-[16px] text-[#999] mt-2 md:mt-3 max-w-[600px]">
                    Соберите свой идеальный комплект белья — выберите основу, добавьте посыпку и украсьте вишенкой
                </p>
            </div>

            {/* Steps */}
            <div className="px-4 md:px-[195px]">
                {steps.map((step) => (
                    <MixMatchStep
                        key={step.id}
                        step={step}
                        selection={selections[step.slug] ?? null}
                        onSelect={(item) => select(step.slug, item)}
                        onDeselect={() => deselect(step.slug)}
                    />
                ))}
            </div>

            {/* Summary bar */}
            <MixMatchSummary
                isComplete={isComplete}
                totalPrice={totalPrice}
                selectedItems={selectedItems}
                onBuySet={handleBuySet}
                loading={submitting}
            />

            {/* Completion modal */}
            <MixMatchCompletionModal
                open={showModal}
                onClose={() => setShowModal(false)}
                items={selectedItems}
                totalPrice={totalPrice}
            />
        </div>
    );
}
