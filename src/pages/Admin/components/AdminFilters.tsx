import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AdminButton } from './AdminButton';

export interface FilterOption {
    value: string;
    label: string;
}

export interface FilterConfig {
    key: string;
    label: string;
    type: 'select' | 'date-range' | 'number-range' | 'checkbox';
    options?: FilterOption[];
}

interface AdminFiltersProps {
    filters: FilterConfig[];
    values: Record<string, unknown>;
    onChange: (key: string, value: unknown) => void;
    onClear: () => void;
    exportAction?: {
        label: string;
        onClick: () => void;
    };
}

export function AdminFilters({ filters, values, onChange, onClear, exportAction }: AdminFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);

    const activeFiltersCount = Object.values(values).filter(
        (v) => v !== undefined && v !== '' && v !== null
    ).length;

    return (
        <div className="relative">
            <AdminButton
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                icon={<ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
            >
                Фильтры
                {activeFiltersCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-black text-white rounded-full">
                        {activeFiltersCount}
                    </span>
                )}
            </AdminButton>

            {isOpen && (
                <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                        {filters.map((filter) => (
                            <div key={filter.key}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {filter.label}
                                </label>

                                {filter.type === 'select' && filter.options && (
                                    <div className="space-y-1">
                                        {filter.options.map((option) => (
                                            <label
                                                key={option.value}
                                                className="flex items-center gap-2 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        Array.isArray(values[filter.key])
                                                            ? (values[filter.key] as string[]).includes(option.value)
                                                            : values[filter.key] === option.value
                                                    }
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            const current = Array.isArray(values[filter.key])
                                                                ? values[filter.key] as string[]
                                                                : [];
                                                            onChange(filter.key, [...current, option.value]);
                                                        } else {
                                                            const current = Array.isArray(values[filter.key])
                                                                ? values[filter.key] as string[]
                                                                : [];
                                                            onChange(
                                                                filter.key,
                                                                current.filter((v) => v !== option.value)
                                                            );
                                                        }
                                                    }}
                                                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                                />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {option.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {filter.type === 'date-range' && (
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                        <input
                                            type="date"
                                            value={(values[`${filter.key}_from`] as string) || ''}
                                            onChange={(e) =>
                                                onChange(`${filter.key}_from`, e.target.value)
                                            }
                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                        <span className="text-gray-400 text-center">-</span>
                                        <input
                                            type="date"
                                            value={(values[`${filter.key}_to`] as string) || ''}
                                            onChange={(e) =>
                                                onChange(`${filter.key}_to`, e.target.value)
                                            }
                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                )}

                                {filter.type === 'number-range' && (
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="От"
                                            value={(values[`${filter.key}_from`] as string) || ''}
                                            onChange={(e) =>
                                                onChange(`${filter.key}_from`, e.target.value)
                                            }
                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                        />
                                        <span className="text-gray-400 text-center">-</span>
                                        <input
                                            type="number"
                                            placeholder="До"
                                            value={(values[`${filter.key}_to`] as string) || ''}
                                            onChange={(e) =>
                                                onChange(`${filter.key}_to`, e.target.value)
                                            }
                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {exportAction && (
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                            <AdminButton
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    exportAction.onClick();
                                    setIsOpen(false);
                                }}
                                className="w-full"
                            >
                                {exportAction.label}
                            </AdminButton>
                        </div>
                    )}

                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
                        <button
                            onClick={onClear}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        >
                            Сбросить
                        </button>
                        <AdminButton size="sm" onClick={() => setIsOpen(false)}>
                            Применить
                        </AdminButton>
                    </div>
                </div>
            )}
        </div>
    );
}
