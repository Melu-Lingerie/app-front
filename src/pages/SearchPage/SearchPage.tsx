import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductsService } from '@/api';
import type { ProductCatalogResponseDto } from '@/api';
import { Card } from '@/components/Card/Card';

export function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get('name') ?? '';

    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<ProductCatalogResponseDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [recommended, setRecommended] = useState<ProductCatalogResponseDto[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const search = useCallback(async (term: string) => {
        if (!term.trim()) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setLoading(true);
        setHasSearched(true);
        try {
            const data = await ProductsService.getCatalog(
                term.trim(),
                undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                0, 20,
            );
            setResults((data as any).content ?? []);
        } catch (err) {
            console.error('Search failed:', err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Загрузка рекомендуемых товаров
    useEffect(() => {
        ProductsService.getCatalog(
            undefined, undefined, undefined, undefined, undefined, undefined, undefined,
            'NEW', 0, 9,
        )
            .then((data) => setRecommended((data as any).content ?? []))
            .catch(() => {});
    }, []);

    // Поиск при загрузке если есть query param
    useEffect(() => {
        if (initialQuery) {
            search(initialQuery);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Автофокус
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = () => {
        const trimmed = query.trim();
        if (trimmed) {
            setSearchParams({ name: trimmed }, { replace: true });
            search(trimmed);
        }
    };

    const handleRecommendedClick = (name: string) => {
        setQuery(name);
        setSearchParams({ name }, { replace: true });
        search(name);
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setHasSearched(false);
        setSearchParams({}, { replace: true });
        inputRef.current?.focus();
    };

    return (
        <div className="pt-[30px] md:pt-[60px] px-4 md:px-[60px] lg:px-[110px] pb-[60px]">
            <h1 className="text-[10px] uppercase tracking-[0.1em] text-[#999] mb-1">Поиск по сайту</h1>
            <h2 className="text-[14px] md:text-[16px] uppercase tracking-[0.05em] mb-[30px]">Search Page</h2>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-[60px]">
                {/* Левая колонка — поиск и рекомендации */}
                <div className="w-full lg:w-[280px] flex-shrink-0">
                    {/* Поле поиска */}
                    <div className="flex items-center border-b border-[#CCC] dark:border-white/10 pb-2 mb-6">
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder='Например, "стринги"'
                            className="flex-1 text-sm bg-transparent outline-none placeholder:text-[#999]"
                        />
                        {query && (
                            <button onClick={handleClear} className="ml-2 text-[#999] hover:text-black dark:hover:text-white">
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Рекомендуемые товары */}
                    {recommended.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4">Рекомендуемые товары</h3>
                            <div className="space-y-2">
                                {recommended.map((item) => (
                                    <button
                                        key={item.productId}
                                        onClick={() => handleRecommendedClick(item.name ?? '')}
                                        className="block text-sm text-left hover:underline cursor-pointer"
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Кнопка найти */}
                    <button
                        onClick={handleSubmit}
                        className="w-full max-w-[280px] h-12 bg-[#F8C6D7] text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity"
                    >
                        Найти товар
                    </button>
                </div>

                {/* Правая колонка — результаты */}
                <div className="flex-1">
                    {loading ? (
                        <div className="text-sm text-[#999]">Поиск...</div>
                    ) : hasSearched ? (
                        <>
                            <h3 className="text-lg md:text-xl font-medium uppercase mb-6">
                                {results.length > 0 ? 'Возможно, вы ищете:' : 'Ничего не найдено'}
                            </h3>
                            {results.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
                                    <AnimatePresence>
                                        {results.map((item) => (
                                            <motion.div
                                                key={item.productId}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Card card={item as Required<ProductCatalogResponseDto>} />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </>
                    ) : (
                        <h3 className="text-lg md:text-xl font-medium uppercase text-[#999]">
                            Введите запрос для поиска
                        </h3>
                    )}
                </div>
            </div>
        </div>
    );
}
