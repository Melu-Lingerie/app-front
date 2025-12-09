import {Link, useNavigate} from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/userSlice.ts';

export const Footer = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const handlePromoClick = () => {
        if (isAuthenticated) {
            navigate('/account');
            return;
        }
        window.dispatchEvent(new CustomEvent('open-login-modal'));
    };

    const goSort = (value: string) => {
        const params = new URLSearchParams({ sort: value });
        navigate(`/catalog?${params.toString()}`);
    };

    return (
        <footer className="px-4 md:px-[63px] pt-[40px] md:pt-[60px] pb-[60px] md:pb-[100px]">
            {/* Desktop layout */}
            <div className="hidden md:flex gap-[160px]">
                <div className="flex flex-col text-sm leading-[22px]">
                    <p>8 (800) 777-01-22</p>
                    <p>INFO@MELU.RU</p>
                    <p>WA</p>
                    <p>TG</p>
                    <p>VK</p>
                </div>

                <div className="flex flex-col text-sm leading-[22px]">
                    <Link to="/">ГЛАВНАЯ</Link>
                    <Link to="/catalog">КАТАЛОГ</Link>
                    <button className="text-left cursor-pointer" onClick={() => goSort('Новинки')}>НОВИНКИ</button>
                </div>

                <div className="flex flex-col text-sm leading-[22px]">
                    <Link to="/customers/delivery">ДОСТАВКА</Link>
                    <Link to="/customers/returns">ВОЗВРАТ</Link>
                    <Link to="/customers/faq">FAQ</Link>
                </div>

                <div className="flex flex-col text-sm leading-[22px]">
                    <Link to={'/privacy.html'} target="_blank" rel="noopener noreferrer">COOKIE</Link>
                </div>

                <div className="flex flex-col text-sm leading-[22px] underline">
                    <button
                        type="button"
                        className="text-left cursor-pointer"
                        onClick={handlePromoClick}
                    >
                        {'Скидка 1000₽ за подписку на e-mail рассылку'.toUpperCase()}
                    </button>
                </div>

                <div className="max-w-[150px] flex flex-col text-[12px] text-[#999999] leading-[18px]">
                    <p>Индивидуальный предприниматель Абдусаламов Гамид Зекергиевич</p>
                    <p>ИНН 050000304522</p>
                    <p>ОГРН 325050000115318</p>
                </div>
            </div>

            {/* Mobile layout */}
            <div className="md:hidden flex flex-col gap-6">
                {/* Контакты */}
                <div className="flex flex-col gap-1">
                    <h3 className="text-[14px] uppercase mb-2">Контакты</h3>
                    <p className="text-[12px]">8 (800) 777-01-22</p>
                    <p className="text-[12px]">INFO@MELU.RU</p>
                    <p className="text-[12px]">WA</p>
                    <p className="text-[12px]">TG</p>
                    <p className="text-[12px]">VK</p>
                </div>

                {/* Покупателям */}
                <div className="flex flex-col gap-1">
                    <h3 className="text-[14px] uppercase mb-2">Покупателям</h3>
                    <Link to="/customers/delivery" className="text-[12px] uppercase">Доставка</Link>
                    <Link to="/customers/returns" className="text-[12px] uppercase">Возврат</Link>
                    <Link to="/customers/faq" className="text-[12px] uppercase">Вопрос-ответ</Link>
                    <button className="text-left text-[12px] uppercase">Отзывы</button>
                    <Link to="/customers/care" className="text-[12px] uppercase">Уход за изделиями</Link>
                    <Link to="/policy" className="text-[12px] uppercase">Политика конфиденциальности</Link>
                    <Link to="/offer" className="text-[12px] uppercase">Оферта</Link>
                    <Link to="/privacy.html" target="_blank" rel="noopener noreferrer" className="text-[12px] uppercase">Cookie</Link>
                </div>

                {/* Подписка */}
                <div className="flex flex-col gap-1">
                    <h3 className="text-[14px] uppercase mb-2">Подписка</h3>
                    <button
                        type="button"
                        className="text-left text-[12px] underline cursor-pointer"
                        onClick={handlePromoClick}
                    >
                        СКИДКА 1000₽ ЗА ПОДПИСКУ НА E-MAIL РАССЫЛКУ
                    </button>
                </div>

                {/* Соц сети */}
                <div className="flex items-center gap-6 text-[12px] uppercase mt-2">
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70">
                        YouTube
                    </a>
                    <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70">
                        VK
                    </a>
                    <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="hover:opacity-70">
                        Telegram
                    </a>
                </div>

                {/* Копирайт */}
                <div className="text-[10px] text-[#999] mt-4">
                    <p>© Бренд melu, 2025</p>
                </div>
            </div>
        </footer>
    );
};
