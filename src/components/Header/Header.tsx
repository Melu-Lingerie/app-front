import clsx from 'clsx';
import SearchIcon from '@/assets/SearchIcon.svg';
import ShoppingCart from '@/assets/ShoppingCart.svg';
import MenuIcon from '@/assets/MenuIcon.svg';
import styles from './Header.module.css';
import {Link} from 'react-router-dom';

export const Header = () => {
    return (
        <div className={styles.header}>
            <div className={styles.flexible}>
                <button type="button" className={clsx(styles.button, styles.buttonIcon)}>
                    <img src={MenuIcon} alt="Меню" />
                </button>
                <button type="button" className={clsx(styles.button, styles.buttonText)}>MIX’N’MATCH</button>
                <button type="button" className={clsx(styles.button, styles.buttonText)}>SECRET BOX</button>
            </div>
            <div className={styles.heading}>
                <Link to="/">
                    <p className={styles.heading__text}>MELU LINGERIE</p>
                </Link>
            </div>
            <div className={styles.flexible}>
                <button type="button" className={clsx(styles.button, styles.buttonText)}>ИЗБРАННОЕ</button>
                <button type="button" className={clsx(styles.button, styles.buttonText)}>ВОЙТИ</button>
                <button type="button" className={clsx(styles.button, styles.buttonIcon)}>
                    <img src={SearchIcon} alt='Поиск' />
                </button>
                <button type="button" className={clsx(styles.button, styles.buttonIcon)}>
                    <img src={ShoppingCart} alt='Корзина' />
                </button>
            </div>
        </div>
    );
};