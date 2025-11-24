import axios from "axios";

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
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Не делаем автоматический редирект при проверке сессии или авторизации
        // Это обрабатывается в AuthContext
        const isAuthCheck = error.config?.url?.includes('/user/me') || 
                           error.config?.url?.includes('/user/check-session');
        
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