import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        // Маршрут /docs - для работы через Nginx проксирование /api/ -> /
        // Когда пользователь обращается к /api/docs, Nginx проксирует на /docs
        app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: "TochkaLi API Documentation",
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true
            }
        }));
        
        // Основной маршрут для Swagger (на случай прямого доступа)
        app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: "TochkaLi API Documentation",
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true
            }
        }));
        
        // Обработка пути /api/api/docs (для совместимости с Nginx проксированием)
        app.use('/api/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: "TochkaLi API Documentation",
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true
            }
        }));
        
        console.log('✅ Swagger UI configured successfully');
        console.log('   - Available at: /docs (via Nginx: /api/docs)');
        console.log('   - Available at: /api/docs (direct access)');
        console.log('   - Available at: /api/api/docs (for Nginx compatibility)');
    } catch (error) {
        console.error('❌ Error configuring Swagger UI:', error);
    }
};
