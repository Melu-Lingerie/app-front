import { useEffect, useState } from 'react';
import { Card, Carousel, ActualInfo } from '@/components';
import {
    ProductsService,
    type ProductCatalogResponseDto
} from '@/api';
import { mockBackStageData } from './mock.ts';

export const MainPage = () => {
    const [newProducts, setNewProducts] = useState<Required<ProductCatalogResponseDto>[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewProducts = async () => {
            try {
                setLoading(true);
                const res: any =
                    await ProductsService.getCatalog(
                        { page: 0, size: 20},
                        undefined, // name
                        undefined, // minPrice
                        undefined, // maxPrice
                        undefined, // categories
                        undefined, // sizes
                        undefined, // sizesOfBraWithCups
                        undefined, // colors
                        'NEW' // productStatus
                    );

                setNewProducts(res.content || []);
            } catch (e) {
                console.error('Ошибка загрузки новых товаров', e);
            } finally {
                setLoading(false);
            }
        };

        fetchNewProducts();
    }, []);

    return (
        <>
            <ActualInfo />
            <div className="px-10 pt-[90px]">
                <p className="text-2xl leading-6">НОВАЯ КОЛЛЕКЦИЯ</p>

                <Carousel
                        items={newProducts}
                        gap={20}
                        loading={loading}
                        visibleCount={4}
                        renderItem={(item, { widthStyle, idx }) => (
                            <div key={idx} style={widthStyle}>
                                <Card card={item} />
                            </div>
                        )}
                />

                {/* горизонтальная линия */}
                <div className="relative w-screen left-[calc((100%-100vw)/2)] border border-[#CCC]" />

                <div className="my-[40px] mb-[90px]">
                    <p className="text-2xl leading-6">БЭКСТЕЙДЖ</p>
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

                <div className="relative w-screen left-[calc((100%-100vw)/2)] border border-[#CCC]" />
            </div>
        </>
    );
};
