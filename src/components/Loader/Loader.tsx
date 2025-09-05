import styles from './Loader.module.css';

export const Loader = () => {
    return (
        <div className={styles.loaderWrapper}>
            <div className={styles.spinner}></div>
            <p style={{ marginTop: '10px' }}>Загрузка...</p>
        </div>
    );
};