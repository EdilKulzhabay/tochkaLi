import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import api from "../../api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SecureKinescopePlayer } from "../../components/User/SecureKinescopePlayer";

// Функция для определения типа видео и извлечения ID
const getVideoInfo = (url: string): { type: 'kinescope' | 'youtube' | 'rutube' | 'unknown', id: string } => {
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
        const match = url.match(/rutube\.ru\/(?:video\/|embed\/)?([a-zA-Z0-9_-]+)/);
        if (match) {
            return { type: 'rutube', id: match[1] };
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
    if (info.type === 'rutube') {
        return `https://rutube.ru/play/embed/${info.id}`;
    }
    return url;
};

export const ClientMeditation = () => {
    const { id } = useParams();
    const [meditation, setMeditation] = useState<any>(null);
    const [showPoster, setShowPoster] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
        fetchMeditation();
    }, []);

    const fetchMeditation = async () => {
        try {
            const response = await api.get(`/api/meditation/${id}`);
            setMeditation(response.data.data);
        } catch (error) {
            console.error('Ошибка загрузки медитации:', error);
        } finally {
            setLoading(false);
        }
    }

    const handlePosterClick = async () => {
        setShowPoster(false);
        
        // Если это бесплатный контент, устанавливаем прогресс в 100%
        if (meditation?.accessType === 'free' && id) {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user._id) {
                    const duration = meditation?.duration || 100; // Используем длительность из данных или дефолтное значение
                    await api.post('/api/video-progress', {
                        contentType: 'meditation',
                        contentId: id,
                        currentTime: duration, // Устанавливаем текущее время равным длительности
                        duration: duration,
                        userId: user._id
                    });
                }
            } catch (error) {
                console.error('Ошибка при установке прогресса:', error);
            }
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
                <BackNav title={meditation?.title} />
                <div className="px-4 mt-4 pb-10 bg-[#161616]">
                    <p className="" dangerouslySetInnerHTML={{ __html: meditation?.shortDescription }}></p>
                    {meditation?.videoUrl && (() => {
                        // Сначала определяем тип оригинального видео
                        const originalVideoInfo = getVideoInfo(meditation.videoUrl);
                        
                        // Если оригинал - YouTube, и пользователь из России, и есть RuTube URL - используем RuTube
                        const shouldUseRuTube = originalVideoInfo.type === 'youtube' && user?.locatedInRussia && meditation?.ruTubeUrl;
                        const videoUrl = shouldUseRuTube ? meditation.ruTubeUrl : meditation.videoUrl;
                        const videoInfo = getVideoInfo(videoUrl);
                        
                        // Используем защищенный плеер для Kinescope
                        if (videoInfo.type === 'kinescope') {
                            return (
                                <div className="mt-6">
                                    <SecureKinescopePlayer
                                        videoId={videoInfo.id}
                                        poster={meditation?.imageUrl ? `${import.meta.env.VITE_API_URL}${meditation.imageUrl}` : undefined}
                                        title={meditation?.title}
                                        showPoster={showPoster}
                                        onPosterClick={handlePosterClick}
                                        contentType="meditation"
                                        contentId={id || ''}
                                        duration={meditation?.duration}
                                        accessType={meditation?.accessType || 'subscription'}
                                    />
                                </div>
                            );
                        }
                        
                        // Для RuTube используем iframe
                        if (videoInfo.type === 'rutube') {
                            return (
                                <div className="mt-6">
                                    <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                                        {!showPoster && (
                                            <iframe
                                                src={getRuTubeEmbedUrl(videoUrl)}
                                                title="RuTube video player"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen
                                                className="absolute top-0 left-0 w-full h-full rounded-lg"
                                            />
                                        )}
                                        {showPoster && meditation?.imageUrl && (
                                            <div 
                                                className="absolute top-0 left-0 w-full h-full cursor-pointer z-10"
                                                onClick={handlePosterClick}
                                            >
                                                <img 
                                                    src={`${import.meta.env.VITE_API_URL}${meditation.imageUrl}`} 
                                                    alt={meditation.title}
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
                                    {showPoster && meditation?.imageUrl && (
                                        <div 
                                            className="absolute top-0 left-0 w-full h-full cursor-pointer z-10"
                                            onClick={handlePosterClick}
                                        >
                                            <img 
                                                src={`${import.meta.env.VITE_API_URL}${meditation.imageUrl}`} 
                                                alt={meditation.title}
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
                    <p className="mt-6" dangerouslySetInnerHTML={{ __html: meditation?.fullDescription }}></p>
                </div>
            </UserLayout>
        </div>
    )
}