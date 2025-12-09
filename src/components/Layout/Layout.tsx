import {Outlet} from 'react-router-dom';
import {Header} from '../Header';
import {Footer} from '../Footer';

export const Layout = () =>
    (
        <div className="overflow-x-hidden">
            <Header/>
            <main>
                <Outlet/>
            </main>
            <Footer/>
        </div>
    );