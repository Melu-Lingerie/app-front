import type { ReactNode } from 'react';
import ArrowDown from '@/assets/ArrowDown.svg';

interface FilterAccordionProps {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: ReactNode;
    rightContent?: ReactNode;
}

export const FilterAccordion = ({
                                    title,
                                    isOpen,
                                    onToggle,
                                    children,
                                    rightContent,
                                }: FilterAccordionProps) => (
    <div className="w-full mx-auto py-4">
        <button
            type="button"
            onClick={onToggle}
            className="w-full flex justify-between items-center text-left text-[14px] leading-[18px] uppercase cursor-pointer"
        >
            <span>{title}</span>
            <div className="flex items-center">
                {rightContent}
                <img
                    className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                    src={ArrowDown}
                    alt="Стрелка"
                />
            </div>
        </button>
        <div
            className={`transition-all duration-300 overflow-hidden ${
                isOpen ? 'max-h-96' : 'max-h-0'
            }`}
        >
            {children}
        </div>
    </div>
);
