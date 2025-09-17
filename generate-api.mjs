import path from 'path';
import { fileURLToPath } from 'url';
import { rimraf } from 'rimraf';
import fs from 'fs';
import OpenAPI from 'openapi-typescript-codegen';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const output = path.resolve(__dirname, './src/api');

    // 1. Очистка папки
    await rimraf(output);
    console.log('🧹 Папка src/api очищена');

    // 2. Генерация SDK
    await OpenAPI.generate({
        input: 'http://51.250.69.176:8080/v3/api-docs',
        output,
        httpClient: 'axios',
        useUnionTypes: true,
    });
    console.log('📦 SDK сгенерирован');

    // 3. Фиксим OpenAPI.ts
    const openApiFile = path.join(output, 'core/OpenAPI.ts');
    let openApiContent = fs.readFileSync(openApiFile, 'utf-8');
    openApiContent = openApiContent
        .replace(/BASE:\s*['"].*?['"]/, "BASE: ''")
        .replace(/WITH_CREDENTIALS:\s*(false|true)/, 'WITH_CREDENTIALS: true');
    fs.writeFileSync(openApiFile, openApiContent, 'utf-8');
    console.log('🔧 OpenAPI.ts обновлён (BASE=\"\", WITH_CREDENTIALS=true)');

    // 4. Патчим core/request.ts
    const requestFile = path.join(output, 'core/request.ts');
    let requestContent = fs.readFileSync(requestFile, 'utf-8');

    // добавляем импорт api (если ещё нет)
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

    fs.writeFileSync(requestFile, requestContent, 'utf-8');
    console.log('🔄 core/request.ts переключён на src/axios/api.ts');

// 5. Чистим /api/v1 в сервисах
    const servicesPath = path.join(output, 'services');
    fs.readdirSync(servicesPath).forEach((file) => {
        const serviceFile = path.join(servicesPath, file);
        let content = fs.readFileSync(serviceFile, 'utf-8');

        // заменяем '/api/v1/... → '/...'
        content = content.replace(/'\/api\/v1\//g, "'/");

        fs.writeFileSync(serviceFile, content, 'utf-8');
    });
    console.log('✂️ Удалён префикс /api/v1 из урлов сервисов');

}

main().catch((err) => {
    console.error('❌ Ошибка генерации API:', err);
    process.exit(1);
});
