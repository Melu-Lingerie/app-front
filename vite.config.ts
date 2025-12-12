import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import * as path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss()
    ],
    server: {
        port: 3000, // порт разработки
        host: true,
        proxy: {
            '/api': {
                target: 'https://melu-bra.ru',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    build: {
        outDir: 'dist', // директория для сборки
        assetsDir: 'assets', // директория для статических файлов,
        rollupOptions: {
            output: {
                // Чуть аккуратнее с ассетами, чтобы шрифты не "терялись"
                assetFileNames: (assetInfo) => {
                    if (/\.woff2?$/.test(assetInfo.name ?? '')) {
                        return 'assets/fonts/[name][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                },
            },
        },
    }
});
