import {AnimatePresence} from 'framer-motion';
import {NotificationBar} from './NotificationBar.tsx';

export interface Notification {
    id: string;
    message: string;
    type?: 'success' | 'error' | 'info';
}

interface NotificationsContainerProps {
    notifications: Notification[];
    removeNotification: (id: string) => void;
}

export const NotificationsContainer = ({notifications, removeNotification}: NotificationsContainerProps) => {
    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-3 z-50">
            <AnimatePresence>
                {notifications.map((n) => (
                    <NotificationBar
                        key={n.id}
                        id={n.id}
                        message={n.message}
                        type={n.type}
                        onClose={removeNotification}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};
