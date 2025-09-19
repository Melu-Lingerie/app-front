import React from 'react';

export const DotsLoader: React.FC<{ color?: string; size?: number }> = ({
                                                                            color = '#555',
                                                                            size = 6,
                                                                        }) => {
    return (
        <div className="flex gap-1 items-center justify-center">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="inline-block rounded-full animate-bounce"
                    style={{
                        width: size,
                        height: size,
                        backgroundColor: color,
                        animationDelay: `${i * 0.2}s`,
                    }}
                />
            ))}
        </div>
    );
};
