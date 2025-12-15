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
                icon={<ChevronDown size={16} className={isOpen ? 'rotate-180' : ''} />}
            >
                Фильтры
                {activeFiltersCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-black text-white rounded-full">
                        {activeFiltersCount}
                    </span>
                )}
            </AdminButton>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 space-y-4">
                        {filters.map((filter) => (
                            <div key={filter.key}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                                    className="w-4 h-4 rounded border-gray-300"
                                                />
                                                <span className="text-sm text-gray-600">
                                                    {option.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {filter.type === 'date-range' && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="date"
                                            value={(values[`${filter.key}_from`] as string) || ''}
                                            onChange={(e) =>
                                                onChange(`${filter.key}_from`, e.target.value)
                                            }
                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                            type="date"
                                            value={(values[`${filter.key}_to`] as string) || ''}
                                            onChange={(e) =>
                                                onChange(`${filter.key}_to`, e.target.value)
                                            }
                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                )}

                                {filter.type === 'number-range' && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="От"
                                            value={(values[`${filter.key}_from`] as string) || ''}
                                            onChange={(e) =>
                                                onChange(`${filter.key}_from`, e.target.value)
                                            }
                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                            type="number"
                                            placeholder="До"
                                            value={(values[`${filter.key}_to`] as string) || ''}
                                            onChange={(e) =>
                                                onChange(`${filter.key}_to`, e.target.value)
                                            }
                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {exportAction && (
                        <div className="px-4 py-3 border-t border-gray-200">
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

                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                        <button
                            onClick={onClear}
                            className="text-sm text-gray-600 hover:text-gray-900"
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
