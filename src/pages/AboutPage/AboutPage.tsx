export const AboutPage = () => {
    return (
        <div className="w-full">
            {/* Заголовок */}
            <div className="px-4 md:px-10 pt-[60px] md:pt-[90px]">
                <h1 className="text-[40px] md:text-[60px] leading-[44px] md:leading-[64px] font-medium text-[#565656] uppercase mb-[100px] md:mb-[154px]">
                    О бренде
                </h1>
            </div>

            {/* Главный текст */}
            <div className="px-4 md:px-10">
                <div className="text-[24px] md:text-[36px] leading-[32px] md:leading-[40px] font-medium text-[#565656]">
                    <p className="md:text-center">Melu — твой надёжный спутник в ритме современной жизни.</p>
                    <p>Мы знаем, что такое быть современной женщиной.</p>
                    <p className="md:text-center">Это значит быть разной: сегодня ты — целеустремлённая профессионалка</p>
                    <p>на важных переговорах, завтра — нежная мама на утреннике, а вечером — страстная</p>
                    <p>спортсменка в зале или душа компании на вечеринке.</p>
                </div>
            </div>

            {/* Секция с текстом и изображением */}
            <div className="px-4 md:px-10 mt-[200px] md:mt-[362px] relative">
                <div className="flex flex-col lg:flex-row">
                    {/* Левая часть - два блока текста */}
                    <div className="w-full lg:w-[1280px] flex flex-col md:flex-row gap-[40px] md:gap-0">
                        {/* О чём мы? */}
                        <div className="w-full md:w-[620px] md:pr-[20px]">
                            <h2 className="text-[16px] font-medium text-[#565656] leading-[16px] mb-[32px] md:mb-[48px]">
                                О чём мы?
                            </h2>
                            <p className="text-[16px] leading-[20px] text-[#565656] max-w-[600px]">
                                Melu создан для того, чтобы поддерживать тебя в каждом из этих проявлений. Мы предлагаем не просто нижнее бельё, а твоего тихого союзника, который подарит уверенность и комфорт, куда бы ни занес тебя твой динамичный график.
                            </p>
                        </div>

                        {/* Наша философия */}
                        <div className="w-full md:w-[620px]">
                            <h2 className="text-[16px] font-medium text-[#565656] leading-[16px] mb-[32px] md:mb-[48px]">
                                Наша философия
                            </h2>
                            <p className="text-[16px] leading-[20px] text-[#565656] max-w-[600px]">
                                Наша философия — это универсальность без компромиссов. Бельё, которое идеально чувствует себя под деловым костюмом, не подведет во время тренировки и подчеркнет твою индивидуальность на свидании. Мы верим, что ты заслуживаешь безупречного качества и стиля в каждой роли, которую выбираешь.
                            </p>
                        </div>
                    </div>

                    {/* Правая часть - большое изображение (позиционируется абсолютно на десктопе) */}
                    <div className="mt-[40px] lg:mt-0 lg:absolute lg:right-10 lg:top-[-362px] w-full lg:w-[445px]">
                        <div className="w-full lg:w-[445px] aspect-[445/520] bg-[#E5DDD5] overflow-hidden">
                            <img
                                src="/images/about-main.jpg"
                                alt="Melu Lingerie"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Два изображения снизу */}
            <div className="px-4 md:px-10 mt-[60px] md:mt-[200px]">
                <div className="flex gap-[20px] md:gap-[20px]">
                    <div className="w-[140px] md:w-[290px] aspect-[290/426] bg-[#E8D4C8] overflow-hidden">
                        <img
                            src="/images/about-1.jpg"
                            alt="Melu Lingerie"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                    <div className="w-[140px] md:w-[290px] aspect-[290/426] bg-[#E8D4C8] overflow-hidden">
                        <img
                            src="/images/about-2.jpg"
                            alt="Melu Lingerie"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Разделитель перед футером */}
            <div className="w-full h-px bg-[#CCC] dark:bg-white/10 mt-[120px] md:mt-[120px]" />
        </div>
    );
};
