import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import api from "../../api";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { SecureKinescopePlayer } from "../../components/User/SecureKinescopePlayer";
import { Switch } from "../../components/User/Switch";

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
        // Проверяем приватное видео с параметром p в формате /video/private/{id}/?...&p={param} или ?p={param}
        const privateMatch = url.match(/rutube\.ru\/video\/private\/([^\/\?]+)\/?\?([^#]*)/);
        if (privateMatch) {
            const videoId = privateMatch[1];
            const queryString = privateMatch[2];
            // Извлекаем параметр p из query string
            const pMatch = queryString.match(/[&?]p=([^&\n?#]+)/);
            const privateParam = pMatch ? pMatch[1] : undefined;
            return { type: 'rutube', id: videoId, privateParam };
        }
        
        // Проверяем embed URL с параметром p для приватных видео
        const embedPrivateMatch = url.match(/rutube\.ru\/play\/embed\/([^\/\?]+)\/?\?([^#]*)/);
        if (embedPrivateMatch) {
            const videoId = embedPrivateMatch[1];
            const queryString = embedPrivateMatch[2];
            // Извлекаем параметр p из query string
            const pMatch = queryString.match(/[&?]p=([^&\n?#]+)/);
            const privateParam = pMatch ? pMatch[1] : undefined;
            return { type: 'rutube', id: videoId, privateParam };
        }
        
        // Проверяем уже embed URL без параметров
        const embedMatch = url.match(/rutube\.ru\/play\/embed\/([^\/\?&]+)/);
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
    if (info.type === 'rutube' && info.id && info.id !== 'private' && info.id.length > 0) {
        // Для приватных видео добавляем параметр p
        if (info.privateParam) {
            return `https://rutube.ru/play/embed/${info.id}/?p=${info.privateParam}`;
        }
        return `https://rutube.ru/play/embed/${info.id}`;
    }
    // Если не удалось распарсить, возвращаем оригинальный URL
    console.warn('Не удалось распарсить RuTube URL:', url);
    return url;
};

export const ClientPractice = () => {
    const { id } = useParams();
    const [practice, setPractice] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const rutubeIframeRef = useRef<HTMLIFrameElement>(null);
    const rutubeProgressIntervalRef = useRef<number | null>(null);
    const youtubeIframeRef = useRef<HTMLIFrameElement>(null);
    const [locatedInRussia, setLocatedInRussia] = useState(false);

    const fetchUserData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await api.get(`/api/user/${user._id}`);
            if (response.data.success) {
                setUser(response.data.data);
                setLocatedInRussia(response.data.data.locatedInRussia);
                if (response.data.data && response.data.data.isBlocked && response.data.data.role !== 'admin') {
                    window.location.href = '/client/blocked-user';
                    return;
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки данных пользователя:', error);
        }
    }

    useEffect(() => {
        fetchUserData();
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


    const updateUserData = async (field: string, value: boolean) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await api.put(`/api/user/${user._id}`, { [field]: value });
        if (response.data.success) {
            setUser(response.data.user);
        }
    }

    // Отслеживание прогресса для RuTube через postMessage
    useEffect(() => {
        if (!rutubeIframeRef.current) return;

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
    }, [practice?.duration, practice?.accessType, id, saveProgressToServer]);

    const handleLocatedInRussiaChange = async () => {
        try {
            await updateUserData('locatedInRussia', !locatedInRussia);
            setLocatedInRussia(!locatedInRussia);
            window.location.reload();
        } catch (error) {
            console.error('Ошибка при изменении просмотра видео в РФ без VPN:', error);
        }
    }

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
                            const rutubeEmbedUrl = getRuTubeEmbedUrl(videoUrl);
                            // Проверяем, что URL правильно сформирован
                            if (!rutubeEmbedUrl || !videoInfo.id || videoInfo.id === 'private' || videoInfo.id.length === 0) {
                                console.error('Некорректный RuTube URL:', videoUrl, 'videoInfo:', videoInfo);
                                // Если RuTube URL некорректный, пропускаем рендеринг
                                return null;
                            }
                            
                            return (
                                <div className="mt-6">
                                    <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                                        <iframe
                                            ref={rutubeIframeRef}
                                            src={rutubeEmbedUrl}
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
                        
                        // Для YouTube используем стандартный iframe
                        return (
                            <div className="mt-6">
                                <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                                    <iframe
                                        ref={youtubeIframeRef}
                                        src={`${getYouTubeEmbedUrl(videoUrl)}?enablejsapi=1`}
                                        title="YouTube video player"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                                        onLoad={() => {
                                            // Начисляем бонус при загрузке iframe (готовности к воспроизведению)
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
                    })()}
                    <p className="mt-6" dangerouslySetInnerHTML={{ __html: practice?.fullDescription }}></p>
                    {practice.ruTubeUrl && (
                        <div className="mt-4 flex items-center justify-between">
                            <div>Просмотр видео в РФ без VPN</div>
                            <Switch checked={locatedInRussia} onChange={handleLocatedInRussiaChange} />
                        </div>
                    )}
                </div>
            </UserLayout>
        </div>
    )
}

