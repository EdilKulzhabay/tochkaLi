import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import { useState, useEffect, useRef } from "react";
import api from "../../api";
import { MiniVideoCard } from "../../components/User/MiniVideoCard";
import { VideoCard } from "../../components/User/VideoCard";
import { ClientSubscriptionModal } from "../../components/User/ClientSubscriptionModal";

export const ClientMeditationsList = () => {
    const [meditations, setMeditations] = useState([]);
    const [cardHeight, setCardHeight] = useState<number | null>(null);
    const [selectedMeditation, setSelectedMeditation] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const cardsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMeditations();
    }, []);

    useEffect(() => {
        if (meditations.length > 0 && cardsContainerRef.current) {
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
    }, [meditations]);

    const fetchMeditations = async () => {
        const response = await api.get('/api/meditation');
        setMeditations(response.data.data);
    }

    const handleLockedMeditationClick = (meditation: any) => {
        setSelectedMeditation(meditation);
        setIsModalOpen(true);
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMeditation(null);
    }

    return (
        <div>
            <UserLayout>
                <BackNav title="Медитации" />

                <div className="px-4 mt-8 pb-10">
                    <div ref={cardsContainerRef} className="flex overflow-x-auto gap-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {meditations.length > 0 ? (
                            meditations.map((meditation: any) => (
                                <div 
                                    key={meditation._id} 
                                    data-card
                                    className="flex-shrink-0 w-[45vw]"
                                    style={cardHeight ? { height: `${cardHeight}px` } : {}}
                                >
                                    <div className="h-full">
                                        <MiniVideoCard 
                                            title={meditation.title} 
                                            image={meditation.imageUrl} 
                                            link={`/client/meditation/${meditation._id}`} 
                                            progress={0} 
                                            accessType={meditation.accessType}
                                            onLockedClick={meditation.accessType !== 'free' ? () => handleLockedMeditationClick(meditation) : undefined}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">Нет медитаций</p>
                        )}
                    </div>

                    <div className="mt-4 space-y-3">
                        { meditations.length > 0 ? (
                            meditations.map((meditation: any) => (
                                <VideoCard 
                                    key={meditation._id} 
                                    title={meditation.title} 
                                    description={meditation.shortDescription} 
                                    image={meditation.imageUrl} 
                                    link={`/client/meditation/${meditation._id}`} 
                                    accessType={meditation.accessType} 
                                    progress={0} 
                                    onLockedClick={meditation.accessType !== 'free' ? () => handleLockedMeditationClick(meditation) : undefined} 
                                />
                            ))
                        ) : (
                            <p className="text-center text-gray-500">Нет медитаций</p>
                        )}
                    </div>
                </div>
            </UserLayout>

            {/* Модальное окно для платных медитаций */}
            <ClientSubscriptionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    )
}