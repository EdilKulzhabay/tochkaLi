import axios from "axios";
// Импортируем файл для загрузки глобальных типов Telegram WebApp
import './utils/telegramWebApp';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 1000 * 30,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
    },
});

api.interceptors.request.use((config) => {
    const token = window.localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Добавляем специальные заголовки для Telegram WebView
    if (window.Telegram?.WebApp) {
        config.headers['X-Telegram-WebApp'] = 'true';
        config.headers['X-Telegram-Platform'] = window.Telegram.WebApp.platform || 'unknown';
        
        // Добавляем initData если доступно (для серверной валидации)
        if (window.Telegram.WebApp.initData) {
            config.headers['X-Telegram-Init-Data'] = window.Telegram.WebApp.initData;
        }
    }
    
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Улучшенная обработка ошибок для Telegram WebView
        const isTelegramWebView = window.Telegram?.WebApp !== undefined;
        
        if (isTelegramWebView) {
            console.log('📱 Telegram WebView - Ошибка API:', {
                url: error.config?.url,
                status: error.response?.status,
                message: error.message,
                response: error.response?.data
            });
        }
        
        // Не делаем автоматический редирект при проверке сессии или авторизации
        // Это обрабатывается в AuthContext
        const isAuthCheck = error.config?.url?.includes('/user/me') || 
                           error.config?.url?.includes('/user/check-session');
        
        // Обработка сетевых ошибок (особенно важно для Telegram WebView)
        if (!error.response) {
            console.error('❌ Сетевая ошибка:', error.message);
            if (isTelegramWebView) {
                console.error('⚠️ Возможные причины в Telegram WebView:');
                console.error('1. Проверьте подключение к интернету');
                console.error('2. Проверьте настройки CORS на сервере');
                console.error('3. Проверьте, что сервер доступен из Telegram WebView');
            }
            return Promise.reject(error);
        }
        
        if (error.response && error.response.status === 403 && !isAuthCheck) {
            // Проверяем, не является ли это ошибкой сессии (sessionExpired)
            if (error.response.data?.sessionExpired) {
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                // Не удаляем user для Telegram пользователей (если есть telegramId, но нет токена)
                const telegramId = localStorage.getItem("telegramId");
                if (!telegramId) {
                    localStorage.removeItem("user");
                }
                // Редирект обрабатывается в AuthContext
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;