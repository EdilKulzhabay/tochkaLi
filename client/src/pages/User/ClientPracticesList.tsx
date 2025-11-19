import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import { useState, useEffect, useRef } from "react";
import api from "../../api";
import { MiniVideoCard } from "../../components/User/MiniVideoCard";
import { VideoCard } from "../../components/User/VideoCard";
import { ClientSubscriptionDynamicModal } from "../../components/User/ClientSubscriptionDynamicModal";

export const ClientPracticesList = () => {
    const [practices, setPractices] = useState([]);
    const [cardHeight, setCardHeight] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const cardsContainerRef = useRef<HTMLDivElement>(null);
    const [subscriptionContent, setSubscriptionContent] = useState<string>('');
    const [starsContent, setStarsContent] = useState<string>('');
    const [content, setContent] = useState<string>('');
    useEffect(() => {
        fetchPractices();
        fetchContent();
    }, []);

    const fetchContent = async () => {
        const responseSubscription = await api.get('/api/dynamic-content/name/practice-subscription');
        setSubscriptionContent(responseSubscription.data.data.content);
        const responseStars = await api.get('/api/dynamic-content/name/practice-stars');
        setStarsContent(responseStars.data.data.content);
    }

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

    const handleLockedPracticeClick = (accessType: string) => {
        if (accessType === 'subscription') {
            setContent(subscriptionContent);
        } else if (accessType === 'stars') {
            setContent(starsContent);
        }
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
                            practices.filter((practice: any) => practice.accessType === 'subscription').map((practice: any) => (
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
                                            onLockedClick={practice.accessType !== 'free' ? () => handleLockedPracticeClick(practice.accessType) : undefined}
                                            duration={practice?.duration || 0}
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
                            <>
                                {
                                    practices.filter((practice: any) => practice.accessType === 'stars').map((practice: any) => (
                                        <VideoCard 
                                            key={practice._id} 
                                            title={practice.title} 
                                            description={practice.shortDescription} 
                                            image={practice.imageUrl} 
                                            link={`/client/practice/${practice._id}`} 
                                            accessType={practice.accessType} 
                                            progress={0} 
                                            onLockedClick={practice.accessType !== 'free' ? () => handleLockedPracticeClick(practice.accessType) : undefined} 
                                            starsRequired={practice?.starsRequired || 0}
                                            duration={practice?.duration || 0}
                                        />
                                    ))
                                }
                                {
                                    practices.filter((practice: any) => practice.accessType === 'free').map((practice: any) => (
                                        <VideoCard 
                                            key={practice._id} 
                                            title={practice.title} 
                                            description={practice.shortDescription} 
                                            image={practice.imageUrl} 
                                            link={`/client/practice/${practice._id}`} 
                                            accessType={practice.accessType} 
                                            progress={0} 
                                            onLockedClick={practice.accessType !== 'free' ? () => handleLockedPracticeClick(practice.accessType) : undefined} 
                                            starsRequired={practice?.starsRequired || 0}
                                            duration={practice?.duration || 0}
                                        />
                                    ))
                                }
                            </>
                        ) : (
                            <p className="text-center text-gray-500">Нет практик</p>
                        )}
                    </div>
                </div>
            </UserLayout>

            {/* Модальное окно для платных практик */}
            <ClientSubscriptionDynamicModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                content={content}
            />
        </div>
    )
}

