import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { numberFormat } from '@/utils/utils';
import type { SelectedItem } from './useMixMatchState';

type Props = {
    open: boolean;
    onClose: () => void;
    items: SelectedItem[];
    totalPrice: number;
};

export function MixMatchCompletionModal({ open, onClose, items, totalPrice }: Props) {
    const navigate = useNavigate();

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="bg-white dark:bg-[#2A2A2B] w-full max-w-[500px] p-6 md:p-10 rounded-lg"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-[24px] md:text-[32px] uppercase font-medium text-center mb-6">
                            Всё готово!
                        </h2>

                        <div className="flex justify-center gap-4 mb-6">
                            {items.map(item => (
                                <div key={item.variantId} className="text-center">
                                    <div className="w-20 h-28 md:w-24 md:h-36 overflow-hidden rounded-md mb-2">
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <p className="text-[10px] md:text-[11px] uppercase truncate max-w-[80px] md:max-w-[96px]">
                                        {item.name}
                                    </p>
                                    <p className="text-[10px] md:text-[11px] text-[#999]">
                                        {item.color}, {item.size}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <p className="text-center text-[16px] md:text-[18px] font-medium uppercase mb-8">
                            {numberFormat(totalPrice)} ₽
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={() => { onClose(); navigate('/cart'); }}
                                className="w-full h-[48px] md:h-[56px] bg-[#F8C6D7] text-[13px] md:text-[14px] uppercase font-medium rounded-[8px] cursor-pointer hover:bg-[#f0b4c7] transition-colors"
                            >
                                В корзину
                            </button>
                            <button
                                type="button"
                                onClick={() => { onClose(); navigate('/'); }}
                                className="w-full h-[48px] md:h-[56px] border border-[#CCC] dark:border-white/10 text-[13px] md:text-[14px] uppercase font-medium rounded-[8px] cursor-pointer hover:opacity-80 transition-colors"
                            >
                                На главную
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
