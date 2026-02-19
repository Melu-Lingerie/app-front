import { Navigate, Outlet } from 'react-router-dom';
import { Menu, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '@/store/userSlice';
import { selectAppInitialized } from '@/store/appSlice';
import { AdminSidebar } from './AdminSidebar';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function AdminLayoutContent() {
    const { mobileMenuOpen, setMobileMenuOpen, toggleMobileMenu } = useTheme();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const initialized = useSelector(selectAppInitialized);

    if (!initialized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!isAuthenticated || user.role !== 'ADMIN') {
        return <Navigate to="/melu-admin-secret/login" replace />;
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Mobile menu backdrop */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile menu button */}
            <button
                onClick={toggleMobileMenu}
                className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 lg:hidden"
                aria-label="Toggle menu"
            >
                <Menu size={24} className="text-gray-700 dark:text-gray-300" />
            </button>

            <AdminSidebar />

            <main className="flex-1 p-4 pt-16 lg:pt-6 lg:p-6 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}

export function AdminLayout() {
    return (
        <ThemeProvider>
            <AdminLayoutContent />
        </ThemeProvider>
    );
}
