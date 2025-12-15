import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { ThemeProvider } from '../context/ThemeContext';

export function AdminLayout() {
    return (
        <ThemeProvider>
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                <AdminSidebar />
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </ThemeProvider>
    );
}
