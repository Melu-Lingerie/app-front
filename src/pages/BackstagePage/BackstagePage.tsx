import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import api from '@/axios/api.ts';

interface BackstageItem {
    id: number;
    title: string;
    description?: string;
    mediaUrl: string;
    mediaType?: string;
    sortOrder: number;
}

export const BackstagePage = () => {
    const [items, setItems] = useState<BackstageItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res = await api.get<BackstageItem[]>('/main-page/backstage');
                if (!cancelled) setItems(res.data);
            } catch {
                // silent
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        void load();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="px-4 md:px-10">
            <h1 className="mt-[30px] md:mt-[60px] mb-[20px] md:mb-[40px] text-[28px] md:text-[36px] leading-[32px] md:leading-[38px] uppercase">
                Бэкстейдж
            </h1>

            {items.length === 0 && (
                <p className="text-gray-500 text-center py-20">
                    Скоро здесь появятся фото и видео со съёмок
                </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 pb-[40px] md:pb-[90px]">
                {items.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.5,
                            delay: Math.min(index * 0.1, 0.5),
                        }}
                        className="relative overflow-hidden rounded-lg"
                    >
                        {item.mediaType === 'VIDEO' ? (
                            <video
                                src={item.mediaUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full aspect-video object-cover bg-black rounded-lg"
                            />
                        ) : (
                            <div
                                className="relative w-full aspect-[3/4] bg-gray-100 dark:bg-gray-800 flex items-end"
                                style={{
                                    background: `url(${item.mediaUrl}) center/cover no-repeat`,
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                <div className="relative p-4 md:p-6 text-white">
                                    <h3 className="text-sm md:text-base uppercase font-medium">
                                        {item.title}
                                    </h3>
                                    {item.description && (
                                        <p className="text-xs md:text-sm mt-1 opacity-80">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {item.mediaType === 'VIDEO' && (
                            <div className="p-3 md:p-4">
                                <h3 className="text-sm md:text-base uppercase font-medium">
                                    {item.title}
                                </h3>
                                {item.description && (
                                    <p className="text-xs md:text-sm mt-1 text-gray-500">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
