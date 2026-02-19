import {useState} from 'react';
import {DoubleSlider} from '@/components';
import {FilterAccordion} from './FilterAccordion.tsx';
import type {CategoryOption} from '@/pages/Catalog/hooks/useCatalogFilterOptions.ts';

interface Props {
    minVal: number;
    maxVal: number;
    priceMin: number;
    priceMax: number;
    categories: CategoryOption[];
    availableSizes: string[];
    availableColors: string[];
    selectedTypes: string[];
    setMinVal: (val: number) => void;
    setMaxVal: (val: number) => void;
    selectedSizes: string[];
    selectedColors: string[];
    toggleFilterValue: (key: 'types' | 'sizes' | 'colors', value: string) => void;
    onPriceCommit?: (values: { min: number; max: number }) => void;
}

export const FilterSidebar = ({
                                  minVal,
                                  maxVal,
                                  priceMin,
                                  priceMax,
                                  categories,
                                  availableSizes,
                                  availableColors,
                                  selectedTypes,
                                  setMinVal,
                                  setMaxVal,
                                  toggleFilterValue,
                                  selectedSizes,
                                  selectedColors,
                                  onPriceCommit,
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
                                min={priceMin}
                                max={priceMax}
                                valueMin={minVal}
                                valueMax={maxVal}
                                step={100}
                                onChange={({ min, max }) => {
                                    setMinVal(min);
                                    setMaxVal(max);
                                }}
                                onCommit={({ min, max }) => {
                                    onPriceCommit?.({ min, max });
                                }}
                            />
                        </div>
                    </div>
                </FilterAccordion>

                {/* Тип товара */}
                {categories.length > 0 && (
                    <FilterAccordion
                        title="ТИП ТОВАРА"
                        isOpen={isTypeOpen}
                        onToggle={() => setIsTypeOpen(!isTypeOpen)}
                    >
                        <div className="p-4 space-y-2 text-[14px] leading-[18px] text-gray-800 dark:text-white">
                            {categories.map((cat) => (
                                <div key={cat.id}>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedTypes.includes(cat.name.toLowerCase())}
                                            onChange={() => toggleFilterValue('types', cat.name.toLowerCase())}
                                            className="accent-[#2A2A2B]"
                                        />
                                        {cat.name.toLowerCase()}
                                    </label>
                                    {cat.children && cat.children.length > 0 && selectedTypes.includes(cat.name.toLowerCase()) && (
                                        <div className="ml-6 mt-1 space-y-1">
                                            {cat.children.map((child) => (
                                                <label key={child.id} className="flex items-center gap-2 cursor-pointer text-[13px]">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTypes.includes(child.name.toLowerCase())}
                                                        onChange={() => toggleFilterValue('types', child.name.toLowerCase())}
                                                        className="accent-[#2A2A2B]"
                                                    />
                                                    {child.name.toLowerCase()}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </FilterAccordion>
                )}

                {/* Размер */}
                {availableSizes.length > 0 && (
                    <FilterAccordion
                        title="РАЗМЕР"
                        isOpen={isSizeOpen}
                        onToggle={() => setIsSizeOpen(!isSizeOpen)}
                    >
                        <div className="p-4 space-y-2 text-[14px] leading-[18px] text-gray-800 dark:text-white">
                            {availableSizes.map((size) => (
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
                )}

                {/* Цвета */}
                {availableColors.length > 0 && (
                    <FilterAccordion
                        title="ЦВЕТА"
                        isOpen={isColorOpen}
                        onToggle={() => setIsColorOpen(!isColorOpen)}
                    >
                        <div className="p-4 space-y-2 text-[14px] leading-[18px] text-gray-800 dark:text-white">
                            {availableColors.map((color) => (
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
                )}
            </div>
        </div>
    );
};
