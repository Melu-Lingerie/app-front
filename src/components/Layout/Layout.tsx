import {Outlet} from 'react-router-dom';
import {Header} from '../Header';
import {Footer} from '../Footer';
import {FloatingScrollbar} from '../FloatingScrollbar/FloatingScrollbar';

export const Layout = () =>
    (
        <div className="overflow-x-clip">
            <Header/>
            <main className="pt-[50px]">
                <Outlet/>
            </main>
            <Footer/>
            <FloatingScrollbar/>
        </div>
    );