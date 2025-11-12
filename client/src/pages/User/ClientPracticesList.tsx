import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import { useState, useEffect, useRef } from "react";
import api from "../../api";
import { MiniVideoCard } from "../../components/User/MiniVideoCard";
import { VideoCard } from "../../components/User/VideoCard";
import { ClientSubscriptionModal } from "../../components/User/ClientSubscriptionModal";

export const ClientPracticesList = () => {
    const [practices, setPractices] = useState([]);
    const [cardHeight, setCardHeight] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const cardsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchPractices();
    }, []);

    useEffect(() => {
        if (practices.length > 0 && cardsContainerRef.current) {
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
    }, [practices]);

    const fetchPractices = async () => {
        const response = await api.get('/api/practice');
        setPractices(response.data.data);
    }

    const handleLockedPracticeClick = () => {
        setIsModalOpen(true);
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
    }

    return (
        <div>
            <UserLayout>
                <BackNav title="Практики" />

                <div className="px-4 mt-8 pb-10">
                    <div ref={cardsContainerRef} className="flex overflow-x-auto gap-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {practices.length > 0 ? (
                            practices.map((practice: any) => (
                                <div 
                                    key={practice._id} 
                                    data-card
                                    className="flex-shrink-0 w-[45vw]"
                                    style={cardHeight ? { height: `${cardHeight}px` } : {}}
                                >
                                    <div className="h-full">
                                        <MiniVideoCard 
                                            title={practice.title} 
                                            image={practice.imageUrl} 
                                            link={`/client/practice/${practice._id}`} 
                                            progress={0} 
                                            accessType={practice.accessType}
                                            onLockedClick={practice.accessType !== 'free' ? () => handleLockedPracticeClick() : undefined}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">Нет практик</p>
                        )}
                    </div>

                    <div className="mt-4 space-y-3">
                        { practices.length > 0 ? (
                            practices.map((practice: any) => (
                                <VideoCard 
                                    key={practice._id} 
                                    title={practice.title} 
                                    description={practice.shortDescription} 
                                    image={practice.imageUrl} 
                                    link={`/client/practice/${practice._id}`} 
                                    accessType={practice.accessType} 
                                    progress={0} 
                                    onLockedClick={practice.accessType !== 'free' ? () => handleLockedPracticeClick() : undefined} 
                                />
                            ))
                        ) : (
                            <p className="text-center text-gray-500">Нет практик</p>
                        )}
                    </div>
                </div>
            </UserLayout>

            {/* Модальное окно для платных практик */}
            <ClientSubscriptionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    )
}

