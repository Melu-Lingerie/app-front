import type { ReactNode } from 'react';
import {ChevronDown} from 'lucide-react';

interface FilterAccordionProps {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: ReactNode;
    rightContent?: ReactNode;
    maxHeight?: string;
}

export const FilterAccordion = ({
                                    title,
                                    isOpen,
                                    onToggle,
                                    children,
                                    rightContent,
                                    maxHeight = 'max-h-96',
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
                <ChevronDown className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} width={17} height={17} />
            </div>
        </button>
        <div
            className={`transition-all duration-300 overflow-hidden ${
                isOpen ? maxHeight : 'max-h-0'
            }`}
        >
            {children}
        </div>
    </div>
);
