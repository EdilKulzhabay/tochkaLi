import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initTelegramWebApp } from './utils/telegramWebApp'

// Инициализируем Telegram WebApp сразу при загрузке приложения
// Это гарантирует, что приложение откроется на весь экран с самого начала
if (window.Telegram?.WebApp) {
    initTelegramWebApp();
}

createRoot(document.getElementById('root')!).render(
    <App />
)
