import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initTelegramWebApp } from './utils/telegramWebApp'

// Инициализируем Telegram WebApp сразу при загрузке приложения
// Это гарантирует, что приложение откроется на весь экран с самого начала
if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    
    // КРИТИЧНО: Вызываем expand() ДО ready() для максимально раннего расширения
    // Это помогает WebApp открыться на весь экран сразу при запуске через web_app кнопку
    try {
        tg.expand();
    } catch (e) {
        // Игнорируем ошибки на этом этапе
    }
    
    // Инициализируем сразу
    initTelegramWebApp();
    
    // Дополнительная инициализация после загрузки DOM для надежности
    document.addEventListener('DOMContentLoaded', () => {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.expand();
            setTimeout(() => {
                if (window.Telegram?.WebApp && !window.Telegram.WebApp.isExpanded) {
                    window.Telegram.WebApp.expand();
                }
            }, 100);
        }
    });
    
    // Также проверяем после полной загрузки страницы
    window.addEventListener('load', () => {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.expand();
            setTimeout(() => {
                if (window.Telegram?.WebApp && !window.Telegram.WebApp.isExpanded) {
                    window.Telegram.WebApp.expand();
                }
            }, 200);
        }
    });
    
    // Обработчик для события viewportChanged - расширяем при любых изменениях
    tg.onEvent('viewportChanged', () => {
        setTimeout(() => {
            if (window.Telegram?.WebApp && !window.Telegram.WebApp.isExpanded) {
                window.Telegram.WebApp.expand();
            }
        }, 50);
    });
}

createRoot(document.getElementById('root')!).render(
    <App />
)
