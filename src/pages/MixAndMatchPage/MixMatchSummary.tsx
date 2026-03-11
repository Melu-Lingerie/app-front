import { numberFormat } from '@/utils/utils';
import type { SelectedItem } from './useMixMatchState';

type Props = {
    isComplete: boolean;
    totalPrice: number;
    selectedItems: SelectedItem[];
    onBuySet: () => void;
    loading: boolean;
};

export function MixMatchSummary({ isComplete, totalPrice, selectedItems, onBuySet, loading }: Props) {
    return (
        <div className="sticky bottom-0 bg-white dark:bg-[#1F1F20] border-t border-[#E5E5E5] dark:border-white/10 px-4 md:px-[195px] py-4 md:py-6 z-10">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        {selectedItems.map(item => (
                            <div
                                key={item.variantId}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-[#E5E5E5]"
                            >
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                    {totalPrice > 0 && (
                        <p className="text-[14px] md:text-[16px] font-medium uppercase">
                            Итого: {String(numberFormat(totalPrice))} ₽
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    disabled={!isComplete || loading}
                    onClick={onBuySet}
                    className="h-[48px] md:h-[56px] px-8 md:px-12 bg-[#F8C6D7] text-[13px] md:text-[14px] uppercase font-medium rounded-[8px] cursor-pointer hover:bg-[#f0b4c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Добавление...' : 'Купить комплект'}
                </button>
            </div>
        </div>
    );
}
