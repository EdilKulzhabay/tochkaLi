import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { initTelegramWebApp, setupTelegramBackButton, isTelegramWebView } from '../utils/telegramWebApp';

/**
 * Компонент для обработки Telegram WebApp событий
 * Должен использоваться ВНУТРИ RouterProvider
 * - Расширяет приложение на весь экран при загрузке
 * - Обрабатывает кнопку "Назад" и свайп - использует навигацию вместо закрытия приложения
 */
export const TelegramWebAppHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Инициализируем Telegram WebApp только если мы в Telegram WebView
        if (!isTelegramWebView()) {
            return;
        }

        // Инициализируем и расширяем на весь экран
        const tg = initTelegramWebApp();
        if (!tg) {
            return;
        }

        // Обрабатываем кнопку "Назад" и свайп
        const cleanup = setupTelegramBackButton(() => {
            // Если есть история для возврата назад, используем навигацию
            if (window.history.length > 1) {
                navigate(-1);
            } else {
                // Если истории нет, переходим на главную страницу
                navigate('/main');
            }
        });

        // Обрабатываем событие изменения viewport (может происходить при свайпе)
        const handleViewportChanged = () => {
            // Если приложение свернулось, расширяем его обратно
            if (tg && !tg.isExpanded) {
                tg.expand();
            }
        };

        tg.onEvent('viewportChanged', handleViewportChanged);

        // Очистка при размонтировании
        return () => {
            cleanup();
            tg.offEvent('viewportChanged', handleViewportChanged);
        };
    }, [navigate]);

    // Управляем видимостью кнопки "Назад" в зависимости от текущего маршрута
    useEffect(() => {
        if (!isTelegramWebView()) {
            return;
        }

        const tg = window.Telegram?.WebApp;
        if (!tg?.BackButton) {
            return;
        }

        // Показываем кнопку "Назад" если мы не на главной странице
        const isMainPage = location.pathname === '/main' || 
                          location.pathname === '/' || 
                          location.pathname === '/welcome';
        
        if (isMainPage) {
            tg.BackButton.hide();
        } else {
            tg.BackButton.show();
        }
    }, [location.pathname]);

    return null;
};

