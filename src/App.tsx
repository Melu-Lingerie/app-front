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
    ErrorBoundary,
} from '@/components';
import {
    AccountPage,
    CartPage,
    MainPage,
    ProductPage,
    CustomersPage,
    GiftCertificatePage,
    AboutPage,
    ContactsPage,
    CheckoutPage,
    BackstagePage,
    // Admin
    AdminLayout,
    ProductsListPage,
    ProductFormPage,
    OrdersListPage,
    OrderDetailPage,
    CustomersListPage,
    CustomerDetailPage,
    PromotionsListPage,
    PromotionFormPage,
    ReviewsListPage,
    BannersListPage,
    BannerFormPage,
    BackstagesListPage,
    BackstageFormPage,
    MediaListPage,
} from '@/pages';

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
            // По умолчанию светлая тема (если нет сохранённой или явно 'light')
            root.classList.remove('dark');
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
            <ErrorBoundary>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<MainPage />} />
                    <Route path="catalog" element={<Catalog />} />
                    <Route path="catalog/:id" element={<ProductPage />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="account/*" element={<AccountPage />} />
                    <Route path="customers/*" element={<CustomersPage />} />
                    <Route path="gift-certificate" element={<GiftCertificatePage />} />
                    <Route path="backstage" element={<BackstagePage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="contacts" element={<ContactsPage />} />
                    <Route path="*" element={<NotFound />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<ProductsListPage />} />
                    <Route path="products" element={<ProductsListPage />} />
                    <Route path="products/new" element={<ProductFormPage />} />
                    <Route path="products/:id/edit" element={<ProductFormPage />} />
                    <Route path="orders" element={<OrdersListPage />} />
                    <Route path="orders/:id" element={<OrderDetailPage />} />
                    <Route path="customers" element={<CustomersListPage />} />
                    <Route path="customers/:id" element={<CustomerDetailPage />} />
                    <Route path="promotions" element={<PromotionsListPage />} />
                    <Route path="promotions/new" element={<PromotionFormPage />} />
                    <Route path="promotions/:id/edit" element={<PromotionFormPage />} />
                    <Route path="banners" element={<BannersListPage />} />
                    <Route path="banners/new" element={<BannerFormPage />} />
                    <Route path="banners/:id/edit" element={<BannerFormPage />} />
                    <Route path="backstages" element={<BackstagesListPage />} />
                    <Route path="backstages/new" element={<BackstageFormPage />} />
                    <Route path="backstages/:id/edit" element={<BackstageFormPage />} />
                    <Route path="media" element={<MediaListPage />} />
                    <Route path="reviews" element={<ReviewsListPage />} />
                </Route>
            </Routes>
            </ErrorBoundary>
            {/* CookieNotice отвечает за guest-запрос и initApp */}
            <CookieNotice />
        </Provider>
    );
}

export default App;
