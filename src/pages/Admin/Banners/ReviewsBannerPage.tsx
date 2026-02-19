import { useState } from 'react';
import { AdminHeader, AdminButton, MediaUploader } from '../components';
import type { UploadedMedia } from '../components';

export function ReviewsBannerPage() {
    const [media, setMedia] = useState<UploadedMedia[]>(() => {
        try {
            const saved = localStorage.getItem('reviews_hero_banner');
            if (saved) return JSON.parse(saved);
        } catch { /* ignore */ }
        return [];
    });
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        if (media.length > 0) {
            localStorage.setItem('reviews_hero_banner', JSON.stringify(media));
        } else {
            localStorage.removeItem('reviews_hero_banner');
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div>
            <AdminHeader
                title="Баннер страницы отзывов"
                subtitle="Изображение для hero-секции на странице /reviews"
            />

            <div className="max-w-2xl">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <MediaUploader
                        label="Hero-изображение"
                        value={media}
                        onChange={(m) => { setMedia(m); setSaved(false); }}
                        maxFiles={1}
                        accept="image/*"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Рекомендуемый размер: 1920x600 пикселей. Если не загружено, используется бежевый фон-плейсхолдер.
                    </p>

                    {/* Preview */}
                    {media.length > 0 && media[0].url && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Предпросмотр</p>
                            <div className="relative w-full h-48 bg-[#e8ddd0] rounded-lg overflow-hidden">
                                <img
                                    src={media[0].url}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-end justify-center pb-6">
                                    <span className="text-white text-lg italic drop-shadow-lg" style={{ fontFamily: 'serif' }}>
                                        Благодаря вам мы становимся лучше!
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex items-center gap-3">
                        <AdminButton onClick={handleSave}>
                            Сохранить
                        </AdminButton>
                        {saved && (
                            <span className="text-sm text-green-600 dark:text-green-400">Сохранено</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
