import { useEffect, useRef, useState } from 'react';
import CloseIcon from '@/assets/CloseIcon.svg';
import type {SortOption} from '@/pages/Catalog/constants';
import {ChevronDown, SlidersHorizontal} from 'lucide-react';

interface FilterTopBarProps {
    filterChanges: number;
    onReset: () => void;
    selectedTypes: string[];
    toggleFn: (key: 'types' | 'sizes' | 'colors', value: string) => void;
    options: SortOption[];
    selectedOption: SortOption;
    onSelectChange: (val: SortOption) => void;
}

export const FilterTopBar = ({
                                 filterChanges,
                                 onReset,
                                 selectedTypes,
                                 toggleFn,
                                 options,
                                 selectedOption,
                                 onSelectChange,
                             }: FilterTopBarProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
        <div
            className={`
                sticky top-0 z-50
                grid grid-cols-4
                border-b border-t border-[#CCC] dark:border-white/10
                relative w-screen left-[calc((100%-100vw)/2)]
                h-[58px]
                transition-shadow duration-300
                ${isSticky ? 'shadow-md' : 'shadow-none'}
            `}
        >
            {/* Колонка 1 — фильтры */}
            <div className="col-span-1 flex items-center px-10">
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

            {/* Колонка 2 — Select */}
            <div className="col-span-1 relative flex items-center gap-[10px] px-5">
                <div ref={dropdownRef} className="relative">
                    <div
                        className="flex items-center gap-[6px] cursor-pointer select-none"
                        onClick={() => setIsOpen((prev) => !prev)}
                        aria-expanded={isOpen}
                        role="button"
                        tabIndex={0}
                    >
                        <p className="text-[14px] leading-[18px] uppercase">{selectedOption}</p>
                        <button className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                            <ChevronDown width={17} height={17} />
                        </button>
                    </div>

                    {isOpen && (
                        <div
                            className="absolute top-full left-0 mt-2 w-[200px] bg-white dark:bg-[#2A2A2B] border border-[#CCC] dark:border-white/10 shadow-md rounded-md z-10 max-h-[200px] overflow-y-auto"
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

            {/* Колонка 3 — пустая */}
            <div className="col-span-1" />

            {/* Колонка 4 — выбранные фильтры */}
            <div className="col-span-1 flex items-center gap-5 px-5 justify-end">
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
    );
};
