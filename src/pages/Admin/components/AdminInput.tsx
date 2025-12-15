import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';

interface AdminInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    showSearchIcon?: boolean;
}

export const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(
    ({ label, error, icon, showSearchIcon, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {(icon || showSearchIcon) && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                            {icon || <Search size={18} />}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
                            w-full px-4 py-2.5 text-sm
                            border border-gray-300 dark:border-gray-600 rounded-lg
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                            placeholder:text-gray-400 dark:placeholder:text-gray-500
                            focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-black dark:focus:border-white
                            disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 dark:disabled:text-gray-600
                            ${(icon || showSearchIcon) ? 'pl-10' : ''}
                            ${error ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500' : ''}
                            ${className}
                        `}
                        {...props}
                    />
                </div>
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);

AdminInput.displayName = 'AdminInput';
