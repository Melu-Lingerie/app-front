import React, { useState } from 'react';

type StarRatingInputProps = {
    value: number;
    onChange: (value: number) => void;
    max?: number;
    color?: string;
};

export const StarRatingInput: React.FC<StarRatingInputProps> = ({
    value,
    onChange,
    max = 5,
    color = '#F8C6D7',
}) => {
    const [hovered, setHovered] = useState<number>(0);
    const size = 24;

    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: max }, (_, i) => {
                const starValue = i + 1;
                const isActive = starValue <= (hovered || value);

                return (
                    <button
                        key={i}
                        type="button"
                        onClick={() => onChange(starValue)}
                        onMouseEnter={() => setHovered(starValue)}
                        onMouseLeave={() => setHovered(0)}
                        className="cursor-pointer p-0 border-0 bg-transparent transition-transform hover:scale-110"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill={isActive ? color : 'none'}
                            stroke={color}
                            strokeWidth="2"
                            style={{ width: size, height: size }}
                        >
                            <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.868 1.48 8.282L12 18.896l-7.416 4.56 1.48-8.282L0 9.306l8.332-1.151z" />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
};
