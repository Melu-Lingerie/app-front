import {type Dispatch, type SetStateAction, useEffect, useRef, useState} from 'react';
import Filter from '@/assets/Filter.svg';
import ArrowDown from '@/assets/ArrowDown.svg';
import CloseIcon from '@/assets/CloseIcon.svg';

interface FilterTopBarProps {
    filterChanges: number;
    onReset: () => void;
    selectedTypes: string[];
    toggleFn: (key: 'types' | 'sizes' | 'colors', value: string) => void;

    // новые пропсы для Select
    options: ('Все' | 'Новинки' | 'Скоро в продаже')[];
    selectedOption: 'Все' | 'Новинки' | 'Скоро в продаже';
    onSelectChange: Dispatch<SetStateAction<'Все' | 'Новинки' | 'Скоро в продаже'>>;
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
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSelect = (option: 'Все' | 'Новинки' | 'Скоро в продаже') => {
        onSelectChange(option); // уведомляем родителя
        setIsOpen(false);
    };

    // закрытие по клику вне
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="grid grid-cols-4 border border-[#CCC] relative w-screen left-[calc((100%-100vw)/2)] h-[58px]">
            {/* Колонка 1 — фильтры */}
            <div className="col-span-1 flex items-center px-10">
                <img className="w-[14px] h-[14px] mr-10" src={Filter} alt="Filter" />
                <p className="text-[14px] leading-[18px] mr-5">
                    {`ФИЛЬТРЫ${filterChanges > 0 ? ` (${filterChanges})` : ''}`}
                </p>
                {filterChanges > 0 && (
                    <p
                        onClick={onReset}
                        className="text-[14px] leading-[18px] mr-5 text-[#F892B5] cursor-pointer"
                    >
                        СБРОСИТЬ ВСЕ
                    </p>
                )}
            </div>

            {/* Колонка 2 — Select */}
            <div className="col-span-1 relative flex items-center gap-[10px] px-5">
                <div ref={dropdownRef} className="relative">
                    {/* кнопка селекта */}
                    <div
                        className="flex items-center gap-[6px] cursor-pointer select-none"
                        onClick={() => setIsOpen((prev) => !prev)}
                        aria-expanded={isOpen}
                        role="button"
                        tabIndex={0}
                    >
                        <p className="text-[14px] leading-[18px] uppercase">{selectedOption}</p>
                        <img
                            src={ArrowDown}
                            alt="Открыть список"
                            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </div>

                    {/* выпадающий список */}
                    {isOpen && (
                        <div
                            className="absolute top-full left-0 mt-2 w-[200px] bg-white border border-[#CCC] shadow-md rounded-md z-10 max-h-[200px] overflow-y-auto"
                            role="listbox"
                        >
                            {options.map((option) => (
                                <div
                                    key={option}
                                    onClick={() => handleSelect(option)}
                                    role="option"
                                    aria-selected={selectedOption === option}
                                    className={`px-4 py-2 text-[14px] leading-[18px] uppercase cursor-pointer hover:bg-gray-100 ${
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

            {/* Колонка 4 — выбранные фильтры-чипсы */}
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
