import { useNotificationsContext } from '@/notifications/notificationsContext';

export const useNotifications = () => {
    const { addNotification } = useNotificationsContext();
    return { addNotification };
};
