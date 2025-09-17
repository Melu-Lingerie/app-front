export const numberFormat = (value: unknown, locale = 'ru-RU') => {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return value; // если не число, возвращаем как есть
    return new Intl.NumberFormat(locale).format(num);
};