import ArrowCarouselLeft from '@/assets/ArrowCarouselLeft.svg';
import ArrowCarouselRight from '@/assets/ArrowCarouselRight.svg';

type Props = {
    direction: 'left' | 'right';
    onClick: () => void;
    disabled?: boolean;
};

export const CarouselButton = ({
                                   direction,
                                   onClick,
                                   disabled = false,
                               }: Props) => {
    const isLeft = direction === 'left';

    return (
        <button
            type="button"
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            className={`flex top-1/2 justify-center items-center absolute w-[46px] h-[46px] rounded-full 
        bg-[rgba(217,217,217,0.4)] backdrop-blur-[20px] -translate-y-1/2
        ${isLeft ? 'left-[-23px]' : 'right-[-23px]'}
        transition-opacity duration-300
        ${disabled ? 'opacity-0 cursor-not-allowed' : 'opacity-100 hover:bg-[rgba(217,217,217,0.6)]'}
      `}
        >
            <img
                className="w-[27px] h-[27px]"
                src={isLeft ? ArrowCarouselLeft : ArrowCarouselRight}
                alt={isLeft ? 'Предыдущая' : 'Следующая'}
            />
        </button>
    );
};
