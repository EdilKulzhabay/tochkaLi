// Утилита для работы с Telegram WebApp API
import { useEffect } from 'react';

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
                enableVerticalSwipes: () => void;
                disableVerticalSwipes: () => void;
                onEvent: (eventType: string, eventHandler: () => void) => void;
                offEvent: (eventType: string, eventHandler: () => void) => void;
                version: string;
                platform: string;
                viewport?: {
                    safeArea?: {
                        top?: number;
                        bottom?: number;
                        left?: number;
                        right?: number;
                    };
                };
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
 * Гарантирует полную высоту на всех платформах (Android, iOS, Desktop, Web)
 */
export const initTelegramWebApp = () => {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // 1. Вызываем ready() - обязательный вызов для инициализации WebApp
        tg.ready();
        
        // 2. Расширяем на весь экран СРАЗУ после ready()
        // Это критично для автоматического открытия на весь экран при запуске через web_app кнопку
        try {
            // Вызываем expand() немедленно
            tg.expand();
            
            // Множественные вызовы для гарантии полноэкранного режима
            // Telegram иногда требует несколько попыток для корректного расширения
            setTimeout(() => {
                if (!tg.isExpanded) {
                    tg.expand();
                }
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
            
            // Дополнительная проверка через 500ms
            setTimeout(() => {
                if (!tg.isExpanded) {
                    tg.expand();
                }
            }, 500);
        } catch (error) {
            console.warn('⚠️ Ошибка при расширении Telegram WebApp:', error);
        }
        
        // 3. Отключаем вертикальные свайпы для предотвращения случайного закрытия приложения
        // Это критично для приложений с длинным контентом и прокруткой
        // Без этого пользователи могут случайно закрыть приложение при прокрутке вниз
        try {
            if (tg.disableVerticalSwipes) {
                tg.disableVerticalSwipes();
            }
        } catch (error) {
            console.warn('⚠️ Ошибка при отключении вертикальных свайпов:', error);
        }
        
        // 4. Обрабатываем событие viewportChanged для поддержания полной высоты
        // Это важно для случаев, когда размер viewport изменяется
        tg.onEvent('viewportChanged', () => {
            if (!tg.isExpanded) {
                tg.expand();
            }
        });
        
        // 5. Отключаем подтверждение закрытия (будем обрабатывать через навигацию)
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

/**
 * React хук для настройки Telegram WebApp fullscreen режима
 * Заполняет CSS переменные --tg-safe-* из Telegram API viewport.safeArea
 * Должен использоваться в корневом компоненте App
 */
export const useTelegramFullscreen = () => {
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        tg.ready();
        tg.expand();

        const apply = () => {
            const safe = tg.viewport?.safeArea || {};
            document.documentElement.style.setProperty("--tg-safe-top", `${safe.top || 0}px`);
            document.documentElement.style.setProperty("--tg-safe-bottom", `${safe.bottom || 0}px`);
            document.documentElement.style.setProperty("--tg-safe-left", `${safe.left || 0}px`);
            document.documentElement.style.setProperty("--tg-safe-right", `${safe.right || 0}px`);
        };

        apply();

        tg.onEvent?.("viewportChanged", apply);

        return () => {
            tg.offEvent?.("viewportChanged", apply);
        };
    }, []);
};

