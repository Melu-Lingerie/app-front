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
        port: 80, // порт разработки
        host: true,
        proxy: {
            '/api': {
                target: 'http://51.250.69.176:8080', // адрес вашего бэкенда
                changeOrigin: true,
                secure: false,
            }
        }
    },
    build: {
        outDir: 'dist', // директория для сборки
        assetsDir: 'assets', // директория для статических файлов
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    }
});
