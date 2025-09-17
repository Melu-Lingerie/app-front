import {createContext, useContext} from 'react';

interface NotificationsContextProps {
    addNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const NotificationsContext = createContext<NotificationsContextProps | undefined>(undefined);

export const useNotificationsContext = () => {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error('useNotificationsContext must be used within NotificationsProvider');
    }
    return context;
};
