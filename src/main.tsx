import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import {NotificationsProvider} from '@/notifications/NotificationsProvider.tsx';
import './App.css';
import '@fontsource/montserrat';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <NotificationsProvider>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </NotificationsProvider>
    // </StrictMode>
);
