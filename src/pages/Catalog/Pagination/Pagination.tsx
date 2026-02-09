import { useCallback, useMemo } from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    if (totalPages <= 1) return null;

    const items = useMemo(() => {
        const result: (number | 'ellipsis')[] = [];
        const delta = 2;
        const rangeStart = Math.max(0, currentPage - delta);
        const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

        if (rangeStart > 0) {
            result.push(0);
            if (rangeStart > 1) result.push('ellipsis');
        }

        for (let i = rangeStart; i <= rangeEnd; i++) {
            result.push(i);
        }

        if (rangeEnd < totalPages - 1) {
            if (rangeEnd < totalPages - 2) result.push('ellipsis');
            result.push(totalPages - 1);
        }

        return result;
    }, [currentPage, totalPages]);

    const handlePrev = useCallback(() => {
        if (currentPage > 0) onPageChange(currentPage - 1);
    }, [currentPage, onPageChange]);

    const handleNext = useCallback(() => {
        if (currentPage < totalPages - 1) onPageChange(currentPage + 1);
    }, [currentPage, totalPages, onPageChange]);

    const base = 'w-10 h-10 flex items-center justify-center rounded-lg text-sm transition-colors cursor-pointer';
    const active = 'bg-[#F8C6D7] text-white font-semibold';
    const inactive = 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300';
    const disabled = 'opacity-40 cursor-not-allowed';

    return (
        <nav className="flex items-center justify-center gap-1 py-8" aria-label="Навигация по страницам">
            <button
                onClick={handlePrev}
                disabled={currentPage === 0}
                className={`${base} ${currentPage === 0 ? disabled : inactive}`}
                aria-label="Предыдущая страница"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            {items.map((item, idx) =>
                item === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-400 select-none">
                        ...
                    </span>
                ) : (
                    <button
                        key={item}
                        onClick={() => onPageChange(item)}
                        className={`${base} ${item === currentPage ? active : inactive}`}
                        aria-current={item === currentPage ? 'page' : undefined}
                    >
                        {item + 1}
                    </button>
                ),
            )}

            <button
                onClick={handleNext}
                disabled={currentPage >= totalPages - 1}
                className={`${base} ${currentPage >= totalPages - 1 ? disabled : inactive}`}
                aria-label="Следующая страница"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
        </nav>
    );
};
