import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import api from "../../api";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { SecureKinescopePlayer } from "../../components/User/SecureKinescopePlayer";

// Функция для определения типа видео и извлечения ID
const getVideoInfo = (url: string): { type: 'kinescope' | 'youtube' | 'rutube' | 'unknown', id: string, privateParam?: string } => {
    if (!url) return { type: 'unknown', id: '' };
    
    // Проверяем Kinescope
    if (url.includes('kinescope.io')) {
        const match = url.match(/kinescope\.io\/(?:embed\/|video\/)?([a-zA-Z0-9_-]+)/);
        if (match) {
            return { type: 'kinescope', id: match[1] };
        }
    }
    
    // Проверяем RuTube
    if (url.includes('rutube.ru')) {
        // Проверяем приватное видео с параметром p
        const privateMatch = url.match(/rutube\.ru\/video\/private\/([^\/\?]+)\/?\?p=([^&\n?#]+)/);
        if (privateMatch) {
            // Для приватных видео используем ID из пути и сохраняем параметр p
            return { type: 'rutube', id: privateMatch[1], privateParam: privateMatch[2] };
        }
        
        // Проверяем уже embed URL
        const embedMatch = url.match(/rutube\.ru\/play\/embed\/([^&\n?#]+)/);
        if (embedMatch) {
            return { type: 'rutube', id: embedMatch[1] };
        }
        
        // Проверяем обычное видео
        const videoMatch = url.match(/rutube\.ru\/video\/([a-zA-Z0-9_-]+)/);
        if (videoMatch) {
            return { type: 'rutube', id: videoMatch[1] };
        }
    }
    
    // Проверяем YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        
        if (url.includes('youtube.com/embed/')) {
            const match = url.match(/youtube\.com\/embed\/([^&\n?#]+)/);
            if (match) videoId = match[1];
        } else {
            const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
            if (watchMatch) videoId = watchMatch[1];
        }
        
        if (videoId) {
            return { type: 'youtube', id: videoId };
        }
    }
    
    return { type: 'unknown', id: url };
};

// Функция для преобразования YouTube URL в embed формат (для обратной совместимости)
const getYouTubeEmbedUrl = (url: string): string => {
    const info = getVideoInfo(url);
    if (info.type === 'youtube') {
        return `https://www.youtube.com/embed/${info.id}`;
    }
    return url;
};

// Функция для преобразования RuTube URL в embed формат
const getRuTubeEmbedUrl = (url: string): string => {
    const info = getVideoInfo(url);
    if (info.type === 'rutube' && info.id) {
        // Для приватных видео добавляем параметр p
        if (info.privateParam) {
            return `https://rutube.ru/play/embed/${info.id}/?p=${info.privateParam}`;
        }
        return `https://rutube.ru/play/embed/${info.id}`;
    }
    return url;
};

export const ClientPractice = () => {
    const { id } = useParams();
    const [practice, setPractice] = useState<any>(null);
    const [showPoster, setShowPoster] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const rutubeIframeRef = useRef<HTMLIFrameElement>(null);
    const rutubeProgressIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        // Получаем данные пользователя из localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setUser(user);
                // Проверка на блокировку пользователя
                if (user && user.isBlocked && user.role !== 'admin') {
                    window.location.href = '/client/blocked-user';
                    return;
                }
            } catch (e) {
                console.error('Ошибка парсинга user из localStorage:', e);
            }
        }
        fetchPractice();
    }, []);

    const fetchPractice = async () => {
        try {
            const response = await api.get(`/api/practice/${id}`);
            setPractice(response.data.data);
        } catch (error) {
            console.error('Ошибка загрузки практики:', error);
        } finally {
            setLoading(false);
        }
    }

    // Функция для сохранения прогресса на сервере
    const saveProgressToServer = async (currentTime: number, duration: number) => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user._id || !id) return;

            await api.post('/api/video-progress', {
                contentType: 'practice',
                contentId: id,
                currentTime: Math.round(currentTime * 100) / 100,
                duration: Math.round(duration * 100) / 100,
                userId: user._id
            });
        } catch (error) {
            console.error('Ошибка при сохранении прогресса:', error);
        }
    };

    // Функция для начисления бонусов при клике на обложку/воспроизведении
    const awardBonusOnPlay = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user._id || !id) return;

            await api.post('/api/video-progress/award-bonus', {
                contentType: 'practice',
                contentId: id,
                userId: user._id
            });
        } catch (error) {
            console.error('Ошибка при начислении бонуса:', error);
        }
    };

    const handlePosterClick = async () => {
        setShowPoster(false);
        
        // Начисляем бонус при клике на обложку
        await awardBonusOnPlay();
        
        // Если это бесплатный контент, устанавливаем прогресс в 100%
        if (practice?.accessType === 'free' && id) {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user._id) {
                    const duration = practice?.duration || 100;
                    await saveProgressToServer(duration, duration);
                }
            } catch (error) {
                console.error('Ошибка при установке прогресса:', error);
            }
        }
    }

    // Отслеживание прогресса для RuTube через postMessage
    useEffect(() => {
        if (!rutubeIframeRef.current || showPoster) return;

        const handleMessage = (event: MessageEvent) => {
            if (!event.origin.includes('rutube.ru')) return;

            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                
                if (data.type === 'rutube-player-state' && data.currentTime && data.duration) {
                    const currentTime = data.currentTime;
                    const duration = data.duration;
                    const progress = Math.round((currentTime / duration) * 100);
                    
                    if (progress >= 90 && practice?.accessType !== 'free') {
                        saveProgressToServer(duration, duration);
                    } else {
                        saveProgressToServer(currentTime, duration);
                    }
                }
            } catch (error) {
                // Игнорируем ошибки парсинга
            }
        };

        window.addEventListener('message', handleMessage);

        rutubeProgressIntervalRef.current = window.setInterval(async () => {
            try {
                const iframe = rutubeIframeRef.current;
                if (!iframe || !iframe.contentWindow) return;
                iframe.contentWindow.postMessage({ type: 'get-player-state' }, '*');
            } catch (error) {
                // Игнорируем ошибки
            }
        }, 5000);

        return () => {
            window.removeEventListener('message', handleMessage);
            if (rutubeProgressIntervalRef.current) {
                clearInterval(rutubeProgressIntervalRef.current);
            }
        };
    }, [showPoster, practice?.duration, practice?.accessType, id, saveProgressToServer]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#161616]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div>
            <UserLayout>
                <BackNav title={practice?.title} />
                <div className="px-4 mt-4 pb-10 bg-[#161616]">
                    <p className="" dangerouslySetInnerHTML={{ __html: practice?.shortDescription }}></p>
                    {practice?.videoUrl && (() => {
                        // Сначала определяем тип оригинального видео
                        const originalVideoInfo = getVideoInfo(practice.videoUrl);
                        
                        // Если оригинал - YouTube, и пользователь из России, и есть RuTube URL - используем RuTube
                        const shouldUseRuTube = originalVideoInfo.type === 'youtube' && user?.locatedInRussia && practice?.ruTubeUrl;
                        const videoUrl = shouldUseRuTube ? practice.ruTubeUrl : practice.videoUrl;
                        const videoInfo = getVideoInfo(videoUrl);
                        
                        // Используем защищенный плеер для Kinescope (без обложки)
                        if (videoInfo.type === 'kinescope') {
                            return (
                                <div className="mt-6 w-full">
                                    <SecureKinescopePlayer
                                        videoId={videoInfo.id}
                                        title={practice?.title}
                                        showPoster={false}
                                        contentType="practice"
                                        contentId={id || ''}
                                        duration={practice?.duration}
                                        accessType={practice?.accessType || 'subscription'}
                                        onPlay={awardBonusOnPlay}
                                    />
                                </div>
                            );
                        }
                        
                        // Для RuTube используем iframe (без обложки)
                        if (videoInfo.type === 'rutube') {
                            return (
                                <div className="mt-6">
                                    <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                                        <iframe
                                            ref={rutubeIframeRef}
                                            src={getRuTubeEmbedUrl(videoUrl)}
                                            title="RuTube video player"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                                            onLoad={() => {
                                                // Начисляем бонус при загрузке iframe (воспроизведении)
                                                awardBonusOnPlay();
                                                
                                                // Если бесплатный контент, сразу устанавливаем прогресс в 100%
                                                if (practice?.accessType === 'free' && id) {
                                                    const duration = practice?.duration || 100;
                                                    saveProgressToServer(duration, duration);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        }
                        
                        // Для YouTube используем стандартный iframe (обратная совместимость)
                        return (
                            <div className="mt-6">
                                <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                                    {!showPoster && (
                                        <iframe
                                            src={getYouTubeEmbedUrl(videoUrl)}
                                            title="YouTube video player"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                                        />
                                    )}
                                    {showPoster && practice?.imageUrl && (
                                        <div 
                                            className="absolute top-0 left-0 w-full h-full cursor-pointer z-10"
                                            onClick={handlePosterClick}
                                        >
                                            <img 
                                                src={`${import.meta.env.VITE_API_URL}${practice.imageUrl}`} 
                                                alt={practice.title}
                                                className="w-full h-full object-cover rounded-lg"
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
                            </div>
                        );
                    })()}
                    <p className="mt-6" dangerouslySetInnerHTML={{ __html: practice?.fullDescription }}></p>
                    <div className="mt-3">
                        Обновите страницу после изменения настроек
                    </div>
                </div>
            </UserLayout>
        </div>
    )
}

