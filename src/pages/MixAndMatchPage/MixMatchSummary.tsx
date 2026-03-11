import { Bookmark, Gift } from 'lucide-react';

type Props = {
    isComplete: boolean;
    onBuySet: () => void;
    loading: boolean;
};

export function MixMatchSummary({ isComplete, onBuySet, loading }: Props) {
    return (
        <div className="border-t border-[#E5E5E5] dark:border-white/10 py-6 md:py-8 mt-6 md:mt-10">
            <div className="flex items-center justify-center gap-6 md:gap-10">
                {/* Add to favorites */}
                <button
                    type="button"
                    className="flex items-center gap-2 text-[12px] md:text-[13px] text-[#999] uppercase cursor-pointer hover:text-black dark:hover:text-white transition-colors"
                >
                    <Bookmark className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Добавить в избранное</span>
                </button>

                {/* Buy set button */}
                <button
                    type="button"
                    disabled={!isComplete || loading}
                    onClick={onBuySet}
                    className="h-[48px] md:h-[52px] px-10 md:px-16 bg-[#F8C6D7] text-[13px] md:text-[14px] uppercase font-medium rounded-sm cursor-pointer hover:bg-[#f0b4c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Добавление...' : 'Купить комплект'}
                </button>

                {/* Hint about gift */}
                <button
                    type="button"
                    className="flex items-center gap-2 text-[12px] md:text-[13px] text-[#999] uppercase cursor-pointer hover:text-black dark:hover:text-white transition-colors"
                >
                    <Gift className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Намекнуть о подарке</span>
                </button>
            </div>
        </div>
    );
}
