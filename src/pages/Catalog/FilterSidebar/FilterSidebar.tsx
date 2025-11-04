import {useState} from 'react';
import {DoubleSlider} from '@/components';
import {FilterAccordion} from './FilterAccordion.tsx';

interface Props {
    minVal: number;
    maxVal: number;
    selectedTypes: string[];
    setMinVal: (val: number) => void;
    setMaxVal: (val: number) => void;
    selectedSizes: string[];
    selectedColors: string[];
    toggleFilterValue: (key: 'types' | 'sizes' | 'colors', value: string) => void;
    onPriceCommit?: (values: { min: number; max: number }) => void; // 👈 добавили
}

export const FilterSidebar = ({
                                  minVal,
                                  maxVal,
                                  selectedTypes,
                                  setMinVal,
                                  setMaxVal,
                                  toggleFilterValue,
                                  selectedSizes,
                                  selectedColors,
                                  onPriceCommit, // 👈 добавили
                              }: Props) => {
    const [isPriceOpen, setIsPriceOpen] = useState(false);
    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [isSizeOpen, setIsSizeOpen] = useState(false);
    const [isColorOpen, setIsColorOpen] = useState(false);

    return (
        <div className="p-[20px] pl-[40px]">
            <div className="mr-[40px] flex flex-col">
                {/* Цена */}
                <FilterAccordion
                    title="ЦЕНА"
                    isOpen={isPriceOpen}
                    onToggle={() => setIsPriceOpen(!isPriceOpen)}
                >
                    <div className="w-full max-w-md mx-auto">
                        <div className="relative w-full h-12">
                            <div className="flex mt-5 justify-between text-[14px] leading-[18px] text-[#999]">
                                <p>{`ОТ ${minVal} ₽`}</p>
                                <p>{`ДО ${maxVal} ₽`}</p>
                            </div>
                            <DoubleSlider
                                valueMin={minVal}
                                valueMax={maxVal}
                                step={100}
                                onChange={({ min, max }) => {
                                    // локальные апдейты (в Catalog эти сеттеры уже могут запускать дебаунс записи в URL)
                                    setMinVal(min);
                                    setMaxVal(max);
                                }}
                                onCommit={({ min, max }) => {
                                    // финальный коммит — Catalog сделает flush в queryString
                                    onPriceCommit?.({ min, max });
                                }}
                            />
                        </div>
                    </div>
                </FilterAccordion>

                {/* Тип товара */}
                <FilterAccordion
                    title="ТИП ТОВАРА"
                    isOpen={isTypeOpen}
                    onToggle={() => setIsTypeOpen(!isTypeOpen)}
                >
                    <div className="p-4 space-y-2 text-[14px] leading-[18px] text-gray-800">
                        {['трусики', 'сорочки', 'бра'].map((type) => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedTypes.includes(type)}
                                    onChange={() => toggleFilterValue('types', type)}
                                    className="accent-[#2A2A2B]"
                                />
                                {type}
                            </label>
                        ))}
                    </div>
                </FilterAccordion>

                {/* Размер */}
                <FilterAccordion
                    title="РАЗМЕР"
                    isOpen={isSizeOpen}
                    onToggle={() => setIsSizeOpen(!isSizeOpen)}
                >
                    <div className="p-4 space-y-2 text-[14px] leading-[18px] text-gray-800">
                        {['S', 'M', 'L'].map((size) => (
                            <label key={size} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedSizes.includes(size)}
                                    onChange={() => toggleFilterValue('sizes', size)}
                                    className="accent-[#2A2A2B]"
                                />
                                {size}
                            </label>
                        ))}
                    </div>
                </FilterAccordion>

                {/* Цвета */}
                <FilterAccordion
                    title="ЦВЕТА"
                    isOpen={isColorOpen}
                    onToggle={() => setIsColorOpen(!isColorOpen)}
                >
                    <div className="p-4 space-y-2 text-[14px] leading-[18px] text-gray-800">
                        {['black', 'white'].map((color) => (
                            <label key={color} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedColors.includes(color)}
                                    onChange={() => toggleFilterValue('colors', color)}
                                    className="accent-[#2A2A2B]"
                                />
                                {color.toUpperCase()}
                            </label>
                        ))}
                    </div>
                </FilterAccordion>
            </div>
        </div>
    );
};
