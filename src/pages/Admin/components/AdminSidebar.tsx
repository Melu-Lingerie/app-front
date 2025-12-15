import { NavLink } from 'react-router-dom';
import {
    Package,
    ShoppingCart,
    Users,
    Tag,
    MessageSquare,
    Menu,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
    to: string;
    icon: React.ReactNode;
    label: string;
}

const navItems: NavItem[] = [
    { to: '/admin/products', icon: <Package size={20} />, label: 'Товары' },
    { to: '/admin/orders', icon: <ShoppingCart size={20} />, label: 'Заказы' },
    { to: '/admin/customers', icon: <Users size={20} />, label: 'Клиенты' },
    { to: '/admin/promotions', icon: <Tag size={20} />, label: 'Акции и скидки' },
    { to: '/admin/reviews', icon: <MessageSquare size={20} />, label: 'Отзывы' },
];

export function AdminSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside
            className={`bg-white border-r border-gray-200 h-screen sticky top-0 transition-all duration-300 ${
                isCollapsed ? 'w-16' : 'w-64'
            }`}
        >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                {!isCollapsed && (
                    <span className="font-semibold text-lg">Админ-панель</span>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {isCollapsed ? <Menu size={20} /> : <X size={20} />}
                </button>
            </div>

            <nav className="p-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1 ${
                                isActive
                                    ? 'bg-black text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`
                        }
                    >
                        {item.icon}
                        {!isCollapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
