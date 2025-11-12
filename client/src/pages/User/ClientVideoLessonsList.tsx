import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import { useState, useEffect, useRef } from "react";
import api from "../../api";
import { MiniVideoCard } from "../../components/User/MiniVideoCard";
import { VideoCard } from "../../components/User/VideoCard";
import { ClientSubscriptionModal } from "../../components/User/ClientSubscriptionModal";

export const ClientVideoLessonsList = () => {
    const [videoLessons, setVideoLessons] = useState([]);
    const [cardHeight, setCardHeight] = useState<number | null>(null);
    const [selectedVideoLesson, setSelectedVideoLesson] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const cardsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchVideoLessons();
    }, []);

    useEffect(() => {
        if (videoLessons.length > 0 && cardsContainerRef.current) {
            // Даем время на рендер всех карточек
            setTimeout(() => {
                const cards = cardsContainerRef.current?.querySelectorAll('[data-card]');
                if (cards && cards.length > 0) {
                    let maxHeight = 0;
                    cards.forEach((card) => {
                        const height = (card as HTMLElement).offsetHeight;
                        if (height > maxHeight) {
                            maxHeight = height;
                        }
                    });
                    setCardHeight(maxHeight);
                }
            }, 100);
        }
    }, [videoLessons]);

    const fetchVideoLessons = async () => {
        const response = await api.get('/api/video-lesson');
        setVideoLessons(response.data.data);
    }

    const handleLockedVideoLessonClick = (videoLesson: any) => {
        setSelectedVideoLesson(videoLesson);
        setIsModalOpen(true);
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedVideoLesson(null);
    }

    return (
        <div>
            <UserLayout>
                <BackNav title="Видео уроки" />

                <div className="px-4 mt-8 pb-10">
                    <div ref={cardsContainerRef} className="flex overflow-x-auto gap-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {videoLessons.length > 0 ? (
                            videoLessons.map((videoLesson: any) => (
                                <div 
                                    key={videoLesson._id} 
                                    data-card
                                    className="flex-shrink-0 w-[45vw]"
                                    style={cardHeight ? { height: `${cardHeight}px` } : {}}
                                >
                                    <div className="h-full">
                                        <MiniVideoCard 
                                            title={videoLesson.title} 
                                            image={videoLesson.imageUrl} 
                                            link={`/client/video-lesson/${videoLesson._id}`} 
                                            progress={0} 
                                            accessType={videoLesson.accessType}
                                            onLockedClick={videoLesson.accessType !== 'free' ? () => handleLockedVideoLessonClick(videoLesson) : undefined}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">Нет видео уроков</p>
                        )}
                    </div>

                    <div className="mt-4 space-y-3">
                        { videoLessons.length > 0 ? (
                            videoLessons.map((videoLesson: any) => (
                                <VideoCard 
                                    key={videoLesson._id} 
                                    title={videoLesson.title} 
                                    description={videoLesson.shortDescription} 
                                    image={videoLesson.imageUrl} 
                                    link={`/client/video-lesson/${videoLesson._id}`} 
                                    accessType={videoLesson.accessType} 
                                    progress={0} 
                                    onLockedClick={videoLesson.accessType !== 'free' ? () => handleLockedVideoLessonClick(videoLesson) : undefined} 
                                />
                            ))
                        ) : (
                            <p className="text-center text-gray-500">Нет видео уроков</p>
                        )}
                    </div>
                </div>
            </UserLayout>

            {/* Модальное окно для платных видео уроков */}
            <ClientSubscriptionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    )
}

