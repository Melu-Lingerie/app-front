interface AdminHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, actions }: AdminHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
                )}
            </div>
            {actions && <div className="flex items-center gap-2 sm:gap-3 flex-wrap">{actions}</div>}
        </div>
    );
}
