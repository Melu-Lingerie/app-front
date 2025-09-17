import {memo, useState} from 'react';

type ProductImagesProps = {
    images: { mediaId: number; url: string }[];
};

export const ProductImages = memo(
    ({ images }: ProductImagesProps) => {
        const [loadedIds, setLoadedIds] = useState<number[]>([]);

        return (
            <div className="grid grid-cols-2 grid-rows-2 gap-[10px]">
                {images.map((media) => {
                    const isLoaded = loadedIds.includes(media.mediaId);

                    return (
                        <div
                            key={media.mediaId}
                            className="relative w-full aspect-[620/945] bg-gray-100 rounded-md overflow-hidden"
                        >
                            {/* Скелетон */}
                            {!isLoaded && (
                                <div className="w-full h-full bg-gray-200 animate-pulse rounded-md" />
                            )}

                            {/* Картинка */}
                            <img
                                src={media.url}
                                alt="Фото товара"
                                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ${
                                    isLoaded ? 'opacity-100' : 'opacity-0'
                                }`}
                                onLoad={() =>
                                    setLoadedIds((prev) => [...prev, media.mediaId])
                                }
                                loading="lazy"
                            />
                        </div>
                    );
                })}
            </div>
        );
    },
    (prev, next) => {
        if (prev.images.length !== next.images.length) return false;

        const prevIds = prev.images.map((i) => i.mediaId).sort();
        const nextIds = next.images.map((i) => i.mediaId).sort();

        return prevIds.every((id, idx) => id === nextIds[idx]);
    }
);