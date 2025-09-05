import {useCallback, useEffect, useRef, useState} from 'react';
import ArrowCarouselRight from '@/assets/ArrowCarouselRight.svg';
import ArrowCarouselLeft from '@/assets/ArrowCarouselLeft.svg';
import {Card} from '../Card';
import {ActualInfo} from '../ActualInfo';
import {mockBackStageData, mockCardsData} from './mock.ts';
import styles from './MainPage.module.css';

export const MainPage = () => {
    const gap = 20;
    const visibleCount = 4;

    const containerRef = useRef<HTMLDivElement | null>(null);
    const imageRef = useRef<HTMLDivElement | null>(null); // для замера картинки
    const [containerWidth, setContainerWidth] = useState(0);
    const [imageHeight, setImageHeight] = useState(0);
    const [index, setIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => setContainerWidth(el.clientWidth));
        ro.observe(el);
        setContainerWidth(el.clientWidth);
        return () => ro.disconnect();
    }, []);

    // ширина карточки с учётом gap
    const itemWidth = (containerWidth - gap * (visibleCount - 1)) / visibleCount;

    // клоны для бесконечной карусели
    const headClones = mockCardsData.slice(0, visibleCount);
    const tailClones = mockCardsData.slice(-visibleCount);
    const slides = [...tailClones, ...mockCardsData, ...headClones];

    const offsetIndex = index + visibleCount;

    // шаг = ширина карточки + gap
    const stepSize = itemWidth + gap;

    // корректное смещение
    const translateX = -(offsetIndex * stepSize);

    const handleNext = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setIndex((i) => i + 1);
    }, [isTransitioning]);

    const handlePrev = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setIndex((i) => i - 1);
    }, [isTransitioning]);

    const onTransitionEnd = useCallback(() => {
        if (index >= mockCardsData.length) {
            setIsTransitioning(false);
            setIndex(0);
        } else if (index < 0) {
            setIsTransitioning(false);
            setIndex(mockCardsData.length - 1);
        } else {
            setIsTransitioning(false);
        }
    }, [index]);

    useEffect(() => {
        if (imageRef.current) {
            setImageHeight(imageRef.current.clientHeight);
        }
    }, [containerWidth]);

    return (
        <>
            <ActualInfo/>
            <div className={styles.main}>
                <p className={styles.carousel__title}>НОВАЯ КОЛЛЕКЦИЯ</p>
                <div ref={containerRef} className={styles.carousel}>
                    <div className={styles.viewport}>
                        <div
                            className={styles.track}
                            style={{
                                gap,
                                transform: `translateX(${translateX}px)`,
                                transition: isTransitioning ? 'transform 400ms ease' : 'none',
                            }}
                            onTransitionEnd={onTransitionEnd}
                        >
                            {slides.map((card, idx) => (
                                <Card key={idx} card={card} widthStyle={{flex: `0 0 ${itemWidth}px`}}
                                      imageRef={idx === offsetIndex ? imageRef : undefined}/>
                            ))}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handlePrev}
                        className={styles.prevBtn}
                        style={{top: imageHeight / 2}}
                    >
                        <img style={{width: '27px', height: '27px'}} src={ArrowCarouselLeft} alt="Предыдущая"/>
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        className={styles.nextBtn}
                        style={{top: imageHeight / 2}}
                    >
                        <img style={{width: '27px', height: '27px'}} src={ArrowCarouselRight} alt="Следующая"/>
                    </button>
                </div>
                <div style={{
                    border: '1px solid #CCC',
                    position: 'relative',
                    width: '100vw',
                    left: 'calc((100% - 100vw) / 2)'
                }}/>
                <div style={{margin: '40px 0 90px 0'}}>
                    <p className={styles.carousel__title}>БЭКСТЕЙДЖ</p>
                    <div style={{display: 'flex', gap: 20, margin: '60px 0 0 0'}}>
                        {mockBackStageData.map((card, idx) => {
                            return <div key={idx} style={{
                                flex: '0 0 calc((100% - (20px * (4 - 1))) / 4)',
                                background: `url(${card.image}) center/cover no-repeat`,
                                height: 666,
                                textAlign: 'center',
                                color: 'white',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                                paddingBottom: 30
                            }}>{card.title}</div>;
                        })}
                    </div>
                </div>
                <div style={{
                    border: '1px solid #CCC',
                    position: 'relative',
                    width: '100vw',
                    left: 'calc((100% - 100vw) / 2)'
                }}/>
            </div>
        </>
    );
};