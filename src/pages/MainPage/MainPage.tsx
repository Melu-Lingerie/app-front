import {useCallback, useEffect, useState} from 'react';
import {ActualInfo, Card, Carousel} from '@/components';
import {type PageProductCatalogResponseDto, type ProductCatalogResponseDto, ProductsService} from '@/api';
import {mockBackStageData} from './mock.ts';
import {useAbortController} from '@/hooks/useAbortController.ts';
import {useNotifications} from '@/hooks/useNotifications.ts';
import {isAbortError} from '@/utils/utils.ts';

const PAGE_SIZE = 8;

export const MainPage = () => {
    const [newProducts, setNewProducts] = useState<ProductCatalogResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    // пагинация
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const { signal } = useAbortController();
    const { addNotification } = useNotifications();

    const fetchPage = useCallback(async (p: number): Promise<Required<PageProductCatalogResponseDto>> =>
        (await ProductsService.getCatalog(
            undefined, // name
            undefined, // minPrice
            undefined, // maxPrice
            undefined, // categories
            undefined, // sizes
            undefined, // sizesOfBraWithCups
            undefined, // colors
            'NEW',
            p,
            PAGE_SIZE,
            undefined,
            {signal}
        ) as unknown as Required<PageProductCatalogResponseDto>), [signal]);

    // первичная загрузка
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await fetchPage(0);
                setNewProducts(res.content ?? []);
                setHasMore(!res.last);   // типизировано: last:boolean
                setPage(res.number ?? 0);
            } catch (error) {
                if (isAbortError(error)) return;
                addNotification('Ошибка загрузки новых товаров', 'error');
            } finally {
                if (!signal.aborted) setLoading(false);
            }
        })();
    }, [fetchPage, addNotification, signal]);

    // подгрузка следующей страницы
    const onLoadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        try {
            setLoadingMore(true);
            const nextPage = page + 1;
            const res = await fetchPage(nextPage);

            setNewProducts(prev => [...prev, ...(res.content ?? [])]);
            setHasMore(!res.last);
            setPage(res.number ?? nextPage);
        } catch (error) {
            if (isAbortError(error)) return;
            addNotification('Не удалось подгрузить товары', 'error');
        } finally {
            setLoadingMore(false);
        }
    }, [fetchPage, page, hasMore, loadingMore, addNotification]);

    return (
        <>
            <ActualInfo />

            <div className="max-w-[100vw] overflow-hidden px-10 pt-[90px]">
                <h2 className="text-2xl leading-6">НОВАЯ КОЛЛЕКЦИЯ</h2>

                {!loading && !newProducts.length
                    ? <div className="py-20 text-center text-gray-500">Товары не найдены 😢</div>
                    : <Carousel
                        items={newProducts}
                        gap={20}
                        loading={loading}
                        visibleCount={4}
                        hasMore={hasMore}
                        loadingMore={loadingMore}
                        preloadOffset={2}
                        onLoadMore={onLoadMore}
                        renderItem={(item, {widthStyle, reportImageHeight}) => (
                            <div key={item.productId} style={widthStyle}>
                                <Card card={item} reportImageHeight={reportImageHeight} />
                            </div>
                        )}
                    />
                }

                {/* горизонтальная линия */}
                <div className="relative w-screen left-[calc((100%-100vw)/2)] h-[1px] bg-[#CCC]"/>

                <div className="my-[40px] mb-[90px]">
                    <h2 className="text-2xl leading-6">БЭКСТЕЙДЖ</h2>
                    <div className="flex gap-5 mt-[60px]">
                        {mockBackStageData.map((card) => (
                            <div
                                key={card.id}
                                className="flex justify-center items-end text-white text-center pb-[30px]"
                                style={{
                                    flex: '0 0 calc((100% - (20px * (4 - 1))) / 4)',
                                    background: `url(${card.image}) center/cover no-repeat`,
                                    height: 666,
                                }}
                            >
                                {card.title}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative w-screen left-[calc((100%-100vw)/2)] h-[1px] bg-[#CCC]"/>
            </div>
        </>
    );
};
