import { useEffect, useState } from 'react';
import { MainPageControllerService, type BannerMainPageFacadeDto } from '@/api';
import { useNavigate } from 'react-router-dom';

export const ActualInfo = () => {
    const [banners, setBanners] = useState<BannerMainPageFacadeDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    const intervalMs = 5000; // каждые 5 секунд

    // Загружаем баннеры
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setLoading(true);
                const res = await MainPageControllerService.toBannerMainPageFacadeDto();
                setBanners([...res].sort((a, b) => a.order - b.order));
            } catch (e) {
                console.error('Ошибка загрузки баннеров', e);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    // Автопереключение
    useEffect(() => {
        if (!banners.length) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, intervalMs);
        return () => clearInterval(timer);
    }, [banners.length]);

    // ⏳ Скелетон пока грузим баннеры
    if (loading) {
        return (
            <div className="w-full h-[920px] relative bg-gray-200 animate-pulse flex flex-col items-center justify-end">
                {/* заглушка для текста */}
                <div className="mb-5 h-4 w-40 bg-gray-300 rounded" />
                <div className="mb-[60px] h-10 w-80 bg-gray-300 rounded" />
                <div className="w-[600px] h-[2px] bg-gray-300 mb-5" />
                <div className="mb-[60px] h-10 w-32 bg-gray-300 rounded-full" />
            </div>
        );
    }

    if (!banners.length) {
        return (
            <div className="flex items-center justify-center w-full h-[920px] bg-gray-100">
                <p className="text-gray-600">Баннеры отсутствуют</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[920px] overflow-hidden">
            {/* Все баннеры в стеке */}
            {banners.map((banner, idx) => (
                <img
                    key={banner.id}
                    src={banner.mediaUrl}
                    alt={banner.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                        idx === currentIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                />
            ))}

            {/* Контент поверх */}
            <div className="relative z-10 flex flex-col items-center justify-end text-white h-full bg-black/30">
                <p className="mb-5">{banners[currentIndex].title}</p>
                <p className="mb-[60px] text-[62px] leading-[64px]">НОВАЯ КОЛЛЕКЦИЯ</p>
                <div className="w-[600px] border-t-2 border-white mb-5" />
                <button
                    onClick={() => navigate(banners[currentIndex].url)}
                    className="mb-[60px] px-6 py-2 rounded-xl bg-[#F8C6D7] text-black uppercase hover:bg-[#f5b6ca] transition active:scale-95"
                >
                    Смотреть
                </button>
            </div>

            {/* Индикаторы */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {banners.map((_, idx) => (
                    <span
                        key={idx}
                        className={`w-3 h-3 rounded-full transition ${
                            idx === currentIndex ? 'bg-[#F8C6D7]' : 'bg-white/50'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};
