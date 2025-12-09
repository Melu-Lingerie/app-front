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
        <div className="flex gap-[160px] px-[63px] pt-[60px] pb-[100px]">
            <div className="flex flex-col text-sm leading-[22px]">
                <p>8 (920) 025-15-78</p>
                <p>{'boutique@melu.bra'.toUpperCase()}</p>
                {/*<p>WA</p>*/}
                {/*<p>TG</p>*/}
                {/*<p>VK</p>*/}
            </div>

            <div className="flex flex-col text-sm leading-[22px]">
                <Link to="/">ГЛАВНАЯ</Link>
                <Link to="/catalog">КАТАЛОГ</Link>
                <button className="cursor-pointer" onClick={() => goSort('Новинки')}>НОВИНКИ</button>
                {/*<p>SECRET BOX</p>*/}
                {/*<p>{'Mix’n’match'.toUpperCase()}</p>*/}
                {/*<p>ТВОЙ ВКУС</p>*/}
                {/*<p>ВЫБОР БЛОГЕРОВ</p>*/}
                {/*<p>БЛОГ</p>*/}
            </div>

            <div className="flex flex-col text-sm leading-[22px]">
                <Link to="/customers/delivery">ДОСТАВКА</Link>
                {/*<p>ОПЛАТА</p>*/}
                <Link to="/customers/returns">ВОЗВРАТ</Link>
                <Link to="/customers/faq">FAQ</Link>
                {/*<p>ТЕХПОДДЕРЖКА</p>*/}
            </div>

            <div className="flex flex-col text-sm leading-[22px]">
                {/*<p>{'политика конфиденциальности'.toUpperCase()}</p>*/}
                {/*<p>ОФЕРТА</p>*/}
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
    );
};
