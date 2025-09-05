import {Link} from "react-router-dom";

export const Footer = () => {
    return (
        <div style={{display: 'flex', gap: 160, padding: '60px 63px 200px'}}>
            <div style={{display: 'flex', flexDirection: 'column', fontSize: 14, lineHeight: '22px'}}>
                <p>8 (800) 777-01-22</p>
                <p>{'info@melu.ru'.toUpperCase()}</p>
                <p>WA</p>
                <p>TG</p>
                <p>VK</p>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', fontSize: 14, lineHeight: '22px'}}>
                <p>ГЛАВНАЯ</p>
                <Link to="/catalog">КАТАЛОГ</Link>
                <p>НОВИНКИ</p>
                <p>SECRET BOX</p>
                <p>{'Mix’n’match'.toUpperCase()}</p>
                <p>ТВОЙ ВКУС</p>
                <p>ВЫБОР БЛОГЕРОВ</p>
                <p>БЛОГ</p>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', fontSize: 14, lineHeight: '22px'}}>
                <p>ДОСТАВКА</p>
                <p>ОПЛАТА</p>
                <p>ВОЗВРАТ</p>
                <p>FAQ</p>
                <p>ТЕХПОДДЕРЖКА</p>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', fontSize: 14, lineHeight: '22px'}}>
                <p>{'политика конфиденциальности'.toUpperCase()}</p>
                <p>ОФЕРТА</p>
                <p>COOKIE</p>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', textDecorationLine: 'underline', fontSize: 14, lineHeight: '22px'}}>
                <p>{'Скидка 1000₽ за подписку'.toUpperCase()}</p>
                <p>{'на e-mail рассылку'.toUpperCase()}</p>
            </div>
        </div>
    );
};