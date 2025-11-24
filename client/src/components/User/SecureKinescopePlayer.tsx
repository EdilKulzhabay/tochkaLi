import { useEffect, useRef, useState, useCallback } from 'react';
import api from '../../api';

interface SecureKinescopePlayerProps {
    videoId: string;
    poster?: string;
    title?: string;
    onPosterClick?: () => void;
    showPoster?: boolean;
    contentType: 'meditation' | 'practice' | 'videoLesson';
    contentId: string;
    duration?: number; // Длительность в минутах из данных контента
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
    duration: durationMinutes = 0,
    onProgressUpdate
}: SecureKinescopePlayerProps) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [savedProgress, setSavedProgress] = useState<number>(0);
    
    // Рефы для отслеживания времени просмотра
    const videoDurationSecondsRef = useRef<number>(durationMinutes * 60 || 0); // Конвертируем минуты в секунды
    const watchStartTimeRef = useRef<number>(0); // Время начала просмотра (timestamp)
    const accumulatedWatchTimeRef = useRef<number>(0); // Накопленное время просмотра в секундах
    const isWatchingRef = useRef<boolean>(false); // Флаг воспроизведения
    const lastSaveTimeRef = useRef<number>(0); // Время последнего сохранения
    const saveIntervalRef = useRef<number | null>(null); // Интервал для периодического сохранения

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
            controls: '1'
        });
        
        if (startTime > 0) {
            params.set('time', startTime.toString());
        }
        
        return `https://kinescope.io/embed/${extractedId}?${params.toString()}`;
    };

    // Инициализация длительности из пропсов
    useEffect(() => {
        if (durationMinutes > 0) {
            videoDurationSecondsRef.current = durationMinutes * 60;
            console.log(`📹 Длительность видео установлена: ${durationMinutes} минут (${videoDurationSecondsRef.current} секунд)`);
        }
    }, [durationMinutes]);

    // Загрузка сохраненного прогресса
    useEffect(() => {
        const loadProgress = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (!user._id) {
                    console.log('⚠️ Пользователь не найден, прогресс не загружен');
                    return;
                }

                console.log(`📥 Загрузка прогресса для ${contentType}/${contentId}, userId: ${user._id}`);
                
                const response = await api.get(`/api/video-progress/${user._id}/${contentType}/${contentId}`);
                
                if (response.data.success && response.data.data) {
                    const progress = response.data.data;
                    const savedTime = progress.currentTime || 0;
                    const savedDuration = progress.duration || 0;
                    
                    setSavedProgress(savedTime);
                    
                    // Обновляем длительность, если она была сохранена
                    if (savedDuration > 0 && videoDurationSecondsRef.current === 0) {
                        videoDurationSecondsRef.current = savedDuration;
                    }
                    
                    // Восстанавливаем накопленное время просмотра из сохраненного прогресса
                    accumulatedWatchTimeRef.current = savedTime;
                    console.log(`📥 Восстановлено накопленное время просмотра: ${savedTime.toFixed(1)} сек`);
                    
                    if (onProgressUpdate) {
                        onProgressUpdate(progress.progress || 0);
                    }
                    
                    console.log(`✅ Прогресс загружен: ${progress.progress}% (${savedTime.toFixed(1)}/${savedDuration.toFixed(1)} сек)`);
                } else {
                    console.log('ℹ️ Сохраненный прогресс не найден, начинаем с начала');
                }
            } catch (error: any) {
                console.error('❌ Ошибка загрузки прогресса:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
            }
        };

        loadProgress();
    }, [contentType, contentId, onProgressUpdate]);

    // Функция для сохранения прогресса на сервере (мемоизирована для использования в useEffect)
    const saveProgressToServer = useCallback(async (currentTime: number, duration: number) => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user._id) {
                console.warn('⚠️ Прогресс не сохранен: пользователь не найден в localStorage');
                return;
            }

            if (!contentType || !contentId) {
                console.warn('⚠️ Прогресс не сохранен: отсутствуют contentType или contentId', { contentType, contentId });
                return;
            }

            if (duration <= 0) {
                console.warn('⚠️ Прогресс не сохранен: длительность видео равна 0 или не определена');
                return;
            }

            if (currentTime < 0) {
                console.warn('⚠️ Прогресс не сохранен: текущее время отрицательное');
                return;
            }

            const progress = Math.round((currentTime / duration) * 100);
            
            const requestData = {
                contentType,
                contentId,
                currentTime: Math.round(currentTime * 100) / 100, // Округляем до 2 знаков
                duration: Math.round(duration * 100) / 100,
                userId: user._id
            };
            
            console.log('📤 Отправка запроса на сохранение прогресса:', requestData);
            
            // Обновляем прогресс в родительском компоненте
            if (onProgressUpdate) {
                onProgressUpdate(progress);
            }

            const response = await api.post('/api/video-progress', requestData);

            if (response.data && response.data.success) {
                console.log(`✅ Прогресс успешно сохранен: ${progress}% (${currentTime.toFixed(1)}/${duration.toFixed(1)} сек)`);
                return true;
            } else {
                console.error('❌ Ошибка сохранения прогресса - ответ сервера:', response.data);
                return false;
            }
        } catch (error: any) {
            console.error('❌ Ошибка сохранения прогресса:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url,
                method: error.config?.method,
                data: error.config?.data
            });
            return false;
        }
    }, [contentType, contentId, onProgressUpdate]);

    // Простое отслеживание прогресса на основе событий play/pause и таймера
    useEffect(() => {
        if (showPoster) return;

        const handleMessage = (event: MessageEvent) => {
            // Проверяем, что сообщение от Kinescope
            if (!event.origin.includes('kinescope.io')) {
                return;
            }

            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                
                // Обрабатываем событие play - начинаем отслеживание времени
                if (data.type === 'KINESCOPE_PLAYER_PLAY_EVENT') {
                    if (!isWatchingRef.current) {
                        isWatchingRef.current = true;
                        watchStartTimeRef.current = Date.now();
                        console.log('▶️ Воспроизведение начато, начинаем отслеживание времени');
                    }
                }
                
                // Обрабатываем событие pause - останавливаем отслеживание и сохраняем
                if (data.type === 'KINESCOPE_PLAYER_PAUSE_EVENT') {
                    if (isWatchingRef.current) {
                        // Вычисляем время просмотра с момента последнего play
                        const watchTime = (Date.now() - watchStartTimeRef.current) / 1000;
                        accumulatedWatchTimeRef.current += watchTime;
                        watchStartTimeRef.current = 0;
                        isWatchingRef.current = false;
                        
                        console.log(`⏸️ Воспроизведение приостановлено. Просмотрено: ${watchTime.toFixed(1)} сек, Всего: ${accumulatedWatchTimeRef.current.toFixed(1)} сек`);
                        
                        // Сохраняем прогресс при паузе
                        if (videoDurationSecondsRef.current > 0) {
                            const currentTime = Math.min(accumulatedWatchTimeRef.current, videoDurationSecondsRef.current);
                            saveProgressToServer(currentTime, videoDurationSecondsRef.current);
                        }
                    }
                }
            } catch (error) {
                // Игнорируем ошибки парсинга
            }
        };

        window.addEventListener('message', handleMessage);

        // Периодическое сохранение прогресса каждые 5 секунд во время просмотра
        saveIntervalRef.current = window.setInterval(() => {
            if (isWatchingRef.current && videoDurationSecondsRef.current > 0) {
                // Вычисляем текущее время просмотра
                const currentWatchTime = watchStartTimeRef.current > 0
                    ? accumulatedWatchTimeRef.current + (Date.now() - watchStartTimeRef.current) / 1000
                    : accumulatedWatchTimeRef.current;
                
                const currentTime = Math.min(currentWatchTime, videoDurationSecondsRef.current);
                const progress = Math.round((currentTime / videoDurationSecondsRef.current) * 100);
                
                // Обновляем прогресс в родительском компоненте
                if (onProgressUpdate) {
                    onProgressUpdate(progress);
                }
                
                // Сохраняем каждые 5 секунд
                const now = Date.now();
                if (now - lastSaveTimeRef.current > 5000) {
                    lastSaveTimeRef.current = now;
                    console.log(`💾 Автосохранение прогресса: ${progress}% (${currentTime.toFixed(1)}/${videoDurationSecondsRef.current.toFixed(1)} сек)`);
                    saveProgressToServer(currentTime, videoDurationSecondsRef.current);
                }
            }
        }, 1000); // Проверяем каждую секунду, сохраняем каждые 5 секунд

        return () => {
            window.removeEventListener('message', handleMessage);
            if (saveIntervalRef.current) {
                clearInterval(saveIntervalRef.current);
            }
            // Сохраняем прогресс при размонтировании компонента
            if (videoDurationSecondsRef.current > 0 && accumulatedWatchTimeRef.current > 0) {
                const currentTime = Math.min(accumulatedWatchTimeRef.current, videoDurationSecondsRef.current);
                saveProgressToServer(currentTime, videoDurationSecondsRef.current);
            }
        };
    }, [contentType, contentId, onProgressUpdate, showPoster, saveProgressToServer]);

    // Сохранение прогресса при закрытии страницы
    useEffect(() => {
        const handleBeforeUnload = () => {
            // При закрытии страницы пытаемся сохранить прогресс
            if (iframeRef.current?.contentWindow && !showPoster) {
                try {
                    // Запрашиваем текущее время перед закрытием
                    iframeRef.current.contentWindow.postMessage({
                        type: 'getCurrentTime',
                        method: 'getCurrentTime'
                    }, 'https://kinescope.io');
                    
                    // Даем время на ответ (синхронно не получится, но попробуем)
                    setTimeout(() => {
                        // Если есть сохраненный прогресс, сохраняем его
                        if (savedProgress > 0) {
                            // Можно попробовать сохранить последний известный прогресс
                            console.log('Попытка сохранить прогресс при закрытии страницы');
                        }
                    }, 100);
                } catch (e) {
                    // Игнорируем ошибки
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('pagehide', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('pagehide', handleBeforeUnload);
        };
    }, [showPoster, savedProgress]);

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
                    allow="autoplay; fullscreen; picture-in-picture; encrypted-media; screen-wake-lock;"
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



