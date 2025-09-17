import {Link} from 'react-router-dom';
import SearchIcon from '@/assets/SearchIcon.svg';
import ShoppingCart from '@/assets/ShoppingCart.svg';
import MenuIcon from '@/assets/MenuIcon.svg';

export const Header = () => {
    const textBtn = 'mr-4 text-sm last:mr-0';
    const iconBtn = 'mr-4 size-4 last:mr-0';

    return (
        <>
            <div className="relative flex items-center justify-between h-[49px] px-10">
                {/* Левая часть */}
                <div className="flex items-center">
                    <button type="button" className={iconBtn}>
                        <img src={MenuIcon} alt="Меню" />
                    </button>
                    <button type="button" className={textBtn}>
                        MIX’N’MATCH
                    </button>
                    <button type="button" className={textBtn}>
                        SECRET BOX
                    </button>
                </div>

                {/* Заголовок */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Link to="/">
                        <p className="m-0 text-[24px] font-semibold">MELU LINGERIE</p>
                    </Link>
                </div>

                {/* Правая часть */}
                <div className="flex items-center">
                    <button type="button" className={textBtn}>
                        ИЗБРАННОЕ
                    </button>
                    <button type="button" className={textBtn}>
                        ВОЙТИ
                    </button>
                    <button type="button" className={iconBtn}>
                        <img src={SearchIcon} alt="Поиск" />
                    </button>
                    <button type="button" className={iconBtn}>
                        <img src={ShoppingCart} alt="Корзина" />
                    </button>
                </div>
            </div>

            {/* Divider на всю ширину */}
            <div className="w-screen h-px bg-[#CCC]"></div>
        </>
    );
};
