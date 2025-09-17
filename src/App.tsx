import {Route, Routes} from 'react-router-dom';
import {Layout, NotFound, Catalog, ScrollRestoration, CookieNotice} from '@/components';
import {MainPage, ProductPage} from './pages';

/**
 * App.jsx
 * -------------------------------------------------------------
 * - Основной роутинг (Layout, MainPage, Catalog, NotFound, ProductPage)
 * - Подключение компонента CookieNotice (трекинг + баннер)
 */

function App() {
    return (
        <>
            <ScrollRestoration/>
            <Routes>
                <Route path="/" element={<Layout/>}>
                    <Route index element={<MainPage/>}/>
                    <Route path="catalog" element={<Catalog/>}/>
                    <Route path="catalog/:id" element={<ProductPage/>}/>
                    <Route path="*" element={<NotFound/>}/>
                </Route>
            </Routes>

            <CookieNotice/>
        </>
    );
}

export default App;
