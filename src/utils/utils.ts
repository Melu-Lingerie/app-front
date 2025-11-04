import axios from 'axios';

export const numberFormat = (value: unknown, locale = 'ru-RU') => {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return value; // если не число, возвращаем как есть
    return new Intl.NumberFormat(locale).format(num);
};

export const isAbortError = (error: unknown): boolean =>
    (error instanceof DOMException && error.name === 'AbortError') ||
    axios.isCancel(error) ||
    (error as { name?: string })?.name === 'AbortError' ||
    (error as { name?: string })?.name === 'CanceledError' ||
    (error as { code?: string })?.code === 'ERR_CANCELED';