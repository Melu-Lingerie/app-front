import {Card, Carousel} from '../../components';
import {ActualInfo} from '../../components';
import {mockBackStageData, mockCardsData} from './mock.ts';

export const MainPage = () => {

    return (
        <>
            <ActualInfo />
            <div className="px-10 pt-[90px]">
                <p className="text-2xl leading-6">НОВАЯ КОЛЛЕКЦИЯ</p>
                {/* TODO: добавить тип carousel */}
                <Carousel
                    items={mockCardsData}
                    gap={20}
                    visibleCount={4}
                    renderItem={(card, {widthStyle, imageRef, idx}) => (
                        <Card
                            key={`${card.productId}-${idx}`}
                            card={card}
                            widthStyle={widthStyle}
                            imageRef={imageRef}
                        />
                    )}
                />

                {/* горизонтальная линия */}
                <div className="relative w-screen left-[calc((100%-100vw)/2)] border border-[#CCC]"/>

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

                <div className="relative w-screen left-[calc((100%-100vw)/2)] border border-[#CCC]"/>
            </div>
        </>
    );
};
