import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import api from "../../api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Функция для преобразования YouTube URL в embed формат
const getYouTubeEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    // Если уже embed URL, возвращаем как есть
    if (url.includes('youtube.com/embed/')) {
        return url;
    }
    
    // Извлекаем ID видео из различных форматов YouTube URL
    let videoId = '';
    
    // Формат: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (watchMatch) {
        videoId = watchMatch[1];
    }
    
    // Формат: https://m.youtube.com/watch?v=VIDEO_ID
    const mobileMatch = url.match(/m\.youtube\.com\/watch\?v=([^&\n?#]+)/);
    if (mobileMatch) {
        videoId = mobileMatch[1];
    }
    
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return url;
};

export const ClientMeditation = () => {
    const { id } = useParams();
    const [meditation, setMeditation] = useState<any>(null);
    const [showPoster, setShowPoster] = useState(true);

    useEffect(() => {
        fetchMeditation();
    }, []);

    const fetchMeditation = async () => {
        const response = await api.get(`/api/meditation/${id}`);
        console.log(response.data.data);
        setMeditation(response.data.data);
    }

    const handlePosterClick = () => {
        setShowPoster(false);
    }

    return (
        <div>
            <UserLayout>
                <BackNav title={meditation?.title} />
                <div className="px-4 mt-4 pb-10">
                    <p className="">{meditation?.shortDescription}</p>
                    {meditation?.videoUrl && (
                        <div className="mt-6">
                            <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                                {!showPoster && (
                                    <iframe
                                        src={getYouTubeEmbedUrl(meditation.videoUrl)}
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
                    )}
                    <p className="mt-6">{meditation?.fullDescription}</p>
                </div>
            </UserLayout>
        </div>
    )
}