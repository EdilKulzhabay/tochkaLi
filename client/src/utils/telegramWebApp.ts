// Утилита для работы с Telegram WebApp API

// Типы для Telegram WebApp API
declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                ready: () => void;
                expand: () => void;
                isExpanded: boolean;
                enableClosingConfirmation: () => void;
                disableClosingConfirmation: () => void;
                onEvent: (eventType: string, eventHandler: () => void) => void;
                offEvent: (eventType: string, eventHandler: () => void) => void;
                version: string;
                platform: string;
                initData?: string;
                initDataUnsafe?: {
                    user?: {
                        id: number;
                        first_name?: string;
                        last_name?: string;
                        username?: string;
                    };
                };
                BackButton?: {
                    show: () => void;
                    hide: () => void;
                    onClick: (callback: () => void) => void;
                    offClick: (callback: () => void) => void;
                    isVisible: boolean;
                };
            };
        };
    }
}

/**
 * Инициализирует Telegram WebApp и расширяет его на весь экран
 */
export const initTelegramWebApp = () => {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Инициализируем WebApp
        tg.ready();
        
        // Расширяем на весь экран СРАЗУ после ready()
        // Это критично для автоматического открытия на весь экран при запуске через web_app кнопку
        try {
            // Вызываем expand() немедленно
            tg.expand();
            
            // Множественные вызовы для гарантии полноэкранного режима
            // Telegram иногда требует несколько попыток для корректного расширения
            setTimeout(() => {
                tg.expand();
            }, 50);
            
            setTimeout(() => {
                if (!tg.isExpanded) {
                    tg.expand();
                }
            }, 150);
            
            setTimeout(() => {
                if (!tg.isExpanded) {
                    tg.expand();
                }
            }, 300);
        } catch (error) {
            console.warn('⚠️ Ошибка при расширении Telegram WebApp:', error);
        }
        
        // Отключаем подтверждение закрытия (будем обрабатывать через навигацию)
        tg.disableClosingConfirmation();
        
        console.log('✅ Telegram WebApp инициализирован:', {
            version: tg.version,
            platform: tg.platform,
            isExpanded: tg.isExpanded
        });
        
        return tg;
    }
    
    return null;
};

/**
 * Настраивает обработку кнопки "Назад" в Telegram WebView
 * Вместо закрытия приложения использует навигацию назад через React Router
 */
export const setupTelegramBackButton = (onBack: () => void) => {
    if (window.Telegram?.WebApp?.BackButton) {
        const backButton = window.Telegram.WebApp.BackButton;
        
        // Показываем кнопку "Назад"
        backButton.show();
        
        // Обрабатываем клик на кнопку "Назад"
        backButton.onClick(() => {
            onBack();
        });
        
        return () => {
            // Очистка обработчика при размонтировании
            backButton.offClick(() => {
                onBack();
            });
            backButton.hide();
        };
    }
    
    return () => {};
};

/**
 * Скрывает кнопку "Назад" в Telegram WebView
 */
export const hideTelegramBackButton = () => {
    if (window.Telegram?.WebApp?.BackButton) {
        window.Telegram.WebApp.BackButton.hide();
    }
};

/**
 * Показывает кнопку "Назад" в Telegram WebView
 */
export const showTelegramBackButton = () => {
    if (window.Telegram?.WebApp?.BackButton) {
        window.Telegram.WebApp.BackButton.show();
    }
};

/**
 * Проверяет, запущено ли приложение в Telegram WebView
 */
export const isTelegramWebView = (): boolean => {
    return window.Telegram?.WebApp !== undefined;
};

