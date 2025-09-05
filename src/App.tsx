import {Route, Routes } from 'react-router-dom';
import {MainPage, Layout, NotFound, Catalog} from './components';

function App() {

    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<MainPage />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/catalog" element={<Catalog />} />
            </Route>
        </Routes>
    );
}

export default App;
