import { Link } from 'react-router-dom';

export const Footer = () => {
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
                {/*<p>НОВИНКИ</p>*/}
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
                {/*<p>FAQ</p>*/}
                {/*<p>ТЕХПОДДЕРЖКА</p>*/}
            </div>

            <div className="flex flex-col text-sm leading-[22px]">
                {/*<p>{'политика конфиденциальности'.toUpperCase()}</p>*/}
                {/*<p>ОФЕРТА</p>*/}
                {/*<p>COOKIE</p>*/}
            </div>

            <div className="flex flex-col text-sm leading-[22px] underline">
                {/*<p>{'Скидка 1000₽ за подписку'.toUpperCase()}</p>*/}
                {/*<p>{'на e-mail рассылку'.toUpperCase()}</p>*/}
            </div>
        </div>
    );
};
