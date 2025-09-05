import {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import ArrowDown from '@/assets/ArrowDown.svg';
import Filter from '@/assets/Filter.svg';
import qs from 'qs';
import {Card} from '../Card';

const Spinner = ({ size = 40, className = "" }: { size?: number; className?: string }) => (
    <span
        className={`animate-spin rounded-full border-4 border-current border-t-transparent ${className}`}
        style={{ width: size, height: size }}
        aria-label="Загрузка…"
    />
);

const MAPPED_SELECED_TYPES = {
    'трусики': 1,
    'сорочки': 2,
    'бра': 3
};

export const Catalog = () => {
    const [goods, setGoods] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const isFirstRender = useRef(true);

    const [minVal, setMinVal] = useState(0);
    const [maxVal, setMaxVal] = useState(90000);

    const min = 0;
    const max = 90000;

    const toggleType = (type: string) => {
        setSelectedTypes((prev: any) =>
            prev.includes(type)
                ? prev.filter((t: any) => t !== type)
                : [...prev, type]
        );
    };

    const checkFilterChanges = () => {
        let changesCount = 0;
        if (minVal !== 0 || maxVal !== 90000) {
            changesCount += 1;
        }
        if (selectedTypes.length > 0) {
            changesCount +=1;
        }
        return changesCount;
    };

    const getCatalog = async (minPrice: number, maxPrice: number, selectedTypes: number[]) => {
        try {
            setLoading(true);
            const res = await axios.get('/api/v1/products/catalog', {
                params: {
                    minPrice,
                    maxPrice,
                    // @ts-ignore
                    categories: selectedTypes.map((el) => MAPPED_SELECED_TYPES[el])
                },
                paramsSerializer: params => qs.stringify(params, { arrayFormat: "repeat" })
            });
            const newGoods = res.data.content.map((el: any) => {
                return {
                    image: el.s3url,
                    name: el.name,
                    price: el.price,
                    isNew: false,
                    colors: ['#F8C6D7', '#2A2A2B'],
                    isAddToCart: false
                };
            });
            setGoods([{}, ...newGoods]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFirstRender.current) {
            getCatalog(minVal, maxVal, selectedTypes);
            isFirstRender.current = false;
            return;
        }
        const id = setTimeout(() => {
            getCatalog(minVal, maxVal, selectedTypes);
        }, 500);

        return () => clearTimeout(id);
    }, [minVal, maxVal, selectedTypes]);

    return (
        <div style={{position: 'relative'}}>
            <h1 style={{margin: '60px 0 30px 40px', fontSize: 36, lineHeight: '38px'}}>Каталог</h1>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #CCC',
                position: 'relative',
                width: '100vw',
                left: 'calc((100% - 100vw) / 2)',
                height: '58px'
            }}>
                <div style={{display: 'flex', width:'100%', alignItems: 'center'}}>
                    <img style={{width: 14, height: 14, margin: '0 40px'}} src={Filter} alt="Filter" />
                    <p style={{fontSize: 14, lineHeight: '18px', marginRight: 20}}>{`ФИЛЬТРЫ${checkFilterChanges() > 0 ? ` (${checkFilterChanges()})` : ''}`}</p>
                    {checkFilterChanges() > 0 && <p onClick={() => {
                        setMinVal(min);
                        setMaxVal(max);
                        setSelectedTypes([]);
                    }} style={{fontSize: 14, lineHeight: '18px', marginRight: 20, color: '#F892B5', cursor: 'pointer'}}>СБРОСИТЬ ВСЕ</p>}
                </div>
            </div>
            {/*<div style={{*/}
            {/*    border: '1px solid #CCC',*/}
            {/*    position: 'relative',*/}
            {/*    width: '100vw',*/}
            {/*    left: 'calc((100% - 100vw) / 2)',*/}
            {/*}}/>*/}
            <ul className="grid grid-cols-4">
                {/*<div className="border border-gray-300 p-[-20px]">*/}
                {/*<img*/}
                {/*    src="/images/special.jpg"*/}
                {/*    alt="Особая картинка"*/}
                {/*    className="w-[445px] h-auto object-cover p-[10px]"*/}
                {/*/>*/}
                {/*</div>*/}
                {goods.map((item, index) => {
                    const isFirstInRow = index % 4 === 0;
                    const isLastInRow = (index + 1) % 4 === 0;

                    if (index === 0) {
                        return <div
                            key={index}
                            className={`border border-[#CCC] p-[20px] ${isLastInRow ? 'pr-[40px]' : isFirstInRow ? 'pl-[40px]' : ''}`}>
                            <div style={{marginRight: 40, display: 'flex', flexDirection: 'column', gap: '40px'}}>
                                <div className="w-full mx-auto">
                                    {/* Заголовок */}
                                    <button
                                        onClick={() => setIsOpen(!isOpen)}
                                        className="w-full flex justify-between items-center p-4 text-left text-[14px] leading-[18px]"
                                    >
                                        ЦЕНА
                                        <img className={`${
                                            isOpen ? "rotate-180" : "rotate-0"
                                        }`} src={ArrowDown} alt="Стрелка"/>
                                    </button>

                                    {/* Контент с анимацией */}
                                    <div
                                        className={`relative transition-all duration-300 overflow-hidden ${
                                            isOpen ? "max-h-96" : "max-h-0"
                                        }`}
                                    >
                                        <div className="p-6 w-full max-w-md mx-auto">
                                            <div className="relative h-2">
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginTop: 19,
                                                    marginBottom: 11,
                                                    fontSize: 14,
                                                    lineHeight: '18px',
                                                    color: '#999'
                                                }}>
                                                    <p>{`ОТ ${minVal} ₽`}</p>
                                                    <p>{`ДО ${maxVal} ₽`}</p>
                                                </div>
                                                {/* Линия фона */}
                                                <div style={{height: 1}} className="absolute w-full h-2 bg-gray-200 rounded"></div>

                                                {/* Активный отрезок */}
                                                <div
                                                    className="absolute h-2 bg-[#2A2A2B] rounded"
                                                    style={{
                                                        height: 1,
                                                        left: `${(minVal / max) * 100}%`,
                                                        right: `${100 - (maxVal / max) * 100}%`,
                                                    }}
                                                ></div>

                                                {/* Минимальный бегунок */}
                                                <input
                                                    type="range"
                                                    min={min}
                                                    max={max}
                                                    step={100}
                                                    value={minVal}
                                                    onChange={(e) => {
                                                        const value = Math.min(Number(e.target.value), maxVal - 500);
                                                        setMinVal(value);
                                                    }}
                                                    className="
            absolute w-full h-2 bg-transparent appearance-none z-20
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:h-2
    [&::-webkit-slider-thumb]:w-2
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:bg-[#2A2A2B]
    [&::-webkit-slider-thumb]:cursor-pointer
    [&::-webkit-slider-thumb]:relative
    [&::-webkit-slider-thumb]:top-1/2
    [&::-webkit-slider-thumb]:-translate-y-1/2

    [&::-moz-range-thumb]:h-2
    [&::-moz-range-thumb]:w-2
    [&::-moz-range-thumb]:rounded-full
    [&::-moz-range-thumb]:bg-[#2A2A2B]
    [&::-moz-range-thumb]:cursor-pointer
          "
                                                />

                                                {/* Максимальный бегунок */}
                                                <input
                                                    type="range"
                                                    min={min}
                                                    max={max}
                                                    step={100}
                                                    value={maxVal}
                                                    onChange={(e) => {
                                                        const value = Math.max(Number(e.target.value), minVal + 500);
                                                        setMaxVal(value);
                                                    }}
                                                    className="
            absolute w-full h-2 bg-transparent appearance-none z-20
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:h-2
    [&::-webkit-slider-thumb]:w-2
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:bg-[#2A2A2B]
    [&::-webkit-slider-thumb]:cursor-pointer
    [&::-webkit-slider-thumb]:relative
    [&::-webkit-slider-thumb]:top-1/2
    [&::-webkit-slider-thumb]:-translate-y-1/2

    [&::-moz-range-thumb]:h-2
    [&::-moz-range-thumb]:w-2
    [&::-moz-range-thumb]:rounded-full
    [&::-moz-range-thumb]:bg-[#2A2A2B]
    [&::-moz-range-thumb]:cursor-pointer
          "
                                                />
                                            </div>

                                            {/* Подписи */}
                                            <div className="flex justify-between mt-4 text-[14px] leading-[18px] font-medium">
                                            </div>
                                        </div>
                                        {/*/!* Активный отрезок *!/*/}
                                        {/*<div*/}
                                        {/*    className="absolute h-2 bg-[#2A2A2B] rounded"*/}
                                        {/*    style={{*/}
                                        {/*        left: `${(minVal / max) * 100}%`,*/}
                                        {/*        right: `${100 - (maxVal / max) * 100}%`,*/}
                                        {/*    }}*/}
                                        {/*></div>*/}
                                        {/*/!* Линия фона *!/*/}
                                        {/*<div className="absolute w-full h-2 bg-gray-200 rounded"></div>*/}
                                        {/*<div style={{*/}
                                        {/*    display: 'flex',*/}
                                        {/*    justifyContent: 'space-between',*/}
                                        {/*    marginTop: 19,*/}
                                        {/*    marginBottom: 11,*/}
                                        {/*    fontSize: 14,*/}
                                        {/*    lineHeight: '18px',*/}
                                        {/*    color: '#999'*/}
                                        {/*}}>*/}
                                        {/*    <p>{`ОТ ${minVal} ₽`}</p>*/}
                                        {/*    <p>{`ОТ ${maxVal} ₽`}</p>*/}
                                        {/*</div>*/}
                                        {/*<div className="space-y-4">*/}
                                        {/*    /!* Слайдеры *!/*/}
                                        {/*    /!* Минимальный бегунок *!/*/}
                                        {/*    <input*/}
                                        {/*        type="range"*/}
                                        {/*        min={min}*/}
                                        {/*        max={max}*/}
                                        {/*        step={100}*/}
                                        {/*        value={minVal}*/}
                                        {/*        onChange={(e) => {*/}
                                        {/*            const value = Math.min(Number(e.target.value), maxVal - 500);*/}
                                        {/*            setMinVal(value);*/}
                                        {/*        }}*/}
                                        {/*        className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2A2A2B] [&::-webkit-slider-thumb]:cursor-pointer pointer-events-auto"*/}
                                        {/*    />*/}

                                        {/*    /!* Максимальный бегунок *!/*/}
                                        {/*    <input*/}
                                        {/*        type="range"*/}
                                        {/*        min={min}*/}
                                        {/*        max={max}*/}
                                        {/*        step={100}*/}
                                        {/*        value={maxVal}*/}
                                        {/*        onChange={(e) => {*/}
                                        {/*            const value = Math.max(Number(e.target.value), minVal + 500);*/}
                                        {/*            setMaxVal(value);*/}
                                        {/*        }}*/}
                                        {/*        className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2A2A2B] [&::-webkit-slider-thumb]:cursor-pointer pointer-events-auto"*/}
                                        {/*    />*/}
                                        {/*    /!*<div className="flex flex-col gap-2">*!/*/}
                                        {/*    /!*    <input*!/*/}
                                        {/*    /!*        type="range"*!/*/}
                                        {/*    /!*        min="0"*!/*/}
                                        {/*    /!*        max="90000"*!/*/}
                                        {/*    /!*        step="100"*!/*/}
                                        {/*    /!*        value={price}*!/*/}
                                        {/*    /!*        onChange={(e) => setPrice(Number(e.target.value))}*!/*/}
                                        {/*    /!*        className="w-full accent-[#2A2A2B]"*!/*/}
                                        {/*    /!*        style={{ height: '1px', color: '#2A2A2B' }}*!/*/}
                                        {/*    /!*    />*!/*/}
                                        {/*    /!*</div>*!/*/}
                                        {/*</div>*/}
                                    </div>
                                </div>
                                <div className="w-full mx-auto">
                                    {/* Заголовок */}
                                    <button
                                        onClick={() => setIsTypeOpen(!isTypeOpen)}
                                        className="w-full flex justify-between items-center p-4 text-left text-[14px] leading-[18px]"
                                    >
                                        ТИП ТОВАРА
                                        <img className={`${
                                            isTypeOpen ? "rotate-180" : "rotate-0"
                                        }`} src={ArrowDown} alt="Стрелка"/>
                                    </button>

                                    {/* Контент с анимацией */}
                                    <div
                                        className={`transition-all duration-300 overflow-hidden ${
                                            isTypeOpen ? "max-h-96" : "max-h-0"
                                        }`}
                                    >
                                        <div className="p-4 space-y-2 text-[14px] leading-[18px] text-gray-800">
                                            {["трусики", "сорочки", "бра"].map((type) => (
                                                <label key={type} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTypes.includes(type)}
                                                        onChange={() => toggleType(type)}
                                                        className="accent-[#2A2A2B]"
                                                    />
                                                    {type}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>;
                    }

                    return (
                        <div key={index}
                             className={`border border-[#CCC] p-[20px] ${isLastInRow ? 'pr-[40px]' : isFirstInRow ? 'pl-[40px]' : ''}`}>
                            <Card
                                widthStyle={{flex: '0 0 25%'}} card={item}/></div>
                    );
                })}
            </ul>
            {/* Оверлей с прозрачным фоном */}
            {loading && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <Spinner className="text-white" size={48} />
                </div>
            )}
        </div>
        // <div>
        //     <h1 style={{margin: '60px 0 30px 40px', fontSize: 36, lineHeight: '38px'}}>Каталог</h1>
        //     <div style={{
        //         border: '1px solid #CCC',
        //         position: 'relative',
        //         width: '100vw',
        //         left: 'calc((100% - 100vw) / 2)',
        //         marginBottom: '58px'
        //     }}/>
        //     <div style={{
        //         border: '1px solid #CCC',
        //         position: 'relative',
        //         width: '100vw',
        //         left: 'calc((100% - 100vw) / 2)',
        //     }}/>
        //     <div style={{display: 'flex', margin: 0, flexWrap: 'wrap', gap: '20px', padding: '0 40px'}}>
        //         {goods.map((item, index) => (
        //             <div key={index} style={{flex: '0 0 25%', maxWidth: 445}}><Card widthStyle={{flex: '0 0 25%'}} card={item}/></div>
        //         ))}
        //     </div>
        // </div>
    );
};
