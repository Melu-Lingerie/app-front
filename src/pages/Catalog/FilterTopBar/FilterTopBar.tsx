import { useEffect, useRef, useState } from 'react';
import CloseIcon from '@/assets/CloseIcon.svg';
import type {SortOption} from '@/pages/Catalog/constants';
import {ChevronDown, SlidersHorizontal, X} from 'lucide-react';
import { DoubleSlider } from '@/components';
import { FilterAccordion } from '../FilterSidebar/FilterAccordion.tsx';
import type {CategoryOption} from '@/pages/Catalog/hooks/useCatalogFilterOptions.ts';

interface FilterTopBarProps {
    filterChanges: number;
    onReset: () => void;
    selectedTypes: string[];
    toggleFn: (key: 'types' | 'sizes' | 'colors', value: string) => void;
    options: SortOption[];
    selectedOption: SortOption;
    onSelectChange: (val: SortOption) => void;
    // Mobile filter props
    minVal?: number;
    maxVal?: number;
    priceMin?: number;
    priceMax?: number;
    categories?: CategoryOption[];
    availableSizes?: string[];
    availableColors?: string[];
    selectedSizes?: string[];
    selectedColors?: string[];
    setMinVal?: (val: number) => void;
    setMaxVal?: (val: number) => void;
    onPriceCommit?: (values: { min: number; max: number }) => void;
}

