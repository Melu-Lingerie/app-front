export const ContactsPage = () => {
    return (
        <div className="w-full">
            {/* Заголовок */}
            <div className="px-4 md:px-10 pt-[60px] md:pt-[60px]">
                <h1 className="text-[28px] md:text-[36px] leading-[32px] md:leading-[36px] font-medium uppercase mb-[80px] md:mb-[128px] text-[#2A2A2B] dark:text-white">
                    Связаться с нами
                </h1>
            </div>

            {/* Контактная информация - первая строка */}
            <div className="px-4 md:px-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-[40px] gap-x-[40px] lg:gap-x-0">
                    {/* В мессенджерах - колонка 1 */}
                    <div className="lg:w-[465px]">
                        <h2 className="text-[16px] font-medium uppercase leading-[16px] mb-[32px] md:mb-[48px] text-[#2A2A2B] dark:text-white">
                            В мессенджерах
                        </h2>
                        <div className="space-y-1">
                            <a
                                href="https://wa.me/70000000000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-[16px] leading-[20px] text-[#565656] dark:text-white/80 hover:text-black dark:hover:text-white transition-colors"
                            >
                                Whats App
                            </a>
                            <a
                                href="https://t.me/melulingerie"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-[16px] leading-[20px] text-[#565656] dark:text-white/80 hover:text-black dark:hover:text-white transition-colors"
                            >
                                Telegram
                            </a>
                        </div>
                    </div>

                    {/* Телефон - колонка 2 */}
                    <div className="lg:w-[310px]">
                        <h2 className="text-[16px] font-medium uppercase leading-[16px] mb-[32px] md:mb-[48px] text-[#2A2A2B] dark:text-white">
                            Телефон
                        </h2>
                        <div className="space-y-1">
                            <a
                                href="tel:+70000000000"
                                className="block text-[16px] leading-[20px] text-[#565656] dark:text-white/80 hover:text-black dark:hover:text-white transition-colors"
                            >
                                +7 000 000-00-00
                            </a>
                            <a
                                href="tel:+70000000000"
                                className="block text-[16px] leading-[20px] text-[#565656] dark:text-white/80 hover:text-black dark:hover:text-white transition-colors"
                            >
                                +7 000 000-00-00
                            </a>
                            <p className="text-[16px] leading-[20px] text-[#565656] dark:text-white/80">
                                Бесплатно по России
                            </p>
                        </div>
                    </div>

                    {/* По вопросам сотрудничества - колонка 3 */}
                    <div className="lg:w-[465px]">
                        <h2 className="text-[16px] font-medium uppercase leading-[16px] mb-[32px] md:mb-[48px] text-[#2A2A2B] dark:text-white">
                            По вопросам сотрудничества
                        </h2>
                        <a
                            href="mailto:melulingerie@mail.ru"
                            className="block text-[16px] leading-[20px] text-[#565656] dark:text-white/80 hover:text-black dark:hover:text-white transition-colors"
                        >
                            melulingerie@mail.ru
                        </a>
                    </div>

                    {/* По качеству изделий и обслуживания - колонка 4 */}
                    <div className="lg:flex-1">
                        <h2 className="text-[16px] font-medium uppercase leading-[16px] mb-[32px] md:mb-[48px] text-[#2A2A2B] dark:text-white">
                            По качеству изделий и обслуживания
                        </h2>
                        <p className="text-[16px] leading-[20px] text-[#565656] dark:text-white/80 max-w-[288px]">
                            Пожалуйста, воспользуйтесь любым удобным вам способом:
                        </p>
                    </div>
                </div>

                {/* Вторая строка */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-[40px] gap-x-[40px] lg:gap-x-0 mt-[80px] md:mt-[126px]">
                    {/* Пустая колонка 1 */}
                    <div className="hidden lg:block lg:w-[465px]"></div>

                    {/* E-mail - колонка 2 */}
                    <div className="lg:w-[310px]">
                        <h2 className="text-[16px] font-medium uppercase leading-[16px] mb-[32px] md:mb-[48px] text-[#2A2A2B] dark:text-white">
                            E-mail
                        </h2>
                        <a
                            href="mailto:melulingerie@mail.ru"
                            className="block text-[16px] leading-[20px] text-[#565656] dark:text-white/80 hover:text-black dark:hover:text-white transition-colors"
                        >
                            melulingerie@mail.ru
                        </a>
                    </div>

                    {/* Офис - колонка 3 */}
                    <div className="lg:w-[465px]">
                        <h2 className="text-[16px] font-medium uppercase leading-[16px] mb-[32px] md:mb-[48px] text-[#2A2A2B] dark:text-white">
                            Офис
                        </h2>
                        <div className="space-y-1">
                            <p className="text-[16px] leading-[20px] text-[#565656] dark:text-white/80">
                                Город, улица, дом номер
                            </p>
                            <p className="text-[16px] leading-[20px] text-[#565656] dark:text-white/80">
                                Часы работы Пн‒Пт 10:00‒19:00
                            </p>
                        </div>
                    </div>

                    {/* Контакты - колонка 4 */}
                    <div className="lg:flex-1">
                        <div className="space-y-1 lg:mt-[48px]">
                            <a
                                href="tel:+70000000000"
                                className="block text-[16px] leading-[20px] text-[#565656] dark:text-white/80 hover:text-black dark:hover:text-white transition-colors"
                            >
                                +7 000 000-00-00
                            </a>
                            <a
                                href="mailto:melulingerie@mail.ru"
                                className="block text-[16px] leading-[20px] text-[#565656] dark:text-white/80 hover:text-black dark:hover:text-white transition-colors"
                            >
                                melulingerie@mail.ru
                            </a>
                            <a
                                href="https://wa.me/70000000000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-[16px] leading-[20px] text-[#565656] dark:text-white/80 hover:text-black dark:hover:text-white transition-colors"
                            >
                                Whats App
                            </a>
                            <a
                                href="https://t.me/melulingerie"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-[16px] leading-[20px] text-[#565656] dark:text-white/80 hover:text-black dark:hover:text-white transition-colors"
                            >
                                Telegram
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Разделитель перед футером */}
            <div className="w-full h-px bg-[#CCC] dark:bg-white/10 mt-[200px] md:mt-[250px]" />
        </div>
    );
};
