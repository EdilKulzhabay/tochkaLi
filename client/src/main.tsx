import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initTelegramWebApp } from './utils/telegramWebApp'

// Инициализируем Telegram WebApp сразу при загрузке приложения
// Это гарантирует, что приложение откроется на весь экран с самого начала
if (window.Telegram?.WebApp) {
    // Инициализируем сразу
    initTelegramWebApp();
    
    // Дополнительная инициализация после загрузки DOM для надежности
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.Telegram?.WebApp && !window.Telegram.WebApp.isExpanded) {
                window.Telegram.WebApp.expand();
            }
        }, 100);
    });
    
    // Также проверяем после полной загрузки страницы
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (window.Telegram?.WebApp && !window.Telegram.WebApp.isExpanded) {
                window.Telegram.WebApp.expand();
            }
        }, 200);
    });
}

createRoot(document.getElementById('root')!).render(
    <App />
)