export const FilterTopBar = ({
                                 filterChanges,
                                 onReset,
                                 selectedTypes,
                                 toggleFn,
                                 options,
                                 selectedOption,
                                 onSelectChange,
                                 // Mobile filter props
                                 minVal = 0,
                                 maxVal = 90000,
                                 priceMin = 0,
                                 priceMax = 90000,
                                 categories = [],
                                 availableSizes = [],
                                 availableColors = [],
                                 selectedSizes = [],
                                 selectedColors = [],
                                 setMinVal,
                                 setMaxVal,
                                 onPriceCommit,
                             }: FilterTopBarProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Mobile filter accordion states
    const [isPriceOpen, setIsPriceOpen] = useState(true);
    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [isSizeOpen, setIsSizeOpen] = useState(false);
    const [isColorOpen, setIsColorOpen] = useState(false);

    const handleSelect = (option: 'Все' | 'Новинки' | 'Скоро в продаже') => {
        onSelectChange(option);
        setIsOpen(false);
    };

    // закрытие по клику вне dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // следим за скроллом и добавляем тень только после прилипания
    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 0);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <div
                className={`
                    fixed top-[49px] left-0 right-0
                    grid grid-cols-2 md:grid-cols-4
                    border-b border-t border-[#CCC] dark:border-white/10
                    h-[58px]
                    transition-shadow duration-300
                    bg-[#FFFBF5] dark:bg-[#2A2A2B]
                    ${isSticky ? 'shadow-md' : 'shadow-none'}
                `}
            >
                {/* Колонка 1 — фильтры */}
                <div className="col-span-1 flex items-center px-4 md:px-10">
                    <button
                        className="md:hidden flex items-center gap-2"
                        onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                    >
                        <SlidersHorizontal width={17} height={17} />
                        <span className="text-[14px] leading-[18px]">
                            {`ФИЛЬТРЫ${filterChanges > 0 ? ` (${filterChanges})` : ''}`}
                        </span>
                        <ChevronDown
                            width={17}
                            height={17}
                            className={`transition-transform ${isMobileFiltersOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <div className="hidden md:flex items-center">
                        <SlidersHorizontal width={17} height={17} />
                        <p className="text-[14px] leading-[18px] ml-10 mr-5">
                            {`ФИЛЬТРЫ${filterChanges > 0 ? ` (${filterChanges})` : ''}`}
                        </p>
                        {filterChanges > 0 && (
                            <p
                                onClick={onReset}
                                className="text-[14px] leading-[18px] text-[#F892B5] cursor-pointer hover:underline"
                            >
                                СБРОСИТЬ ВСЕ
                            </p>
                        )}
                    </div>
                    {/* Mobile reset button */}
                    {filterChanges > 0 && (
                        <p
                            onClick={onReset}
                            className="md:hidden text-[12px] leading-[18px] text-[#F892B5] cursor-pointer hover:underline ml-2"
                        >
                            СБРОСИТЬ
                        </p>
                    )}
                </div>

                {/* Колонка 2 — Select (сортировка) */}
                <div className="col-span-1 relative flex items-center gap-[10px] px-4 md:px-5 justify-end md:justify-start">
                    <div ref={dropdownRef} className="relative">
                        <div
                            className="flex items-center gap-[6px] cursor-pointer select-none"
                            onClick={() => setIsOpen((prev) => !prev)}
                            aria-expanded={isOpen}
                            role="button"
                            tabIndex={0}
                        >
                            <p className="text-[12px] md:text-[14px] leading-[18px] uppercase">{selectedOption}</p>
                            <button className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                                <ChevronDown width={17} height={17} />
                            </button>
                        </div>

                        {isOpen && (
                            <div
                                className="absolute top-full right-0 md:left-0 mt-2 w-[200px] bg-white dark:bg-[#2A2A2B] border border-[#CCC] dark:border-white/10 shadow-md rounded-md z-10 max-h-[200px] overflow-y-auto"
                                role="listbox"
                            >
                                {options.map((option) => (
                                    <div
                                        key={option}
                                        onClick={() => handleSelect(option)}
                                        role="option"
                                        aria-selected={selectedOption === option}
                                        className={`px-4 py-2 text-[14px] leading-[18px] uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 ${
                                            selectedOption === option ? 'text-[#F892B5] font-medium' : ''
                                        }`}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Колонка 3 — пустая (скрыта на мобилке) */}
                <div className="hidden md:block col-span-1" />

                {/* Колонка 4 — выбранные фильтры (скрыта на мобилке) */}
                <div className="hidden md:flex col-span-1 items-center gap-5 px-5 justify-end">
                    {selectedTypes.map((type) => (
                        <div
                            key={type}
                            className="flex items-center gap-1 cursor-pointer"
                            onClick={() => toggleFn('types', type)}
                        >
                            <span className="mr-2.5 text-[14px] leading-[18px] text-[#999] uppercase">
                                {type}
                            </span>
                            <img src={CloseIcon} alt="Сбросить" className="w-3 h-3" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Filters Panel */}
            {isMobileFiltersOpen && (
                <div className="md:hidden fixed inset-0 z-[60] bg-black/50" onClick={() => setIsMobileFiltersOpen(false)}>
                    <div
                        className="absolute left-0 top-0 h-full w-[85%] max-w-[360px] bg-[#FFFAF4] dark:bg-[#2A2A2B] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-[#CCC] dark:border-white/10">
                            <h2 className="text-[18px] font-medium uppercase">Фильтры</h2>
                            <button
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className="p-2"
                            >
                                <X width={24} height={24} />
                            </button>
                        </div>

                        {/* Filters Content */}
                        <div className="p-4">
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
                                                setMinVal?.(min);
                                                setMaxVal?.(max);
                                            }}
                                            onCommit={({ min, max }) => {
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
                                <div className="p-4 space-y-2 text-[14px] leading-[18px] text-gray-800 dark:text-white">
                                    {categories.map((cat) => (
                                        <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedTypes.includes(cat.name.toLowerCase())}
                                                onChange={() => toggleFn('types', cat.name.toLowerCase())}
                                                className="accent-[#2A2A2B]"
                                            />
                                            {cat.name.toLowerCase()}
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
                                <div className="p-4 space-y-2 text-[14px] leading-[18px] text-gray-800 dark:text-white">
                                    {availableSizes.map((size) => (
                                        <label key={size} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedSizes.includes(size)}
                                                onChange={() => toggleFn('sizes', size)}
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
                                <div className="p-4 space-y-2 text-[14px] leading-[18px] text-gray-800 dark:text-white">
                                    {availableColors.map((color) => (
                                        <label key={color} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedColors.includes(color)}
                                                onChange={() => toggleFn('colors', color)}
                                                className="accent-[#2A2A2B]"
                                            />
                                            {color.toUpperCase()}
                                        </label>
                                    ))}
                                </div>
                            </FilterAccordion>

                            {/* Selected filters */}
                            {selectedTypes.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-[#CCC] dark:border-white/10">
                                    <p className="text-[12px] text-[#999] mb-2">ВЫБРАННЫЕ ТИПЫ:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTypes.map((type) => (
                                            <div
                                                key={type}
                                                className="flex items-center gap-1 px-2 py-1 bg-[#F4F4F4] dark:bg-white/10 rounded cursor-pointer"
                                                onClick={() => toggleFn('types', type)}
                                            >
                                                <span className="text-[12px] text-[#999] uppercase">
                                                    {type}
                                                </span>
                                                <X width={12} height={12} className="text-[#999]" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Apply button */}
                            <button
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className="w-full mt-6 py-3 bg-[#F8C6D7] text-[#2A2A2B] text-[14px] font-medium uppercase rounded-lg"
                            >
                                Применить
                            </button>

                            {/* Reset button */}
                            {filterChanges > 0 && (
                                <button
                                    onClick={() => {
                                        onReset();
                                        setIsMobileFiltersOpen(false);
                                    }}
                                    className="w-full mt-3 py-3 border border-[#CCC] dark:border-white/10 text-[#999] text-[14px] font-medium uppercase rounded-lg"
                                >
                                    Сбросить все фильтры
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
