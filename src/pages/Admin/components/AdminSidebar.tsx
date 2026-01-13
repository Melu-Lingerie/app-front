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
    Image,
} from 'lucide-react';
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
    { to: '/admin/banners', icon: <Image size={20} />, label: 'Баннеры' },
    { to: '/admin/reviews', icon: <MessageSquare size={20} />, label: 'Отзывы' },
];

export function AdminSidebar() {
    const { theme, toggleTheme, sidebarCollapsed, toggleSidebar } = useTheme();

    return (
        <aside
            className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0 transition-all duration-300 flex flex-col ${
                sidebarCollapsed ? 'w-16' : 'w-64'
            }`}
        >
            <div className={`flex items-center p-4 border-b border-gray-200 dark:border-gray-700 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!sidebarCollapsed && (
                    <span className="font-semibold text-lg dark:text-white whitespace-nowrap overflow-hidden">Админ-панель</span>
                )}
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors dark:text-gray-300 flex-shrink-0"
                >
                    {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
                </button>
            </div>

            <nav className="p-2 flex-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center px-3 py-2.5 rounded-lg transition-colors mb-1 overflow-hidden ${
                                isActive
                                    ? 'bg-black dark:bg-white text-white dark:text-black'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            } ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`
                        }
                    >
                        <span className="flex-shrink-0">{item.icon}</span>
                        {!sidebarCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Theme Toggle */}
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={toggleTheme}
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-colors w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 overflow-hidden ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
                >
                    <span className="flex-shrink-0">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </span>
                    {!sidebarCollapsed && (
                        <span className="whitespace-nowrap">
                            {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
                        </span>
                    )}
                </button>
            </div>
        </aside>
    );
}
