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
    'желтый': '#FFD700',
    'жёлтый': '#FFD700',
    'оранжевый': '#FF8C00',
    'розовый': '#FF69B4',
    'фиолетовый': '#8B008B',
    'серый': '#808080',
    'коричневый': '#8B4513',
    'голубой': '#87CEEB',
    'бежевый': '#F5DEB3',

    // Оттенки
    'бордовый': '#800020',
    'бордо': '#800020',
    'марсала': '#800020',
    'пудра': '#E8C4B8',
    'пудровый': '#E8C4B8',
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
    'мятный': '#98FB98',
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
    'тёмно-синий': '#00008B',
    'темно-синий': '#00008B',
    'темно-зеленый': '#006400',
    'тёмно-зелёный': '#006400',
    'светло-розовый': '#FFB6C1',
    'пыльная роза': '#DCAE96',
    'пыльный розовый': '#DCAE96',
    'карамель': '#C68E5B',
    'карамельный': '#C68E5B',
    'латте': '#C8AD7F',
    'мокко': '#4C3024',
    'капучино': '#A0785A',
};

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
