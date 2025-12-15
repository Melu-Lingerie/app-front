import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AdminPagination } from './AdminPagination';

export interface Column<T> {
    key: string;
    title: string;
    sortable?: boolean;
    width?: string;
    render?: (item: T, index: number) => React.ReactNode;
}

export interface PaginationConfig {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
}

interface AdminTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (item: T) => void;
    selectable?: boolean;
    selectedIds?: Set<string | number>;
    onSelectionChange?: (ids: Set<string | number>) => void;
    getRowId: (item: T) => string | number;
    loading?: boolean;
    pagination?: PaginationConfig;
}

export function AdminTable<T>({
    columns,
    data,
    onRowClick,
    selectable = false,
    selectedIds = new Set(),
    onSelectionChange,
    getRowId,
    loading = false,
    pagination,
}: AdminTableProps<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const handleSelectAll = () => {
        if (!onSelectionChange) return;
        if (selectedIds.size === data.length) {
            onSelectionChange(new Set());
        } else {
            onSelectionChange(new Set(data.map(getRowId)));
        }
    };

    const handleSelectRow = (id: string | number) => {
        if (!onSelectionChange) return;
        const newSelection = new Set(selectedIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        onSelectionChange(newSelection);
    };

    const isAllSelected = data.length > 0 && selectedIds.size === data.length;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            {selectable && (
                                <th className="w-12 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                    />
                                </th>
                            )}
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 ${
                                        column.sortable ? 'cursor-pointer select-none' : ''
                                    }`}
                                    style={{ width: column.width }}
                                    onClick={() =>
                                        column.sortable && handleSort(column.key)
                                    }
                                >
                                    <div className="flex items-center gap-1">
                                        {column.title}
                                        {column.sortable && sortKey === column.key && (
                                            sortDirection === 'asc' ? (
                                                <ChevronUp size={14} />
                                            ) : (
                                                <ChevronDown size={14} />
                                            )
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (selectable ? 1 : 0)}
                                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                                >
                                    Загрузка...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (selectable ? 1 : 0)}
                                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                                >
                                    Нет данных
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => {
                                const rowId = getRowId(item);
                                const isSelected = selectedIds.has(rowId);
                                return (
                                    <tr
                                        key={rowId}
                                        className={`border-b border-gray-100 dark:border-gray-700 transition-colors ${
                                            isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        } ${onRowClick ? 'cursor-pointer' : ''}`}
                                        onClick={() => onRowClick?.(item)}
                                    >
                                        {selectable && (
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectRow(rowId);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                                />
                                            </td>
                                        )}
                                        {columns.map((column) => (
                                            <td
                                                key={column.key}
                                                className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                                            >
                                                {column.render
                                                    ? column.render(item, index)
                                                    : String((item as Record<string, unknown>)[column.key] ?? '')}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <AdminPagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    itemsPerPage={pagination.itemsPerPage}
                    onPageChange={pagination.onPageChange}
                    onItemsPerPageChange={pagination.onItemsPerPageChange}
                />
            )}
        </div>
    );
}
