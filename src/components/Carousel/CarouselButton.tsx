import ArrowCarouselLeft from '@/assets/ArrowCarouselLeft.svg';
import ArrowCarouselRight from '@/assets/ArrowCarouselRight.svg';

type Props = {
    direction: 'left' | 'right';
    onClick: () => void;
    top: number;
}

export const CarouselButton = ({
                                   direction,
                                   onClick,
                                   top,
                               }: Props) => {
    const isLeft = direction === 'left';
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex justify-center items-center absolute w-[46px] h-[46px] rounded-full bg-[rgba(217,217,217,0.4)] backdrop-blur-[20px] -translate-y-1/2 ${
                isLeft ? 'left-[-23px]' : 'right-[-23px]'
            }`}
            style={{top}}
        >
            <img
                className="w-[27px] h-[27px]"
                src={isLeft ? ArrowCarouselLeft : ArrowCarouselRight}
                alt={isLeft ? 'Предыдущая' : 'Следующая'}
            />
        </button>
    );
};