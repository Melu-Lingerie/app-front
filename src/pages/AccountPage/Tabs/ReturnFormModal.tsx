import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { ReturnService, type CreateReturnRequest } from '@/api/services/ReturnService';
import type { OrderItemDto } from '@/api/models/OrderResponseDto';

interface ReturnFormModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    orderId: number;
    items: OrderItemDto[];
}

const REASONS = [
    { value: 'WRONG_SIZE', label: 'Не подошёл размер' },
    { value: 'WRONG_COLOR', label: 'Не понравился цвет' },
    { value: 'DEFECT', label: 'Брак/дефект' },
    { value: 'NOT_AS_DESCRIBED', label: 'Не соответствует описанию' },
    { value: 'OTHER', label: 'Другое' },
] as const;

export function ReturnFormModal({ open, onClose, onSuccess, orderId, items }: ReturnFormModalProps) {
    const [selectedItems, setSelectedItems] = useState<Map<number, number>>(new Map());
    const [reason, setReason] = useState<CreateReturnRequest['reason']>('WRONG_SIZE');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const toggleItem = (itemId: number) => {
        const next = new Map(selectedItems);
        if (next.has(itemId)) {
            next.delete(itemId);
        } else {
            next.set(itemId, 1);
        }
        setSelectedItems(next);
    };

    const updateQty = (itemId: number, qty: number, maxQty: number) => {
        const next = new Map(selectedItems);
        next.set(itemId, Math.min(Math.max(1, qty), maxQty));
        setSelectedItems(next);
    };

    const handleSubmit = async () => {
        if (selectedItems.size === 0) {
            setError('Выберите хотя бы один товар');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            await ReturnService.createReturn({
                orderId,
                items: Array.from(selectedItems.entries()).map(([orderItemId, quantity]) => ({
                    orderItemId,
                    quantity,
                })),
                reason,
                comment: comment || undefined,
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError('Не удалось создать возврат. Попробуйте позже.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    const formatPrice = (n: number) => n.toLocaleString('ru-RU');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[85vh] flex flex-col mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-[16px] uppercase font-semibold">Оформить возврат</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Items */}
                    <div>
                        <p className="text-[13px] text-gray-500 uppercase mb-3">Выберите товары</p>
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className={`flex items-center gap-3 p-3 rounded-lg mb-2 transition cursor-pointer ${
                                    selectedItems.has(item.id)
                                        ? 'bg-[#F8C6D7]/20 border border-[#F8C6D7]'
                                        : 'bg-gray-50 dark:bg-gray-900 border border-transparent hover:border-gray-300'
                                }`}
                                onClick={() => toggleItem(item.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedItems.has(item.id)}
                                    readOnly
                                    className="w-4 h-4 accent-[#F8C6D7]"
                                />
                                <div className="w-[50px] h-[65px] bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                    {item.imageUrl && (
                                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-medium truncate">{item.productName}</p>
                                    <p className="text-[11px] text-gray-500">
                                        {item.color && item.color}{item.size && ` / ${item.size}`}
                                    </p>
                                    <p className="text-[12px]">{formatPrice(item.unitPrice)} ₽</p>
                                </div>
                                {selectedItems.has(item.id) && item.quantity > 1 && (
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="w-7 h-7 border rounded text-sm cursor-pointer"
                                            onClick={() => updateQty(item.id, (selectedItems.get(item.id) || 1) - 1, item.quantity)}
                                        >
                                            -
                                        </button>
                                        <span className="text-sm w-5 text-center">{selectedItems.get(item.id)}</span>
                                        <button
                                            className="w-7 h-7 border rounded text-sm cursor-pointer"
                                            onClick={() => updateQty(item.id, (selectedItems.get(item.id) || 1) + 1, item.quantity)}
                                        >
                                            +
                                        </button>
                                        <span className="text-[10px] text-gray-400">/ {item.quantity}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Reason */}
                    <div>
                        <p className="text-[13px] text-gray-500 uppercase mb-2">Причина возврата</p>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value as CreateReturnRequest['reason'])}
                            className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-[14px] outline-none focus:border-[#F8C6D7]"
                        >
                            {REASONS.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Comment */}
                    <div>
                        <p className="text-[13px] text-gray-500 uppercase mb-2">Комментарий</p>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Опишите причину возврата..."
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-[14px] outline-none focus:border-[#F8C6D7] resize-none"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-[13px]">{error}</p>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 h-[48px] border border-gray-300 dark:border-gray-600 rounded-[8px] text-[13px] uppercase cursor-pointer hover:opacity-80"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || selectedItems.size === 0}
                        className="flex-1 h-[48px] bg-[#F8C6D7] rounded-[8px] text-[13px] uppercase cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Оформить возврат'}
                    </button>
                </div>
            </div>
        </div>
    );
}
