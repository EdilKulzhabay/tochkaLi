import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import api from "../../api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SecureKinescopePlayer } from "../../components/User/SecureKinescopePlayer";

// Функция для определения типа видео и извлечения ID
const getVideoInfo = (url: string): { type: 'kinescope' | 'youtube' | 'unknown', id: string } => {
    if (!url) return { type: 'unknown', id: '' };
    
    // Проверяем Kinescope
    if (url.includes('kinescope.io')) {
        const match = url.match(/kinescope\.io\/(?:embed\/|video\/)?([a-zA-Z0-9_-]+)/);
        if (match) {
            return { type: 'kinescope', id: match[1] };
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

export const ClientPractice = () => {
    const { id } = useParams();
    const [practice, setPractice] = useState<any>(null);
    const [showPoster, setShowPoster] = useState(true);

    useEffect(() => {
        fetchPractice();
    }, []);

    const fetchPractice = async () => {
        const response = await api.get(`/api/practice/${id}`);
        setPractice(response.data.data);
    }

    const handlePosterClick = () => {
        setShowPoster(false);
    }

    return (
        <div>
            <UserLayout>
                <BackNav title={practice?.title} />
                <div className="px-4 mt-4 pb-10">
                    <p className="" dangerouslySetInnerHTML={{ __html: practice?.shortDescription }}></p>
                    {practice?.videoUrl && (() => {
                        const videoInfo = getVideoInfo(practice.videoUrl);
                        
                        // Используем защищенный плеер для Kinescope
                        if (videoInfo.type === 'kinescope') {
                            return (
                                <div className="mt-6">
                                    <SecureKinescopePlayer
                                        videoId={videoInfo.id}
                                        poster={practice?.imageUrl ? `${import.meta.env.VITE_API_URL}${practice.imageUrl}` : undefined}
                                        title={practice?.title}
                                        showPoster={showPoster}
                                        onPosterClick={handlePosterClick}
                                        contentType="practice"
                                        contentId={id || ''}
                                    />
                                </div>
                            );
                        }
                        
                        // Для YouTube используем стандартный iframe (обратная совместимость)
                        return (
                            <div className="mt-6">
                                <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                                    {!showPoster && (
                                        <iframe
                                            src={getYouTubeEmbedUrl(practice.videoUrl)}
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
                </div>
            </UserLayout>
        </div>
    )
}

