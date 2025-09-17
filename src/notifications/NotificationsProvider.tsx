import {type ReactNode, useState, useCallback} from 'react';
import {NotificationsContainer, type Notification} from './NotificationsContainer';
import {NotificationsContext} from './notificationsContext';

export const NotificationsProvider = ({children}: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const addNotification = useCallback(
        (message: string, type: 'success' | 'error' | 'info' = 'info') => {
            const id = Date.now().toString();
            const newNotification: Notification = {id, message, type};

            setNotifications((prev) => [...prev, newNotification]);

            // таймер только для этого уведомления
            setTimeout(() => {
                removeNotification(id);
            }, 5000);
        },
        [removeNotification]
    );

    return (
        <NotificationsContext.Provider value={{addNotification}}>
            {children}
            <NotificationsContainer
                notifications={notifications}
                removeNotification={removeNotification}
            />
        </NotificationsContext.Provider>
    );
};
