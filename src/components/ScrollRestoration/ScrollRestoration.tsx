import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

const scrollPositions = new Map<string, number>();

export const ScrollRestoration = () => {
    const {pathname, key} = useLocation();

    useEffect(() => {
        // восстанавливаем скролл, если был сохранён
        const savedPosition = scrollPositions.get(key || pathname);
        if (savedPosition !== undefined) {
            window.scrollTo(0, savedPosition);
        } else {
            window.scrollTo(0, 0); // новый маршрут — скролл наверх
        }

        const handleScroll = () => {
            scrollPositions.set(key || pathname, window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [pathname, key]);

    return null;
};
