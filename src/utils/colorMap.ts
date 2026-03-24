/**
 * Mapping of Russian color names to CSS hex codes.
 * Used for rendering color swatches from backend color names.
 */
const COLOR_MAP: Record<string, string> = {
    // Основные
    'черный': '#000000',
    'чёрный': '#000000',
    'белый': '#FFFFFF',
    'красный': '#DC143C',
    'синий': '#0000CD',
    'зеленый': '#228B22',
    'зелёный': '#228B22',
    'желтый': '#FFED9C',
    'жёлтый': '#FFED9C',
    'оранжевый': '#FF8C00',
    'розовый': '#FFD6E1',
    'фиолетовый': '#8B008B',
    'серый': '#808080',
    'коричневый': '#511505',
    'голубой': '#C3E6FE',
    'бежевый': '#F5DEB3',

    // Оттенки
    'бордовый': '#990C0C',
    'бордо': '#990C0C',
    'марсала': '#800020',
    'пудра': '#E0B6BF',
    'пудровый': '#E0B6BF',
    'нюд': '#E8C4B8',
    'нюдовый': '#E8C4B8',
    'молочный': '#FFFAF0',
    'кремовый': '#FFFDD0',
    'слоновая кость': '#FFFFF0',
    'айвори': '#FFFFF0',
    'персиковый': '#FFDAB9',
    'коралловый': '#FF7F50',
    'лавандовый': '#E6E6FA',
    'сиреневый': '#C8A2C8',
    'оливковый': '#808000',
    'хаки': '#C3B091',
    'бирюзовый': '#40E0D0',
    'индиго': '#4B0082',
    'шоколадный': '#7B3F00',
    'терракотовый': '#CC4E5C',
    'винный': '#722F37',
    'малиновый': '#DC143C',
    'вишневый': '#911F27',
    'вишнёвый': '#911F27',
    'графитовый': '#474747',
    'графит': '#474747',
    'антрацит': '#2C3539',
    'песочный': '#C2B280',
    'золотой': '#FFD700',
    'серебряный': '#C0C0C0',
    'леопардовый': '#A67B5B',

    // Составные
    'тёмно-синий': '#00008B',
    'темно-синий': '#00008B',
    'темно-зеленый': '#006400',
    'тёмно-зелёный': '#006400',
    'светло-розовый': '#FFB6C1',
    'светло-голубой': '#ADD8E6',
    'светло-серый': '#D3D3D3',
    'тёмно-красный': '#8B0000',
    'темно-красный': '#8B0000',

    // Кофейные / кондитерские
    'пыльная роза': '#DCAE96',
    'пыльный розовый': '#DCAE96',
    'карамель': '#C68E5B',
    'карамельный': '#C68E5B',
    'латте': '#C8AD7F',
    'мокко': '#4C3024',
    'капучино': '#A0785A',

    // Ягодные / фруктовые
    'клубничный': '#E8445A',
    'клубника': '#E8445A',
    'малина': '#DC143C',
    'ежевичный': '#4A0040',
    'ежевика': '#4A0040',
    'сливовый': '#673147',
    'слива': '#673147',
    'абрикосовый': '#FBCEB1',
    'лимонный': '#FFF44F',
    'вишня': '#911F27',

    // Природные / ботанические
    'мятный': '#C1F3E3',
    'мята': '#C1F3E3',
    'фисташковый': '#93C572',
    'фисташка': '#93C572',
    'хвойный': '#2F4F2F',
    'изумрудный': '#50C878',
    'травяной': '#4F7942',
    'лесной': '#228B22',
    'морской': '#006994',
    'сапфировый': '#0F52BA',
    'рубиновый': '#E0115F',
    'жемчужный': '#F0EAD6',
    'янтарный': '#FFBF00',
    'коралл': '#FF7F50',

    // Дымчатые / пастельные
    'дымчатый': '#848884',
    'пепельный': '#B2BEB5',
    'пепельно-розовый': '#D4A5A5',
    'лиловый': '#B666D2',
    'фуксия': '#FF00FF',
    'магента': '#FF0090',
    'розовое золото': '#B76E79',
    'шампань': '#F7E7CE',
    'ваниль': '#F3E5AB',
    'ванильный': '#F3E5AB',
    'топленое молоко': '#FAEBD7',
    'тауп': '#483C32',
    'какао': '#5C3317',
    'миндальный': '#EFDECD',
    'миндаль': '#EFDECD',

    // Коммерческие / фирменные
    'розовая смородина': '#FFD6E1',
    'ежевичный бархат': '#160409',
    'спелая малина': '#990C0C',
};

/**
 * Sort size strings: letter sizes from smallest to largest (XXS→XS→S→M→L→XL→XXL),
 * numeric/bra sizes numerically.
 */
const SIZE_ORDER: Record<string, number> = { 'XXS': 0, 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6, 'XXXL': 7 };

export function sortSizes(sizes: string[]): string[] {
    return [...sizes].sort((a, b) => {
        const aOrder = SIZE_ORDER[a.toUpperCase()];
        const bOrder = SIZE_ORDER[b.toUpperCase()];
        if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
        if (aOrder !== undefined) return -1;
        if (bOrder !== undefined) return 1;
        return a.localeCompare(b, undefined, { numeric: true });
    });
}

/**
 * Resolves a color name (Russian or CSS-valid) to a CSS color value.
 * Returns the original string if it looks like a hex/rgb value already.
 */
export function resolveColor(colorName: string): string {
    if (!colorName) return 'transparent';

    // Already a hex or rgb value
    if (colorName.startsWith('#') || colorName.startsWith('rgb')) {
        return colorName;
    }

    const key = colorName.toLowerCase().trim();
    return COLOR_MAP[key] ?? colorName;
}
