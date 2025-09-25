import React from 'react';

type RatingStarsProps = {
    value?: number; // рейтинг (0–5), может быть undefined
    max?: number;
    color?: string;
};

export const RatingStars: React.FC<RatingStarsProps> = ({
                                                            value = 0,
                                                            max = 5,
                                                            color = '#F8C6D7',
                                                        }) => {
    const size = 12; // фиксированный размер

    return (
        <div className="flex items-center">
            {Array.from({ length: max }, (_, i) => {
                const starValue = i + 1;
                const fill =
                    value >= starValue
                        ? 100
                        : value + 1 > starValue
                            ? (value - i) * 100
                            : 0;

                return (
                    <div
                        key={i}
                        className="relative"
                        style={{ width: size, height: size }}
                    >
                        {/* Пустая звезда */}
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={color}
                            strokeWidth="2"
                            style={{
                                width: size,
                                height: size,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                            }}
                        >
                            <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.868 1.48 8.282L12 18.896l-7.416 4.56 1.48-8.282L0 9.306l8.332-1.151z" />
                        </svg>

                        {/* Закрашенная часть */}
                        <svg
                            viewBox="0 0 24 24"
                            fill={color}
                            style={{
                                width: size,
                                height: size,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                clipPath: `inset(0 ${100 - fill}% 0 0)`,
                            }}
                        >
                            <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.868 1.48 8.282L12 18.896l-7.416 4.56 1.48-8.282L0 9.306l8.332-1.151z" />
                        </svg>
                    </div>
                );
            })}

            {/* цифра рейтинга */}
            <span
                className="ml-2 text-[#999]"
                style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    lineHeight: '18px',
                }}
            >
        {value.toFixed(1)}
      </span>
        </div>
    );
};
