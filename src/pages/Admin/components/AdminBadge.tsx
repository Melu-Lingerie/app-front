type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface AdminBadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
};

export function AdminBadge({ variant = 'default', children }: AdminBadgeProps) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]}`}
        >
            {children}
        </span>
    );
}
