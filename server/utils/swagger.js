import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Пароль для доступа к Swagger (из env файла)
const swaggerPassword = process.env.SWAGGER_PASSWORD || 'admin123';
const swaggerAuthSessions = new Set(); // Простое хранилище сессий в памяти

// Middleware для проверки доступа к Swagger
export const swaggerAuthMiddleware = (req, res, next) => {
    const sessionId = req.cookies?.swagger_session;
    
    // Если есть валидная сессия, разрешаем доступ
    if (sessionId && swaggerAuthSessions.has(sessionId)) {
        return next();
    }
    
    // Получаем полный путь
    const fullPath = req.originalUrl || req.path;
    
    // Разрешаем доступ к статическим файлам Swagger UI (CSS, JS, изображения)
    if (fullPath.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/i) || 
        fullPath.includes('/swagger-ui') || 
        fullPath.includes('/swagger-ui-bundle') ||
        fullPath.includes('/swagger-ui-standalone')) {
        return next();
    }
    
    // Если это запрос на проверку пароля, пропускаем
    if (fullPath.includes('/swagger-auth/check')) {
        return next();
    }
    
    // Для всех остальных запросов показываем страницу с модальным окном
    const currentPath = fullPath.replace(/\/$/, ''); // Убираем trailing slash
    return res.send(getSwaggerAuthPage(currentPath));
};

// Функция для получения HTML страницы с модальным окном
const getSwaggerAuthPage = (redirectPath) => {
    return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Swagger UI - Авторизация</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #1a1a1a;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        }
        
        .modal-container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            width: 100%;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
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
        
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .error {
            color: #e74c3c;
            margin-top: 10px;
            text-align: center;
            font-size: 14px;
            display: none;
        }
        
        .error.show {
            display: block;
        }
        
        .loading {
            display: none;
            text-align: center;
            color: #667eea;
            margin-top: 10px;
        }
        
        .loading.show {
            display: block;
        }
    </style>
</head>
<body>
    <div class="modal-overlay" id="modalOverlay">
        <div class="modal-container">
            <h1>🔐 Swagger UI</h1>
            <form id="authForm">
                <div class="form-group">
                    <label for="password">Пароль:</label>
                    <input type="password" id="password" name="password" required autofocus>
                </div>
                <div class="error" id="errorMessage">Неверный пароль</div>
                <div class="loading" id="loading">Проверка...</div>
                <button type="submit" id="submitBtn">Войти</button>
            </form>
        </div>
    </div>
    
    <script>
        const form = document.getElementById('authForm');
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('errorMessage');
        const loading = document.getElementById('loading');
        const submitBtn = document.getElementById('submitBtn');
        const modalOverlay = document.getElementById('modalOverlay');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = passwordInput.value;
            
            // Показываем загрузку
            loading.classList.add('show');
            errorMessage.classList.remove('show');
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/swagger-auth/check', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Успешная авторизация - скрываем модальное окно и перезагружаем страницу
                    modalOverlay.style.display = 'none';
                    window.location.reload();
                } else {
                    // Ошибка авторизации
                    errorMessage.classList.add('show');
                    passwordInput.value = '';
                    passwordInput.focus();
                }
            } catch (error) {
                console.error('Ошибка:', error);
                errorMessage.textContent = 'Ошибка соединения. Попробуйте еще раз.';
                errorMessage.classList.add('show');
            } finally {
                loading.classList.remove('show');
                submitBtn.disabled = false;
            }
        });
        
        // Фокус на поле ввода при загрузке
        passwordInput.focus();
    </script>
</body>
</html>
    `;
};

// Обработчик проверки пароля
export const handleSwaggerAuthCheck = (req, res) => {
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
        
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Неверный пароль' });
    }
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
        // Маршрут /docs - для работы через Nginx проксирование /api/ -> /
        // Когда пользователь обращается к /api/docs, Nginx проксирует на /docs
        app.use('/docs', swaggerAuthMiddleware, swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: "TochkaLi API Documentation",
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true
            }
        }));
        
        // Основной маршрут для Swagger (на случай прямого доступа)
        app.use('/api/docs', swaggerAuthMiddleware, swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: "TochkaLi API Documentation",
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true
            }
        }));
        
        // Обработка пути /api/api/docs (для совместимости с Nginx проксированием)
        app.use('/api/api/docs', swaggerAuthMiddleware, swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: "TochkaLi API Documentation",
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true
            }
        }));
        
        console.log('✅ Swagger UI configured successfully with password protection');
        console.log('   - Available at: /docs (via Nginx: /api/docs)');
        console.log('   - Available at: /api/docs (direct access)');
        console.log('   - Available at: /api/api/docs (for Nginx compatibility)');
    } catch (error) {
        console.error('❌ Error configuring Swagger UI:', error);
    }
};
