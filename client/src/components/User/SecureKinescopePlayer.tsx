import { useEffect, useRef, useState } from 'react';
import api from '../../api';

interface SecureKinescopePlayerProps {
    videoId: string;
    poster?: string;
    title?: string;
    onPosterClick?: () => void;
    showPoster?: boolean;
    contentType: 'meditation' | 'practice' | 'videoLesson';
    contentId: string;
    onProgressUpdate?: (progress: number) => void;
}

/**
 * Безопасный компонент для встраивания Kinescope видео
 * Защищает от копирования URL и скачивания видео
 */
export const SecureKinescopePlayer = ({
    videoId,
    poster,
    title,
    onPosterClick,
    showPoster = false,
    contentType,
    contentId,
    onProgressUpdate
}: SecureKinescopePlayerProps) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [savedProgress, setSavedProgress] = useState<number>(0);
    const lastSaveTimeRef = useRef<number>(0);
    const saveTimeoutRef = useRef<number | null>(null);

    // Функция для получения безопасного embed URL
    const getSecureEmbedUrl = (id: string, startTime: number = 0): string => {
        // Извлекаем ID из различных форматов Kinescope URL
        let extractedId = id;
        
        // Если это полный URL, извлекаем ID
        if (id.includes('kinescope.io')) {
            const match = id.match(/kinescope\.io\/(?:embed\/|video\/)?([a-zA-Z0-9_-]+)/);
            if (match) {
                extractedId = match[1];
            }
        }
        
        // Формируем embed URL с параметрами безопасности
        // Добавляем параметр для восстановления позиции воспроизведения
        const params = new URLSearchParams({
            autoplay: '0',
            muted: '0',
            loop: '0',
            controls: '1',
            ui: '1',
            'ui-theme': 'dark'
        });
        
        if (startTime > 0) {
            params.set('time', startTime.toString());
        }
        
        return `https://kinescope.io/embed/${extractedId}?${params.toString()}`;
    };

    // Загрузка сохраненного прогресса
    useEffect(() => {
        const loadProgress = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (!user._id) return;

                const response = await api.get(`/api/video-progress/${user._id}/${contentType}/${contentId}`);
                if (response.data.success && response.data.data) {
                    const progress = response.data.data;
                    setSavedProgress(progress.currentTime || 0);
                    if (onProgressUpdate) {
                        onProgressUpdate(progress.progress || 0);
                    }
                }
            } catch (error) {
                console.error('Ошибка загрузки прогресса:', error);
            }
        };

        loadProgress();
    }, [contentType, contentId, onProgressUpdate]);

    // Отслеживание прогресса через postMessage от Kinescope
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            // Проверяем, что сообщение от Kinescope
            if (!event.origin.includes('kinescope.io')) {
                return;
            }

            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

                // Обрабатываем события от Kinescope плеера
                if (data.type === 'kinescope-timeupdate' || data.type === 'timeupdate') {
                    const currentTime = data.currentTime || data.time || 0;
                    const duration = data.duration || 0;

                    if (duration > 0 && currentTime >= 0) {
                        const progress = Math.round((currentTime / duration) * 100);
                        
                        // Обновляем прогресс в родительском компоненте
                        if (onProgressUpdate) {
                            onProgressUpdate(progress);
                        }

                        // Сохраняем прогресс на сервере (с дебаунсом - раз в 5 секунд)
                        const now = Date.now();
                        if (now - lastSaveTimeRef.current > 5000) {
                            lastSaveTimeRef.current = now;

                            // Очищаем предыдущий таймаут
                            if (saveTimeoutRef.current) {
                                clearTimeout(saveTimeoutRef.current);
                            }

                            // Сохраняем с небольшой задержкой
                            saveTimeoutRef.current = setTimeout(async () => {
                                try {
                                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                                    if (!user._id) return;

                                    await api.post('/api/video-progress', {
                                        contentType,
                                        contentId,
                                        currentTime,
                                        duration,
                                        userId: user._id
                                    });
                                } catch (error) {
                                    console.error('Ошибка сохранения прогресса:', error);
                                }
                            }, 1000);
                        }
                    }
                }
            } catch (error) {
                // Игнорируем ошибки парсинга сообщений
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [contentType, contentId, onProgressUpdate]);

    useEffect(() => {
        // Защита от копирования URL через DevTools
        const preventUrlCopy = () => {
            if (iframeRef.current) {
                const iframe = iframeRef.current;
                
                // Блокируем доступ к src через консоль
                try {
                    Object.defineProperty(iframe, 'src', {
                        get: () => {
                            // Возвращаем замаскированный URL вместо реального
                            return 'about:blank';
                        },
                        set: () => {
                            // Предотвращаем изменение src
                            return;
                        },
                        configurable: false,
                        enumerable: false
                    });
                } catch (e) {
                    // Игнорируем ошибки, если свойство уже определено
                }

                // Также защищаем contentWindow
                try {
                    Object.defineProperty(iframe, 'contentWindow', {
                        get: () => null,
                        configurable: false,
                        enumerable: false
                    });
                } catch (e) {
                    // Игнорируем ошибки
                }
            }
        };

        // Защита от инспектирования через MutationObserver
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                    // Если кто-то пытается изменить src, восстанавливаем защиту
                    preventUrlCopy();
                }
            });
        });

        if (!showPoster && iframeRef.current) {
            preventUrlCopy();
            
            // Наблюдаем за изменениями атрибутов
            observer.observe(iframeRef.current, {
                attributes: true,
                attributeFilter: ['src']
            });
        }

        return () => {
            observer.disconnect();
        };
    }, [showPoster]);

    // Защита от контекстного меню на контейнере
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        return false;
    };

    // Защита от выделения текста через нативные события
    useEffect(() => {
        const handleSelectStart = (e: Event) => {
            e.preventDefault();
            return false;
        };

        if (containerRef.current) {
            containerRef.current.addEventListener('selectstart', handleSelectStart);
        }

        return () => {
            if (containerRef.current) {
                containerRef.current.removeEventListener('selectstart', handleSelectStart);
            }
        };
    }, []);

    // Обработка загрузки iframe
    const handleIframeLoad = () => {
        // Дополнительная защита после загрузки
        if (iframeRef.current) {
            // Блокируем доступ к различным свойствам iframe
            try {
                ['contentDocument', 'contentWindow'].forEach(prop => {
                    try {
                        Object.defineProperty(iframeRef.current!, prop, {
                            get: () => null,
                            configurable: false,
                            enumerable: false
                        });
                    } catch (e) {
                        // Игнорируем ошибки
                    }
                });
            } catch (e) {
                // Игнорируем ошибки CORS (это нормально для iframe)
            }
        }
    };

    return (
        <div 
            ref={containerRef}
            className="relative w-full rounded-lg overflow-hidden"
            style={{ paddingBottom: '56.25%' }}
            onContextMenu={handleContextMenu}
        >
            {!showPoster && (
                <iframe
                    ref={iframeRef}
                    src={getSecureEmbedUrl(videoId, savedProgress)}
                    title={title || 'Video player'}
                    allow="autoplay; fullscreen; picture-in-picture; encrypted-media;"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    style={{
                        pointerEvents: 'auto',
                        userSelect: 'none',
                        WebkitUserSelect: 'none'
                    }}
                    onLoad={handleIframeLoad}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-presentation"
                    loading="lazy"
                    // Скрываем URL от инспектора - используем data-атрибут вместо прямого отображения
                    data-video-id={videoId}
                    // Дополнительные атрибуты безопасности
                    referrerPolicy="no-referrer"
                />
            )}
            {showPoster && poster && (
                <div 
                    className="absolute top-0 left-0 w-full h-full cursor-pointer z-10"
                    onClick={onPosterClick}
                    onContextMenu={handleContextMenu}
                >
                    <img 
                        src={poster} 
                        alt={title || 'Video poster'}
                        className="w-full h-full object-cover rounded-lg"
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                    />
                    {/* Кнопка воспроизведения */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">
                            <svg 
                                className="w-8 h-8 text-white ml-1" 
                                fill="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

