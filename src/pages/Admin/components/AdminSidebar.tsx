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
    Film,
    HardDrive,
    Heart,
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
    { to: '/admin/backstages', icon: <Film size={20} />, label: 'Бэкстейдж' },
    { to: '/admin/media', icon: <HardDrive size={20} />, label: 'Медиа' },
    { to: '/admin/reviews', icon: <MessageSquare size={20} />, label: 'Отзывы' },
    { to: '/admin/loyalty', icon: <Heart size={20} />, label: 'Лояльность' },
];

export function AdminSidebar() {
    const { theme, toggleTheme, sidebarCollapsed, toggleSidebar, mobileMenuOpen, setMobileMenuOpen } = useTheme();

    const handleNavClick = () => {
        // Close mobile menu when navigating (if it's open, we're on mobile)
        if (mobileMenuOpen) {
            setMobileMenuOpen(false);
        }
    };

    return (
        <aside
            className={`
                bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
                h-screen transition-all duration-300 flex flex-col
                fixed lg:sticky top-0 z-50
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${sidebarCollapsed ? 'w-64 lg:w-16' : 'w-64'}
            `}
        >
            <div className={`flex items-center p-4 border-b border-gray-200 dark:border-gray-700 ${sidebarCollapsed ? 'lg:justify-center' : 'justify-between'}`}>
                <span className={`font-semibold text-lg dark:text-white whitespace-nowrap overflow-hidden ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                    Админ-панель
                </span>
                {/* Desktop collapse button */}
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors dark:text-gray-300 flex-shrink-0 hidden lg:block"
                >
                    {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
                </button>
                {/* Mobile close button */}
                <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors dark:text-gray-300 flex-shrink-0 lg:hidden"
                >
                    <X size={20} />
                </button>
            </div>

            <nav className="p-2 flex-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                            `flex items-center px-3 py-2.5 rounded-lg transition-colors mb-1 overflow-hidden ${
                                isActive
                                    ? 'bg-black dark:bg-white text-white dark:text-black'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            } ${sidebarCollapsed ? 'lg:justify-center' : 'gap-3'}`
                        }
                    >
                        <span className="flex-shrink-0">{item.icon}</span>
                        <span className={`whitespace-nowrap ${sidebarCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Theme Toggle */}
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={toggleTheme}
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-colors w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 overflow-hidden ${sidebarCollapsed ? 'lg:justify-center' : 'gap-3'}`}
                >
                    <span className="flex-shrink-0">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </span>
                    <span className={`whitespace-nowrap ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                        {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
                    </span>
                </button>
            </div>
        </aside>
    );
}
