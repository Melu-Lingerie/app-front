import {Outlet} from 'react-router-dom';
import {Header} from '../Header';
import {Footer} from '../Footer';

export const Layout = () =>
    (
        <div className="overflow-x-hidden">
            <Header/>
            <main className="pt-[50px]">
                <Outlet/>
            </main>
            <Footer/>
        </div>
    );