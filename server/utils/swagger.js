import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Функция для получения базового URL Swagger
// Всегда использует api.portal.tochkali.com
export const getSwaggerBaseUrl = (req, path = '/api/docs') => {
    // Всегда используем api.portal.tochkali.com для Swagger
    const host = 'api.portal.tochkali.com';
    // Определяем протокол
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http') || 'https';
    return `${protocol}://${host}${path}`;
};

// Middleware для редиректа с portal.tochkali.com на api.portal.tochkali.com для Swagger
export const swaggerRedirectMiddleware = (req, res, next) => {
    const host = req.headers['x-forwarded-host'] || req.headers.host || '';
    const fullPath = req.originalUrl || req.path;
    
    // Если запрос пришел на portal.tochkali.com (без api.) и путь связан со Swagger, редиректим на api.portal.tochkali.com
    if (host.includes('portal.tochkali.com') && !host.includes('api.portal.tochkali.com')) {
        if (fullPath.includes('/api/docs') || fullPath.includes('/api/api/docs')) {
            // Определяем правильный путь
            let swaggerPath = fullPath;
            
            // Заменяем /api/api/docs на /api/docs
            if (swaggerPath.includes('/api/api/docs')) {
                swaggerPath = swaggerPath.replace('/api/api/docs', '/api/docs');
            }
            
            // Если путь не начинается с /api/docs, но содержит /api/docs, берем часть после /api/docs
            if (!swaggerPath.startsWith('/api/docs')) {
                const docsIndex = swaggerPath.indexOf('/api/docs');
                if (docsIndex !== -1) {
                    swaggerPath = swaggerPath.substring(docsIndex);
                } else {
                    // Если не нашли /api/docs, используем базовый путь
                    swaggerPath = '/api/docs';
                }
            }
            
            // Сохраняем query параметры если есть
            const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
            const redirectUrl = getSwaggerBaseUrl(req, swaggerPath + queryString);
            console.log(`🔄 Redirecting from ${host}${fullPath} to ${redirectUrl}`);
            return res.redirect(301, redirectUrl);
        }
    }
    
    next();
};

// Функция для настройки Swagger UI
export const setupSwagger = (app) => {
    // Загружаем Swagger документ
    let swaggerDocument;
    try {
        swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
        console.log('✅ Swagger document loaded successfully');
    } catch (error) {
        console.error('❌ Error loading Swagger document:', error);
        // Создаем базовый документ, если не удалось загрузить файл
        swaggerDocument = { 
            openapi: '3.0.0',
            info: { title: 'TochkaLi API', version: '1.0.0', description: 'API documentation' },
            paths: {}
        };
    }

    // Настройка Swagger UI с обработкой ошибок
    try {
        app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: "TochkaLi API Documentation",
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true
            }
        }));
        console.log('✅ Swagger UI configured successfully at /api/docs');
    } catch (error) {
        console.error('❌ Error configuring Swagger UI:', error);
    }
};
