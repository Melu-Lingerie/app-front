import { Provider } from 'react-redux';
import { store } from '@/store';
import { Route, Routes } from 'react-router-dom';
import {
    Layout,
    NotFound,
    Catalog,
    ScrollRestoration,
    CookieNotice,
} from '@/components';
import { MainPage, ProductPage } from './pages';
import { CartPage } from './pages/CartPage'; // 🔥 импортируем новую страницу

function App() {
    return (
        <Provider store={store}>
            <ScrollRestoration />
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<MainPage />} />
                    <Route path="catalog" element={<Catalog />} />
                    <Route path="catalog/:id" element={<ProductPage />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
            <CookieNotice />
        </Provider>
    );
}

export default App;
