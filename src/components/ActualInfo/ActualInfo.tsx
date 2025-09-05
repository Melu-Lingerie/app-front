import clsx from 'clsx';
import styles from './ActualInfo.module.css';

export const ActualInfo = () => {
    return (
        <div className={styles.imageBlock}>
            <p className={styles.imageBlock__element}>Актуальное</p>
            <p className={clsx(styles.imageBlock__element, styles.imageBlock__element__heading)}>НОВАЯ КОЛЛЕКЦИЯ</p>
            <div className={clsx(styles.divider, styles.imageBlock__element)} />
            <p className={styles.imageBlock__element}>СМОТРЕТЬ</p>
        </div>
    );
};