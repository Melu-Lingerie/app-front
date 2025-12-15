import { NavLink } from 'react-router-dom';
import {
    Package,
    ShoppingCart,
    Users,
    Tag,
    MessageSquare,
    Menu,
    X,
    Sun,
    Moon,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

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
    const { theme, toggleTheme } = useTheme();

    return (
        <aside
            className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0 transition-all duration-300 flex flex-col ${
                isCollapsed ? 'w-16' : 'w-64'
            }`}
        >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                {!isCollapsed && (
                    <span className="font-semibold text-lg dark:text-white">Админ-панель</span>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors dark:text-gray-300"
                >
                    {isCollapsed ? <Menu size={20} /> : <X size={20} />}
                </button>
            </div>

            <nav className="p-2 flex-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1 ${
                                isActive
                                    ? 'bg-black dark:bg-white text-white dark:text-black'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`
                        }
                    >
                        {item.icon}
                        {!isCollapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Theme Toggle */}
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={toggleTheme}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`}
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    {!isCollapsed && (
                        <span>{theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}</span>
                    )}
                </button>
            </div>
        </aside>
    );
}
