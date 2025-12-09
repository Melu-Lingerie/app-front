import {useLocation, useNavigate, Routes, Route, Navigate, Link} from 'react-router-dom';
import {motion, AnimatePresence} from 'framer-motion';

export const CustomersPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        {label: 'Доставка', path: '/customers/delivery'},
        {label: 'Возврат', path: '/customers/returns'},
        {label: 'Вопрос-ответ', path: '/customers/faq'},
        {label: 'Уход за изделиями', path: '/customers/care'},
        {label: 'Подарочные сертификаты', path: '/customers/certificates'},
    ];

    const handleTabClick = (tabPath: string) => {
        navigate(tabPath);
    };

    return (
        <>
            <div className="flex min-h-180">
                {/* Левая колонка с табами */}
                <div className="w-1/4 border-r border-[#CCCCCC] dark:border-white/10 pt-[68px]">
                    <div className="pl-[40px] mb-[100px] text-[24px] leading-[26px] font-medium uppercase">
                        Покупателям
                    </div>

                    <nav>
                        <div className="border-b border-[#CCCCCC] dark:border-white/10"/>
                        {tabs.map((tab) => {
                            const isActive = location.pathname === tab.path;
                            return (
                                <div key={tab.path}>
                                    <button
                                        onClick={() => handleTabClick(tab.path)}
                                        className={`w-full text-left h-[56px] flex items-center pl-[40px] text-[16px] leading-[18px] uppercase transition-colors ${
                                            isActive
                                                ? 'bg-[#F8C6D7]'
                                                : 'hover:bg-[#F8C6D7]/40'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                    <div className="border-b border-[#CCCCCC] dark:border-white/10"/>
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* Правая часть с контентом вкладок */}
                <div className="w-3/4 p-10">
                    <AnimatePresence mode="wait">
                        <Routes location={location} key={location.pathname}>
                            <Route
                                path="delivery"
                                element={
                                    <motion.div
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0, y: -10}}
                                        transition={{duration: 0.25}}
                                    >
                                        <div className="space-y-[60px]">
                                            {/* 1. Экспресс-доставка */}
                                            <section>
                                                <h2 className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Экспресс-доставка
                                                </h2>
                                                <p className="text-[16px] leading-[22px] mb-3">
                                                    По Москве и Санкт-Петербургу доступна доставка день в день или на следующий.
                                                </p>
                                                <p className="text-[16px] leading-[22px] mb-2">
                                                    Детали экспресс‒доставки:
                                                </p>
                                                <ul className="text-[16px] leading-[22px] list-disc pl-5 space-y-1">
                                                    <li>
                                                        Доставка в тот же день при заказе до 13:00 или на следующий день при заказе после 13:00
                                                    </li>
                                                    <li>
                                                        Доставка возможна только в пределах КАД (по Санкт-Петербургу) / МКАД (по Москве)
                                                    </li>
                                                    <li>
                                                        Стоимость доставки является фиксированной при заказе до 35 000 руб: по Санкт-Петербургу — 1000 руб., по Москве — 1300 руб.
                                                    </li>
                                                    <li>
                                                        Экспресс-доставка по Москве и Санкт-Петербургу является бесплатной при заказе от 35 000 руб.
                                                    </li>
                                                </ul>
                                            </section>

                                            {/* 2. Как получить заказ? */}
                                            <section>
                                                <h2 className="font-medium text-[16px] leading-[18px] uppercase mb-3">
                                                    Как получить заказ?
                                                </h2>
                                                <p className="text-[16px] leading-[22px] mb-3">
                                                    Мы доставляем заказы по всему миру.
                                                </p>
                                                <p className="text-[16px] leading-[22px] mb-3">
                                                    Заказы по России отправляем курьерскими службами доставки: СДЭК, Boxberry и Яндекс.
                                                    Вы можете выбрать доставку курьером или самовывоз из отделения/постамата.
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Заказы в другие страны отправляем курьерскими службами: СДЭК и DHL.
                                                </p>
                                            </section>

                                            {/* 3. Сколько стоит доставка? */}
                                            <section>
                                                <h2 className="font-medium text-[16px] leading-[18px] uppercase mb-3">
                                                    Сколько стоит доставка?
                                                </h2>
                                                <p className="text-[16px] leading-[22px] mb-3">
                                                    Мы ценим ваше доверие и стремимся предоставить лучший уровень обслуживания, обеспечивая безопасность и
                                                    надежность доставки каждого заказа.
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Стоимость доставки зависит от региона и выбранной курьерской службы.
                                                    Рассчитать стоимость доставки можно при оформлении заказа.
                                                </p>
                                            </section>

                                            {/* 4. Доставка одежды */}
                                            <section>
                                                <h2 className="font-medium text-[16px] leading-[18px] uppercase mb-3">
                                                    Доставка одежды
                                                </h2>
                                                <p className="text-[16px] leading-[22px] mb-3">
                                                    Бесплатная доставка заказов от 12 000 рублей по России транспортными компаниями: СДЭК*, Boxberry и Яндекс.
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    * Только до пункта выдачи СДЭК. При выборе СДЭК курьер стоимость заказа выше 12 000 руб будет указана при
                                                    оформлении заказа.
                                                </p>
                                            </section>

                                            {/* 5. Как отследить заказ? */}
                                            <section>
                                                <h2 className="font-medium text-[16px] leading-[18px] uppercase mb-3">
                                                    Как отследить заказ?
                                                </h2>
                                                <p className="text-[16px] leading-[22px] mb-3">
                                                    В течение двух рабочих дней после оформления заказа на сайте, мы передадим его в курьерскую службу доставки.
                                                    Когда заказ будет отправлен, вам на почту придет трек-номер для его отслеживания.
                                                </p>
                                                <p className="text-[16px] leading-[22px] mb-2">
                                                    С помощью трек-номера вы можете следить за статусом заказа:
                                                </p>
                                                <ul className="text-[16px] leading-[22px] list-disc pl-5 space-y-1">
                                                    <li>В личном кабинете на сайте.</li>
                                                    <li>Заказы с доставкой СДЭК на сайте.</li>
                                                    <li>Заказы с доставкой Boxberry на сайте.</li>
                                                    <li>Заказы с доставкой DHL на сайте.</li>
                                                </ul>
                                            </section>
                                        </div>
                                    </motion.div>
                                }
                            />
                            <Route
                                path="returns"
                                element={
                                    <motion.div
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0, y: -10}}
                                        transition={{duration: 0.25}}
                                    >
                                        <div className="space-y-[60px]">
                                            <section>
                                                <h2 className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Условия возврата
                                                </h2>
                                                <p className="text-[16px] leading-[22px] mb-2">
                                                    Вы можете вернуть весь заказ или те изделия, которые вам не подошли.
                                                </p>
                                                <ul className="text-[16px] leading-[22px] list-disc pl-5 space-y-1 mb-2">
                                                    <li>
                                                        Вернуть можно только новый товар, который не был в употреблении. Мы не оформляем возврат за вещи, на которых есть следы стирки, носки и иные признаки эксплуатации.
                                                    </li>
                                                    <li>
                                                        Сохраните оригинальность упаковки и полную комплектацию изделия. Не удаляйте бирку, вшивные ярлыки до того, как убедитесь, что изделие вам подходит.                                                    </li>
                                                    <li>
                                                        Вы можете вернуть изделие, если оно не подошло вам по размеру, цвету, фасону или качеству.                                                    </li>
                                                </ul>
                                                <p className="text-[16px] leading-[22px]">
                                                    Интернет-магазин имеет право отказать в возврате в случаях обнаружения нарушений условий сохранения товарного вида. В таком случае все затраты на доставку возврата возлагаются на потребителя.                                                </p>
                                            </section>

                                            <section>
                                                <h2 className="font-medium text-[16px] leading-[18px] uppercase mb-3">
                                                    Как оформить возврат?                                                </h2>
                                                <p className="text-[16px] leading-[22px] mb-3">
                                                    Оформить возврат изделия надлежащего качества можно в течение 14 дней после получения заказа.</p>
                                                <ol className="text-[16px] leading-[22px] list-decimal pl-5 space-y-1 mb-2">
                                                    <li>
                                                        Заполните заявление на возврат, укажите причину возврата. Скачать заявление можно здесь.                                                     </li>
                                                    <li>
                                                        Упакуйте товары, которые вам не подошли, вложив внутрь заполненное заявление.                                                   </li>
                                                    <li>
                                                        Для оформления возврата, отправьте заполненное заявление на почту vozvrat@irnby.com, в теме письма укажите номер своего заказа. Также в письме укажите данные по отправке возврата через ПВЗ СДЭК:
                                                        <ul className="text-[16px] leading-[22px] list-disc pl-5 space-y-1 mb-2">
                                                            <li>
                                                                ФИО
                                                            </li>
                                                            <li>
                                                                Номер телефона                                                </li>
                                                            <li>
                                                                Город                                                  </li>
                                                            <li>
                                                                Адрес ПВЗ СДЭК для сдачи посылки                                               </li>
                                                        </ul>
                                                    </li>
                                                </ol>
                                                <p className="text-[16px] leading-[22px] mb-3">
                                                    В течение 24 часов мы обработаем ваш запрос и ответным письмом направим номер накладной. В течение 2 дней отнесите посылку в выбранный вами ПВЗ и назовите номер накладной для сдачи сотруднику СДЭКа. Данный возврат осуществляется за счет интернет-магазина.</p>
                                                <p className="text-[16px] leading-[22px] mb-3">
                                                    *Сроки доставки возврата из Калининграда увеличены, осуществляются в течение 17-25 рабочих дней до момента получения на складе. Для более быстрой доставки вы можете отправить возврат самостоятельно. Стоимость самостоятельной отправки любым другим способом не компенсируется.
                                                </p>
                                                <p className="text-[16px] leading-[22px] mb-3">
                                                    Также вы можете отправить посылку обратившись в любую транспортную компанию. Отправить посылку необходимо курьером по адресу: 196084, Санкт-Петербург, ул. Смоленская, дом 33, лит А, ООО «АЙРОНБАЙ». Данный возврат осуществляется за счет покупателя.
                                                </p>
                                                <p className="text-[16px] leading-[22px] mb-3">
                                                    Как только мы получим посылку, наши специалисты проверят изделия и оформят возврат денежных средств. Возврат обрабатывается в течение 10 рабочих дней с момента поступления на склад. После обработки вашего возврата денежные средства возвращаются на карту, с которой был оплачен заказ на сайте. Срок зачисления денежных средств зависит от Банка-эмитента.
                                                </p>
                                                <p className="text-[16px] leading-[22px] mb-3">
                                                    В случае несоблюдения условий возврата или изменения способа или условий доставки, компания снимает с себя всю ответственность за неполученные посылки. Транспортные расходы на возврат заказа из-за рубежа оплачиваются покупателем.
                                                </p>
                                                <p>Возврат интернет-заказа также доступен в двух офлайн магазинах:</p>
                                                <ol className="text-[16px] leading-[22px] list-decimal pl-5 space-y-1 mb-2">
                                                    <li>
                                                        Москва, Чистопрудный бульвар, дом 21
                                                    </li>
                                                    <li>
                                                        Санкт-Петербург, проспект Добролюбова, дом 5/1
                                                    </li>
                                                </ol>
                                                <p className="text-[16px] leading-[22px] mb-3">
                                                    Для осуществления возврата необходимо приехать в магазин и сообщить продавцу-консультанту запрос на возврат. Возврат будет одобрен в случае соблюдения всех условий.
                                                    При предъявлении на кассе физической банковской карты, с которой была осуществлена оплата на сайте, деньги будут возвращены в тот же день. Срок зачисления денежных средств зависит от Банка-эмитента. Для оформления возврата необходимо заполнить заявление на возврат.
                                                    При отсутствии физической карты на кассе также необходимо заполнить заявление на возврат для осуществления данной операции.
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Если у вас есть вопросы по возврату товара — свяжитесь с нами удобным для вас способом:
                                                </p>
                                            </section>
                                        </div>
                                    </motion.div>
                                }
                            />
                            <Route
                                path="faq"
                                element={
                                    <motion.div
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0, y: -10}}
                                        transition={{duration: 0.25}}
                                    >
                                        <div className="space-y-[40px]">
                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Как с нами связаться
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Напишите в WhatsApp или Telegram
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Горячая линия:
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Контакты магазинов
                                                </p>
                                            </section>

                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Оплата при получении
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Оплата заказа доступна только онлайн — при оформлении на сайте.
                                                </p>
                                            </section>

                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Возврат
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Вернуть товар можно в течение 14 дней с момента получения.
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Подробности — в разделе <Link to="/customers/returns" className="underline">«Возврат»</Link>
                                                </p>
                                            </section>

                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Как выбрать размер
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Ориентируйтесь на таблицу в карточке товара.
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Если нужно уточнение — свяжитесь с нами. Мы поможем.
                                                </p>
                                            </section>

                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Где находится заказ
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Сборка заказа — 1–2 рабочих дня.
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Трек-номер поступает на почту после отправки.
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Заказы через Яндекс доставку отслеживаются только в приложении Яндекс Go.
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Если трек не пришёл — напишите или позвоните.
                                                </p>
                                            </section>

                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Промокод за подписку
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Промокод действует на первый заказ при покупке товаров по полной цене.
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    На разделы SALE, Underwear и ART не распространяется.
                                                </p>
                                            </section>

                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Как использовать бонусы
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Бонусами можно оплатить до 50% от стоимости заказа.
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Срок действия — 6 месяцев с момента начисления.
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Сроки активации:
                                                    <ul className="text-[16px] leading-[22px] list-disc pl-5 space-y-1">
                                                        <li>
                                                            бонусы за регистрацию доступны к списанию через 7 дней
                                                        </li>
                                                        <li>
                                                            бонусы за покупку: через 14 дней (оффлайн) и через 19 дней (онлайн)
                                                        </li>
                                                        <li>
                                                            бонусы в день рождения: начисляются за 10 дней до дня рождения и сгорают через 10 дней после
                                                        </li>
                                                    </ul>
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Исключения:
                                                    <ul className="text-[16px] leading-[22px] list-disc pl-5 space-y-1">
                                                        <li>
                                                            оплата бонусами недоступна для категорий ART и Underwear
                                                        </li>
                                                        <li>
                                                            при использовании бонусов кешбэк на оставшуюся сумму не начисляется
                                                        </li>
                                                        <li>
                                                            бонусы, промокоды и скидки не суммируются
                                                        </li>
                                                    </ul>
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Бонусы начисляются при покупке изделий со скидкой, но использовать их можно только при оплате товаров по полной цене.
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    При возврате покупки бонусы сгорают.
                                                </p>
                                            </section>

                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Если заказ задерживается
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Свяжитесь с нами. Уточните номер заказа — мы направим запрос в курьерскую службу и сообщим статус.
                                                </p>
                                            </section>

                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Способы оплаты
                                                </p>
                                                <ul className="text-[16px] leading-[22px] list-disc pl-5 space-y-1">
                                                    <li>
                                                        Банковские карты РФ
                                                    </li>
                                                    <li>
                                                        Международные карты (список стран — здесь)
                                                    </li>
                                                    <li>
                                                        Dolyame (для карт РФ)
                                                    </li>
                                                    <li>
                                                        СБП (Система быстрых платежей)
                                                    </li>
                                                </ul>
                                            </section>

                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Возврат средств
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    После получения возвратной посылки обработка занимает до 10 рабочих дней.
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Если срок прошел — напишите нам. Мы всё проверим.
                                                </p>
                                            </section>

                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Брак
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Сделайте фото и направьте его нам.
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Если дефект подтвержден — все транспортные расходы мы берём на себя.
                                                </p>
                                            </section>
                                        </div>
                                    </motion.div>
                                }
                            />
                            <Route
                                path="care"
                                element={
                                    <motion.div
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0, y: -10}}
                                        transition={{duration: 0.25}}
                                    >
                                        <div className="space-y-[40px]">
                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Стирка
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    После стирки деликатные ткани необходимо сушить аккуратно. Не выкручивайте бельё, чтобы избежать деформации волокон. Расположите изделие на горизонтальной поверхности или полотенце, вдали от прямого солнца и нагревательных приборов.
                                                </p>
                                            </section>

                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Сушка
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Машинная сушка для кружевного и шелкового белья не рекомендуется.
                                                </p>
                                            </section>

                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Утюжка
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Большинство кружевного и шелкового белья не требует глажки. Если необходимо разгладить складки, используйте минимальную температуру утюга и гладильную поверхность через тонкую ткань. Прямое воздействие высокой температуры на кружево и эластичные волокна может повредить изделие.
                                                </p>
                                            </section>

                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Химчистка
                                                </p>
                                                <p className="text-[16px] leading-[22px]">
                                                    Химчистка не рекомендуется.
                                                </p>
                                            </section>
                                        </div>
                                    </motion.div>
                                }
                            />
                            <Route
                                path="certificates"
                                element={
                                    <motion.div
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0, y: -10}}
                                        transition={{duration: 0.25}}
                                    >
                                        <div className="space-y-[40px]">
                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Срок действия и номинал
                                                </p>
                                                <ul className="text-[16px] leading-[22px] list-disc pl-5 space-y-1">
                                                    <li>
                                                        Срок действия: Ваш подарок будет ждать своего часа целых 3 года с момента приобретения.
                                                    </li>
                                                    <li>
                                                        Номинал: Вы сами выбираете сумму — от 500 до 500 000 рублей.
                                                    </li>
                                                </ul>
                                            </section>

                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Доставка виртуального сертификата
                                                </p>
                                                <ul className="text-[16px] leading-[22px] list-disc pl-5 space-y-1">
                                                    <li>
                                                        Электронный сертификат мы моментально отправим в СМС-сообщении.
                                                    </li>
                                                    <li>
                                                        Хотите сделать сюрприз? Вы можете заранее назначить дату и время доставки.
                                                    </li>
                                                </ul>
                                            </section>

                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Как активировать и использовать
                                                </p>
                                                <ul className="text-[16px] leading-[22px] list-disc pl-5 space-y-1">
                                                    <li>
                                                        Простая активация: Виртуальный сертификат можно легко привязать к вашему личному кабинету Melu (при оформлении заказа или позже, указав номер телефона).
                                                    </li>
                                                    <li>
                                                        Оплата онлайн: Для использования на сайте или в приложении просто выберите способ оплаты «Картой онлайн» и введите код сертификата.
                                                    </li>
                                                    <li>
                                                        Оплата в магазине:
                                                        <ul className="text-[16px] leading-[22px] list-disc pl-5 space-y-1">
                                                            <li>
                                                                Физический сертификат: Предъявите оригинал на кассе.
                                                            </li>
                                                            <li>
                                                                Виртуальный сертификат: Покажите SMS с кодом или письмо от Melu.
                                                            </li>
                                                        </ul>
                                                    </li>
                                                </ul>
                                            </section>

                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Где и как можно расплатиться?
                                                </p>
                                                <ul className="text-[16px] leading-[22px] list-disc pl-5 space-y-1">
                                                    <li>
                                                        Действует везде: Оплачивайте покупки в любых магазинах Melu, на сайте и в приложении.
                                                    </li>
                                                    <li>
                                                        Гибкая оплата: Сертификатом можно оплатить весь заказ или его часть, а также доставку. Сумму можно разделить на несколько покупок.
                                                    </li>
                                                    <li>
                                                        Недействителен для предзаказов.
                                                    </li>
                                                </ul>
                                            </section>

                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Совместимость с другими акциями
                                                </p>
                                                <ul className="text-[16px] leading-[22px] list-disc pl-5 space-y-1">
                                                    <li>
                                                        Да! Сертификат можно комбинировать с бонусными баллами и промокодами.
                                                    </li>
                                                    <li>
                                                        Нет: При покупке самого сертификата бонусные баллы не начисляются.
                                                    </li>
                                                </ul>
                                            </section>

                                            <section>
                                                <p className="text-[16px] leading-[18px] font-medium uppercase mb-3">
                                                    Возврат
                                                </p>
                                                <ul className="text-[16px] leading-[22px] list-disc pl-5 space-y-1">
                                                    <li>
                                                        Возврат сертификата: Возврат физического или виртуального сертификата возможен только в розничных магазинах Melu.
                                                    </li>
                                                    <li>
                                                        Возврат товара, купленного за сертификат: При возврате товара средства возвращаются наличными или на банковскую карту.
                                                    </li>
                                                </ul>
                                            </section>
                                        </div>
                                    </motion.div>
                                }
                            />
                            {/* По умолчанию открываем вкладку Доставка */}
                            <Route path="*" element={<Navigate to="/customers/delivery" replace/>}/>
                        </Routes>
                    </AnimatePresence>
                </div>
            </div>
            <div className="w-full border-t border-[#CCCCCC] dark:border-white/10"/>
        </>
    );
};