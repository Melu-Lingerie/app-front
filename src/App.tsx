import { Provider } from 'react-redux';
import { store } from '@/store';
import { Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import {
    Layout,
    NotFound,
    Catalog,
    ScrollRestoration,
    CookieNotice,
} from '@/components';
import {AccountPage, CartPage, MainPage, ProductPage, CustomersPage} from '@/pages';

function App() {
    useEffect(() => {
        const root = document.documentElement;
        const mql = window.matchMedia('(prefers-color-scheme: dark)');

        const applySystem = () => {
            if (mql.matches) root.classList.add('dark');
            else root.classList.remove('dark');
        };

        const applyStored = () => {
            const stored = localStorage.getItem('theme');
            if (stored === 'dark') {
                root.classList.add('dark');
                return;
            }
            if (stored === 'light') {
                root.classList.remove('dark');
                return;
            }
            // default / system
            applySystem();
        };

        applyStored();

        const onChange = () => {
            const stored = localStorage.getItem('theme');
            if (!stored || stored === 'system') {
                applySystem();
            }
        };

        if ('addEventListener' in mql) {
            mql.addEventListener('change', onChange);
        } else {
            // @ts-ignore
            mql.addListener(onChange);
        }

        const onStorage = (e: StorageEvent) => {
            if (e.key === 'theme') applyStored();
        };
        window.addEventListener('storage', onStorage);

        return () => {
            if ('removeEventListener' in mql) {
                mql.removeEventListener('change', onChange);
            } else {
                // @ts-ignore
                mql.removeListener(onChange);
            }
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    return (
        <Provider store={store}>
            <ScrollRestoration />
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<MainPage />} />
                    <Route path="catalog" element={<Catalog />} />
                    <Route path="catalog/:id" element={<ProductPage />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="account/*" element={<AccountPage />} />
                    <Route path="customers/*" element={<CustomersPage />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
            {/* ✅ CookieNotice отвечает за guest-запрос и initApp */}
            <CookieNotice />
        </Provider>
    );
}

export default App;
