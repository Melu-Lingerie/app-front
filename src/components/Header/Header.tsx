import { Link, useNavigate } from 'react-router-dom';
import SearchIcon from '@/assets/SearchIcon.svg';
import ShoppingCart from '@/assets/ShoppingCart.svg';
import MenuIcon from '@/assets/MenuIcon.svg';

// redux
import { useSelector } from 'react-redux';
import { type RootState } from '@/store';

// animation
import { motion, AnimatePresence } from 'framer-motion';

export const Header = () => {
    const textBtn = 'relative mr-4 text-sm last:mr-0';
    const iconBtn = 'relative mr-4 size-4 last:mr-0';

    const navigate = useNavigate();

    const itemsCount = useSelector((state: RootState) => state.cart.itemsCount);
    const wishlistCount = useSelector((state: RootState) => state.wishlist.itemsCount);
    const initialized = useSelector((state: RootState) => state.app.initialized);

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
                <div className="flex items-center min-w-[150px] justify-end">
                    <AnimatePresence mode="wait">
                        {!initialized ? (
                            <motion.div
                                key="skeletons"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center gap-4"
                            >
                                <div className="w-12 h-4 bg-gray-200 animate-pulse rounded" />
                                <div className="w-12 h-4 bg-gray-200 animate-pulse rounded" />
                                <div className="w-4 h-4 bg-gray-200 animate-pulse rounded-full" />
                                <div className="w-4 h-4 bg-gray-200 animate-pulse rounded-full" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="buttons"
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center"
                            >
                                {/* Wishlist */}
                                <button type="button" className={textBtn}>
                                    ИЗБРАННОЕ
                                    <AnimatePresence>
                                        {wishlistCount > 0 && (
                                            <motion.span
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute -top-2 -right-3 bg-[#F8C6D7] text-black text-xs font-semibold
                                                           rounded-full w-4 h-4 flex items-center justify-center"
                                            >
                                                {wishlistCount}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>

                                {/* Login */}
                                <button type="button" className={textBtn}>
                                    ВОЙТИ
                                </button>

                                {/* Search */}
                                <button type="button" className={iconBtn}>
                                    <img src={SearchIcon} alt="Поиск" />
                                </button>

                                {/* Cart */}
                                <button
                                    type="button"
                                    className={`${iconBtn} cursor-pointer`}
                                    onClick={() => navigate('/cart')}
                                >
                                    <img src={ShoppingCart} alt="Корзина" />
                                    <AnimatePresence>
                                        {itemsCount > 0 && (
                                            <motion.span
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute -top-2 -right-2 bg-[#F8C6D7] text-black text-xs font-semibold
                                                           rounded-full w-4 h-4 flex items-center justify-center"
                                            >
                                                {itemsCount}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Divider */}
            <div className="w-screen h-px bg-[#CCC]" />
        </>
    );
};
