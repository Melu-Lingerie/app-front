import path from 'path';
import { fileURLToPath } from 'url';
import { rimraf } from 'rimraf';
import fs from 'fs';
import OpenAPI from 'openapi-typescript-codegen';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const output = path.resolve(__dirname, './src/api');

    // 1. 🧹 Очистка старого SDK
    await rimraf(output);
    console.log('🧹 Папка src/api очищена');

    // 2. 📦 Генерация нового SDK
    await OpenAPI.generate({
        input: 'http://51.250.69.176:8082/v3/api-docs',
        output,
        httpClient: 'axios',
        useUnionTypes: true,
    });
    console.log('📦 SDK сгенерирован');

    // 3. 🔧 Настройка OpenAPI.ts
    const openApiFile = path.join(output, 'core/OpenAPI.ts');
    let openApiContent = fs.readFileSync(openApiFile, 'utf-8');
    openApiContent = openApiContent
        .replace(/BASE:\s*['"].*?['"]/, "BASE: ''")
        .replace(/WITH_CREDENTIALS:\s*(false|true)/, 'WITH_CREDENTIALS: true');
    fs.writeFileSync(openApiFile, openApiContent, 'utf-8');
    console.log('🔧 OpenAPI.ts обновлён (BASE="", WITH_CREDENTIALS=true)');

    // 4. 🧩 Патчим core/request.ts
    const requestFile = path.join(output, 'core/request.ts');
    let requestContent = fs.readFileSync(requestFile, 'utf-8');

    // добавляем импорт api
    if (!requestContent.includes("import api from '../../axios/api'")) {
        requestContent = requestContent.replace(
            /import\s+type\s+\{[^}]+\}\s+from\s+['"]axios['"];/,
            match => match + "\nimport api from '../../axios/api';"
        );
    }

    // меняем дефолтный axiosClient = axios → api
    requestContent = requestContent.replace(
        /axiosClient:\s*AxiosInstance\s*=\s*axios/,
        'axiosClient: AxiosInstance = api'
    );

    // 🧩 Добавляем поддержку signal в sendRequest()
    if (!requestContent.includes('signal: options.signal')) {
        requestContent = requestContent.replace(
            /const requestConfig: AxiosRequestConfig = {([\s\S]*?)cancelToken: source.token,/,
            `const requestConfig: AxiosRequestConfig = {$1cancelToken: source.token,
        signal: options.signal,`
        );
        console.log('🧩 Добавлена поддержка options.signal в sendRequest()');
    }

    fs.writeFileSync(requestFile, requestContent, 'utf-8');
    console.log('🔄 core/request.ts переключён на src/axios/api.ts');

    // 5. ✂️ Удаляем /api/v1 в сервисах и добавляем поддержку signal
    const servicesPath = path.join(output, 'services');
    fs.readdirSync(servicesPath).forEach((file) => {
        const serviceFile = path.join(servicesPath, file);
        let content = fs.readFileSync(serviceFile, 'utf-8');

        // заменяем '/api/v1/... → '/...'
        content = content.replace(/'\/api\/v1\//g, "'/");

        // 🧩 добавляем импорт ApiRequestOptions
        if (!content.includes("import type { ApiRequestOptions } from '../core/ApiRequestOptions'")) {
            content = content.replace(
                /import\s+\{\s*OpenAPI\s*\}\s+from\s+'..\/core\/OpenAPI';/,
                `import { OpenAPI } from '../core/OpenAPI';\nimport type { ApiRequestOptions } from '../core/ApiRequestOptions';`
            );
        }

        // 🧩 расширяем сигнатуры методов
        content = content.replace(
            /(public static [\w\d_]+\([^)]*)\)/g,
            '$1 options?: Partial<ApiRequestOptions>)'
        );

        // 🧩 пробрасываем signal в __request
        content = content.replace(
            /__request\(OpenAPI,\s*\{/g,
            '__request(OpenAPI, { ...options,'
        );

        fs.writeFileSync(serviceFile, content, 'utf-8');
    });
    console.log('✅ Добавлена поддержка options.signal во все сервисы');

    // 6. 🧩 Добавляем signal в core/ApiRequestOptions.ts
    const apiRequestOptionsFile = path.join(output, 'core/ApiRequestOptions.ts');
    if (fs.existsSync(apiRequestOptionsFile)) {
        let apiOptionsContent = fs.readFileSync(apiRequestOptionsFile, 'utf-8');

        if (!apiOptionsContent.includes('signal?: AbortSignal')) {
            apiOptionsContent = apiOptionsContent.replace(
                /readonly errors\?: Record<number, string>;/,
                `readonly errors?: Record<number, string>;\n\n    /**
     * AbortController signal для отмены запросов
     */
    signal?: AbortSignal;`
            );

            fs.writeFileSync(apiRequestOptionsFile, apiOptionsContent, 'utf-8');
            console.log('🧩 Добавлено поле signal в ApiRequestOptions.ts');
        } else {
            console.log('ℹ️ signal уже есть в ApiRequestOptions.ts');
        }
    }

    console.log('✅ Генерация API завершена с поддержкой AbortController');
}

main().catch((err) => {
    console.error('❌ Ошибка генерации API:', err);
    process.exit(1);
});
