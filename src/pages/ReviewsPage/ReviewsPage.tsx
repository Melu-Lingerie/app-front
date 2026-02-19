import { useEffect, useState, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import {
    ReviewService,
    type ReviewResponseDto,
    type ReviewsStatsDto,
} from '@/api/services/ReviewService';

type FilterType = 'all' | 'positive' | 'negative';

const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'ВСЕ' },
    { key: 'positive', label: 'ПОЛОЖИТЕЛЬНЫЕ' },
    { key: 'negative', label: 'ОТРИЦАТЕЛЬНЫЕ' },
];

export const ReviewsPage = () => {
    const [reviews, setReviews] = useState<ReviewResponseDto[]>([]);
    const [stats, setStats] = useState<ReviewsStatsDto | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [expandedResponses, setExpandedResponses] = useState<Set<string>>(new Set());

    const listRef = useRef<HTMLDivElement>(null);

    // Hero banner from admin (localStorage for now)
    const [bannerUrl] = useState<string | null>(() => {
        try {
            const saved = localStorage.getItem('reviews_hero_banner');
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed[0]?.url ?? null;
            }
        } catch { /* ignore */ }
        return null;
    });

    const loadReviews = useCallback(
        async (pageNum: number, append: boolean) => {
            if (append) setLoadingMore(true);
            else setLoading(true);

            try {
                const data = await ReviewService.getAllReviews({
                    filter,
                    page: pageNum,
                    size: 10,
                });
                setReviews((prev) =>
                    append ? [...prev, ...data.content] : data.content
                );
                setTotalPages(data.totalPages);
                setPage(pageNum);
            } catch {
                // silent
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [filter]
    );

    useEffect(() => {
        ReviewService.getReviewsStats()
            .then(setStats)
            .catch(() => {});
    }, []);

    useEffect(() => {
        setReviews([]);
        setPage(0);
        loadReviews(0, false);
    }, [filter, loadReviews]);

    const handleFilterChange = (f: FilterType) => {
        if (f === filter) return;
        setFilter(f);
    };

    const handleLoadMore = () => {
        if (page + 1 < totalPages) {
            loadReviews(page + 1, true);
        }
    };

    const handleScrollToList = () => {
        listRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleResponse = (id: string) => {
        setExpandedResponses((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }) + ' г.';
    };

    return (
        <div>
            {/* Hero banner */}
            <div
                className="relative w-full bg-[#f0e6d8] overflow-hidden"
                style={{ minHeight: '420px' }}
            >
                {bannerUrl ? (
                    <img
                        src={bannerUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-[#e8ddd0]" />
                )}

                <div className="relative z-10 flex flex-col items-center justify-end h-full min-h-[420px] px-4 md:px-[63px] pb-10 text-center">
                    <h1
                        className="text-[32px] md:text-[48px] leading-[36px] md:leading-[52px] italic mb-4"
                        style={{ fontFamily: 'serif' }}
                    >
                        Благодаря вам мы становимся лучше!
                    </h1>
                    <p className="text-[13px] md:text-[15px] text-gray-600 max-w-[600px] mb-6">
                        Мы будем признательны, если вы оставите отзыв о коллекции, работе отдела
                        клиентского сервиса и службы доставки или поделитесь мнением о качестве
                        изделий.
                    </p>
                    <button
                        type="button"
                        onClick={handleScrollToList}
                        className="px-8 py-3 bg-black text-white text-[13px] uppercase tracking-wider hover:bg-gray-800 transition-colors"
                    >
                        Оставить отзыв
                    </button>
                </div>
            </div>

            {/* Filters + stats bar */}
            <div
                ref={listRef}
                className="px-4 md:px-[63px] pt-6 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200"
            >
                <div className="flex gap-6">
                    {FILTERS.map((f) => (
                        <button
                            key={f.key}
                            type="button"
                            onClick={() => handleFilterChange(f.key)}
                            className={`text-[13px] uppercase pb-1 transition-colors ${
                                filter === f.key
                                    ? 'border-b border-black text-black'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {stats && (
                    <div className="flex gap-6 text-[13px] uppercase text-gray-500">
                        <span>
                            {stats.totalCount.toLocaleString('ru-RU')} отзывов
                        </span>
                        <span>
                            Средняя оценка{' '}
                            {(stats.averageRating * 2).toFixed(1)} из 10
                        </span>
                    </div>
                )}
            </div>

            {/* Reviews list */}
            <div className="px-4 md:px-[63px] py-8">
                {loading ? (
                    <div className="flex items-center justify-center min-h-[200px]">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : reviews.length === 0 ? (
                    <p className="text-gray-500 text-center py-20">
                        Отзывов пока нет
                    </p>
                ) : (
                    <div className="flex flex-col">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className="py-8 border-b border-gray-100 last:border-b-0"
                            >
                                {/* Name */}
                                <div className="mb-1">
                                    <span className="text-[14px] md:text-[15px] uppercase font-medium">
                                        {review.reviewerName ?? 'Аноним'}
                                    </span>
                                </div>

                                {/* Review text in dashed border */}
                                <div className="border border-dashed border-gray-300 p-4 md:p-6 mt-3 ml-0 md:ml-[120px]">
                                    <p className="text-[13px] md:text-[14px] leading-[22px] whitespace-pre-line">
                                        {review.reviewText}
                                    </p>
                                    <p className="text-[12px] text-pink-400 mt-3">
                                        {formatDate(review.createdAt)}
                                    </p>
                                </div>

                                {/* Admin response */}
                                {review.adminResponse && (
                                    <div className="ml-0 md:ml-[120px] mt-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleResponse(review.id)}
                                            className="text-[13px] text-gray-500 underline hover:text-gray-700 ml-auto block"
                                        >
                                            {expandedResponses.has(review.id)
                                                ? 'Свернуть ответ'
                                                : 'Развернуть ответ'}
                                        </button>

                                        {expandedResponses.has(review.id) && (
                                            <div className="border border-gray-200 p-4 md:p-6 mt-2 bg-gray-50">
                                                <p className="text-[13px] md:text-[14px] leading-[22px] whitespace-pre-line">
                                                    {review.adminResponse}
                                                </p>
                                                {review.adminResponseAt && (
                                                    <p className="text-[12px] text-gray-400 mt-3">
                                                        {formatDate(review.adminResponseAt)}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Load more */}
                        {page + 1 < totalPages && (
                            <div className="flex justify-center pt-8 pb-4">
                                <button
                                    type="button"
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="px-8 py-3 border border-black text-[13px] uppercase tracking-wider hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                                >
                                    {loadingMore ? (
                                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                    ) : null}
                                    Показать ещё
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
