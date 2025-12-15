import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

interface AdminTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const AdminTextarea = forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={`
                        w-full px-4 py-3 text-sm
                        border border-gray-300 rounded-lg
                        bg-white text-gray-900
                        placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black
                        disabled:bg-gray-50 disabled:text-gray-500
                        resize-none
                        ${error ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500' : ''}
                        ${className}
                    `}
                    {...props}
                />
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);

AdminTextarea.displayName = 'AdminTextarea';
