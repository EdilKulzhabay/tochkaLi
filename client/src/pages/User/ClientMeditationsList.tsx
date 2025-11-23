import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import { useState, useEffect, useRef } from "react";
import api from "../../api";
import { MiniVideoCard } from "../../components/User/MiniVideoCard";
import { VideoCard } from "../../components/User/VideoCard";
import { ClientSubscriptionDynamicModal } from "../../components/User/ClientSubscriptionDynamicModal";
import { ClientPurchaseConfirmModal } from "../../components/User/ClientPurchaseConfirmModal";
import { ClientInsufficientBonusModal } from "../../components/User/ClientInsufficientBonusModal";

export const ClientMeditationsList = () => {
    const [meditations, setMeditations] = useState([]);
    const [cardHeight, setCardHeight] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isInsufficientBonusModalOpen, setIsInsufficientBonusModalOpen] = useState(false);
    const [subscriptionContent, setSubscriptionContent] = useState<string>('');
    const [starsContent, setStarsContent] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const cardsContainerRef = useRef<HTMLDivElement>(null);
    const [accessType, setAccessType] = useState<string>('');
    const [userData, setUserData] = useState<any>(null);
    const [selectedMeditation, setSelectedMeditation] = useState<any>(null);

    useEffect(() => {
        fetchMeditations();
        fetchContent();
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user._id) {
                const response = await api.get(`/api/user/${user._id}`);
                setUserData(response.data.data);
                console.log("response.data.data.emailConfirmed = =", response.data.data.emailConfirmed);
            }
        } catch (error) {
            console.error('Ошибка получения данных пользователя:', error);
        }
    };

    const fetchContent = async () => {
        const responseSubscription = await api.get('/api/dynamic-content/name/meditation-subscription');
        setSubscriptionContent(responseSubscription.data.data.content);
        const responseStars = await api.get('/api/dynamic-content/name/meditation-stars');
        setStarsContent(responseStars.data.data.content);
    }

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
        const accessType = meditation.accessType;
        
        // Если это контент за бонусы (stars)
        if (accessType === 'stars') {
            // Проверяем, зарегистрирован ли клиент
            if (!userData?.emailConfirmed) {
                // Если не зарегистрирован, показываем стандартное модальное окно
                setAccessType(accessType);
                setContent(starsContent);
                setIsModalOpen(true);
                return;
            }

            // Если зарегистрирован, проверяем бонусы
            const starsRequired = meditation.starsRequired || 0;
            if (userData.bonus < starsRequired) {
                // Недостаточно бонусов, показываем модальное окно о недостатке бонусов
                setSelectedMeditation(meditation);
                setIsInsufficientBonusModalOpen(true);
                return;
            }

            // Достаточно бонусов, показываем модальное окно подтверждения покупки
            setSelectedMeditation(meditation);
            setIsPurchaseModalOpen(true);
            return;
        }

        // Для subscription показываем стандартное модальное окно
        setAccessType(accessType);
        if (accessType === 'subscription') {
            setContent(subscriptionContent);
        }
        setIsModalOpen(true);
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
    }

    const handleClosePurchaseModal = () => {
        setIsPurchaseModalOpen(false);
        setSelectedMeditation(null);
    }

    const handleCloseInsufficientBonusModal = () => {
        setIsInsufficientBonusModalOpen(false);
        setSelectedMeditation(null);
    }

    const handlePurchaseSuccess = async () => {
        // Обновляем данные пользователя после покупки
        await fetchUserData();
        await fetchMeditations();
    }

    return (
        <div>
            <UserLayout>
                <BackNav title="Медитации" />

                <div className="px-4 mt-8 pb-10">
                    <div ref={cardsContainerRef} className="flex overflow-x-auto gap-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {meditations.length > 0 ? (
                            meditations.filter((meditation: any) => meditation.accessType === 'subscription').map((meditation: any) => (
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
                                            duration={meditation?.duration || 0}
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
                            <>
                            {meditations.filter((meditation: any) => meditation.accessType === 'stars').map((meditation: any) => (
                                <VideoCard 
                                    key={meditation._id} 
                                    title={meditation.title} 
                                    description={meditation.shortDescription} 
                                    image={meditation.imageUrl} 
                                    link={`/client/meditation/${meditation._id}`} 
                                    accessType={meditation.accessType} 
                                    progress={0} 
                                    onLockedClick={meditation.accessType !== 'free' ? () => handleLockedMeditationClick(meditation) : undefined} 
                                    starsRequired={meditation?.starsRequired || 0}
                                    duration={meditation?.duration || 0}
                                />
                            ))}
                            {meditations.filter((meditation: any) => meditation.accessType === 'free').map((meditation: any) => (
                                <VideoCard 
                                    key={meditation._id} 
                                    title={meditation.title} 
                                    description={meditation.shortDescription} 
                                    image={meditation.imageUrl} 
                                    link={`/client/meditation/${meditation._id}`} 
                                    accessType={meditation.accessType} 
                                    progress={0} 
                                    onLockedClick={meditation.accessType !== 'free' ? () => handleLockedMeditationClick(meditation) : undefined} 
                                    starsRequired={meditation?.starsRequired || 0}
                                    duration={meditation?.duration || 0}
                                />
                            ))}
                            </>
                        ) : (
                            <p className="text-center text-gray-500">Нет медитаций</p>
                        )}
                    </div>
                </div>
            </UserLayout>

            {/* Модальное окно для платных медитаций */}
            <ClientSubscriptionDynamicModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                content={content}
                accessType={accessType}
            />

            {/* Модальное окно подтверждения покупки */}
            {selectedMeditation && (
                <ClientPurchaseConfirmModal
                    isOpen={isPurchaseModalOpen}
                    onClose={handleClosePurchaseModal}
                    contentId={selectedMeditation._id}
                    contentType="meditation"
                    contentTitle={selectedMeditation.title}
                    starsRequired={selectedMeditation.starsRequired || 0}
                    userBonus={userData?.bonus || 0}
                    onPurchaseSuccess={handlePurchaseSuccess}
                />
            )}

            {/* Модальное окно недостаточного количества бонусов */}
            {selectedMeditation && (
                <ClientInsufficientBonusModal
                    isOpen={isInsufficientBonusModalOpen}
                    onClose={handleCloseInsufficientBonusModal}
                    starsRequired={selectedMeditation.starsRequired || 0}
                    userBonus={userData?.bonus || 0}
                />
            )}
        </div>
    )
}