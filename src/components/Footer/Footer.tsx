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

    return (
        <footer className="px-4 md:px-[63px] pt-[40px] md:pt-[60px] pb-[60px] md:pb-[100px] border-t border-gray-200">
            {/* Desktop layout */}
            <div className="hidden md:grid grid-cols-3 gap-[80px] lg:gap-[160px]">
                {/* Контакты */}
                <div className="flex flex-col">
                    <h3 className="text-[16px] uppercase mb-6">Контакты</h3>
                    <div className="flex flex-col text-sm leading-[28px]">
                        <p>8 (800) 777-01-22</p>
                        <p>INFO@MELU.RU</p>
                        <p>WA</p>
                        <p>TG</p>
                        <p>VK</p>
                    </div>
                </div>

                {/* Покупателям */}
                <div className="flex flex-col">
                    <h3 className="text-[16px] uppercase mb-6">Покупателям</h3>
                    <div className="flex flex-col text-sm leading-[28px]">
                        <Link to="/customers/delivery">ДОСТАВКА</Link>
                        <Link to="/customers/returns">ВОЗВРАТ</Link>
                        <Link to="/customers/faq">ВОПРОС-ОТВЕТ</Link>
                        <Link to="/reviews">ОТЗЫВЫ</Link>
                        <Link to="/customers/care">УХОД ЗА ИЗДЕЛИЯМИ</Link>
                        <Link to="/policy" target="_blank" rel="noopener noreferrer">ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ</Link>
                        <Link to="/offer" target="_blank" rel="noopener noreferrer">ОФЕРТА</Link>
                        <Link to="/privacy.html" target="_blank" rel="noopener noreferrer">COOKIE</Link>
                    </div>
                </div>

                {/* Подписка */}
                <div className="flex flex-col">
                    <h3 className="text-[16px] uppercase mb-6">Подписка</h3>
                    <button
                        type="button"
                        className="text-left text-sm underline cursor-pointer mb-6"
                        onClick={handlePromoClick}
                    >
                        СКИДКА 1000₽ ЗА ПОДПИСКУ НА E-MAIL РАССЫЛКУ
                    </button>
                    <div className="flex flex-col text-[12px] text-[#999999] leading-[18px]">
                        <p>ИП Абдусаламов Гамид Зекергиевич</p>
                        <p>ИНН 050000304522</p>
                        <p>ОГРН 325050000115318</p>
                    </div>
                    <p className="text-[12px] text-[#999999] mt-4">&copy; melu {new Date().getFullYear()}</p>
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
                    <Link to="/reviews" className="text-[12px] uppercase">Отзывы</Link>
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

                {/* Юр. данные и копирайт */}
                <div className="flex flex-col gap-1 mt-4">
                    <div className="text-[10px] text-[#999] leading-[14px]">
                        <p>ИП Абдусаламов Гамид Зекергиевич</p>
                        <p>ИНН 050000304522</p>
                        <p>ОГРН 325050000115318</p>
                    </div>
                    <p className="text-[10px] text-[#999] mt-2">&copy; melu {new Date().getFullYear()}</p>
                </div>
            </div>
        </footer>
    );
};
