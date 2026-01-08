import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware для защиты Swagger UI паролем
const swaggerPassword = process.env.SWAGGER_PASSWORD || 'admin123';
const swaggerAuthSessions = new Set(); // Простое хранилище сессий в памяти

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

// Middleware для проверки доступа к Swagger
export const swaggerAuthMiddleware = (req, res, next) => {
    const sessionId = req.cookies?.swagger_session;
    
    // Если есть валидная сессия, разрешаем доступ
    if (sessionId && swaggerAuthSessions.has(sessionId)) {
        return next();
    }
    
    // Получаем относительный путь от /api/docs
    // req.path будет содержать путь относительно /api/docs, например '/login' или '/'
    const relativePath = req.path || '/';
    const fullPath = req.originalUrl || req.path;
    
    // Разрешаем доступ к статическим файлам Swagger UI (CSS, JS, изображения)
    // Эти файлы необходимы для работы Swagger UI
    if (fullPath.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i) || 
        fullPath.includes('/swagger-ui') || 
        fullPath.includes('/swagger-ui-bundle') ||
        fullPath.includes('/swagger-ui-standalone')) {
        return next();
    }
    
    // Если это запрос на страницу входа или корневой путь, показываем форму
    // Также проверяем полный путь для совместимости
    if (relativePath === '/login' || relativePath === '/' || fullPath === '/api/docs/login' || fullPath === '/api/docs' || fullPath.endsWith('/api/docs') || fullPath.includes('/api/api/docs')) {
        // Всегда используем полный URL с api.portal.tochkali.com для формы
        const swaggerLoginUrl = getSwaggerBaseUrl(req, '/api/docs/login');
        
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Swagger UI - Вход</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }
                    .login-container {
                        background: white;
                        padding: 40px;
                        border-radius: 12px;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                        width: 100%;
                        max-width: 400px;
                    }
                    h1 {
                        margin: 0 0 30px 0;
                        color: #333;
                        text-align: center;
                        font-size: 28px;
                    }
                    .form-group {
                        margin-bottom: 20px;
                    }
                    label {
                        display: block;
                        margin-bottom: 8px;
                        color: #555;
                        font-weight: 500;
                    }
                    input[type="password"] {
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e0e0e0;
                        border-radius: 8px;
                        font-size: 16px;
                        box-sizing: border-box;
                        transition: border-color 0.3s;
                    }
                    input[type="password"]:focus {
                        outline: none;
                        border-color: #667eea;
                    }
                    button {
                        width: 100%;
                        padding: 12px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.2s, box-shadow 0.2s;
                    }
                    button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
                    }
                    button:active {
                        transform: translateY(0);
                    }
                    .error {
                        color: #e74c3c;
                        margin-top: 10px;
                        text-align: center;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="login-container">
                    <h1>🔐 Swagger UI</h1>
                    <form method="POST" action="${swaggerLoginUrl}">
                        <div class="form-group">
                            <label for="password">Пароль:</label>
                            <input type="password" id="password" name="password" required autofocus>
                        </div>
                        ${req.query.error ? '<div class="error">Неверный пароль</div>' : ''}
                        <button type="submit">Войти</button>
                    </form>
                </div>
            </body>
            </html>
        `);
    }
    
    // Для всех остальных запросов редиректим на страницу входа
    // Всегда используем api.portal.tochkali.com/api/docs/login
    const loginUrl = getSwaggerBaseUrl(req, '/api/docs/login');
    res.redirect(loginUrl);
};

// Функция обработки входа в Swagger
export const handleSwaggerLogin = (req, res) => {
    const { password } = req.body;
    
    if (password === swaggerPassword) {
        // Создаем сессию
        const sessionId = crypto.randomBytes(32).toString('hex');
        swaggerAuthSessions.add(sessionId);
        
        // Устанавливаем cookie с сессией
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('swagger_session', sessionId, {
            httpOnly: true,
            secure: isProduction,
            maxAge: 24 * 60 * 60 * 1000, // 24 часа
            sameSite: isProduction ? 'none' : 'lax'
        });
        
        // Редирект на api.portal.tochkali.com/api/docs
        const redirectUrl = getSwaggerBaseUrl(req, '/api/docs');
        res.redirect(redirectUrl);
    } else {
        // Редирект на страницу входа с ошибкой
        const loginUrl = getSwaggerBaseUrl(req, '/api/docs/login?error=1');
        res.redirect(loginUrl);
    }
};

// Функция обработки выхода из Swagger
export const handleSwaggerLogout = (req, res) => {
    const sessionId = req.cookies?.swagger_session;
    if (sessionId) {
        swaggerAuthSessions.delete(sessionId);
    }
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('swagger_session', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax'
    });
    // Редирект на страницу входа на api.portal.tochkali.com
    const loginUrl = getSwaggerBaseUrl(req, '/api/docs/login');
    res.redirect(loginUrl);
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
        app.use('/api/docs', swaggerAuthMiddleware, swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: "TochkaLi API Documentation",
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true
            }
        }));
        console.log('✅ Swagger UI configured successfully');
    } catch (error) {
        console.error('❌ Error configuring Swagger UI:', error);
    }
};

