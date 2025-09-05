import {type CSSProperties, type RefObject} from 'react';
import clsx from 'clsx';
import ArrowRightSmallIcon from '@/assets/ArrowRightSmallIcon.svg';
import styles from './Card.module.css';

type Props = {
    card: {
        image: string,
        name: string
        isNew: boolean,
        price: string,
        colors: string[],
        isAddToCart: boolean
    },
    widthStyle: CSSProperties,
    imageRef?: RefObject<HTMLDivElement | null>
}

export const Card = ({
   card: {
      image,
      name,
      isNew,
      price,
      colors,
      isAddToCart
   },
    widthStyle,
    imageRef
}: Props) => {
    return (
        <div style={widthStyle}>
            <div className={styles.imageBlock} ref={imageRef}>
                <img className={styles.image} src={image} alt="Фото товара"/>
            </div>
            <div className={styles.cardInfo}>
                <div className={clsx(styles.cardInfo__element, styles.cardInfo__element__titleBlock)}>
                    <p className={styles.cardInfo__element__titleBlock}>{name.toUpperCase()}</p>
                    {isNew && <p className={styles.new}>NEW</p>}
                </div>
                <p className={clsx(styles.cardInfo__element, styles.cardInfo__element__titleBlock)}>{price}</p>
                <div className={styles.colors}>
                    {colors.map((color, index) => <div key={index} className={styles.color} style={{backgroundColor: color}}/>)}
                </div>
            </div>
            <button style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: 56,
                fontSize: 14,
                border: isAddToCart ? '1px solid #E6E6E6' : '1px solid #141414',
                backgroundColor: isAddToCart ? '#F8C6D7' : 'white',
                marginRight: isAddToCart ? 4 : 0
            }}>
                {isAddToCart ? 'ПЕРЕЙТИ В КОРЗИНУ' : 'ДОБАВИТЬ В КОРЗИНУ'}
                {isAddToCart && <img src={ArrowRightSmallIcon} alt={'Переход в корзину'}/>}
            </button>
        </div>
    );
};