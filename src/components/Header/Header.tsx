import { Link, useNavigate } from 'react-router-dom';
import SearchIcon from '@/assets/SearchIcon.svg';
import ShoppingCart from '@/assets/ShoppingCart.svg';
import MenuIcon from '@/assets/MenuIcon.svg';

// redux
import { useSelector } from 'react-redux';
import { type RootState } from '@/store';

export const Header = () => {
    const textBtn = 'relative mr-4 text-sm last:mr-0';
    const iconBtn = 'relative mr-4 size-4 last:mr-0';

    const navigate = useNavigate();

    // ✅ теперь берём сразу из redux
    const itemsCount = useSelector((state: RootState) => state.cart.itemsCount);
    const wishlistCount = useSelector((state: RootState) => state.wishlist.itemsCount);

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
                    <button
                        type="button"
                        className={textBtn}
                    >
                        ИЗБРАННОЕ
                        {wishlistCount > 0 && (
                            <span
                                className="absolute -top-2 -right-3 bg-[#F8C6D7] text-black text-xs font-semibold
                                           rounded-full w-4 h-4 flex items-center justify-center"
                            >
                                {wishlistCount}
                            </span>
                        )}
                    </button>
                    <button type="button" className={textBtn}>
                        ВОЙТИ
                    </button>
                    <button type="button" className={iconBtn}>
                        <img src={SearchIcon} alt="Поиск" />
                    </button>

                    {/* Корзина */}
                    <button
                        type="button"
                        className={`${iconBtn} cursor-pointer`}
                        onClick={() => navigate('/cart')}
                    >
                        <img src={ShoppingCart} alt="Корзина" />
                        {itemsCount > 0 && (
                            <span
                                className="absolute -top-2 -right-2 bg-[#F8C6D7] text-black text-xs font-semibold
                                           rounded-full w-4 h-4 flex items-center justify-center"
                            >
                                {itemsCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Divider на всю ширину */}
            <div className="w-screen h-px bg-[#CCC]" />
        </>
    );
};
