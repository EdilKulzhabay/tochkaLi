import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import { useState, useEffect, useRef } from "react";
import api from "../../api";
import { MiniVideoCard } from "../../components/User/MiniVideoCard";
import { VideoCard } from "../../components/User/VideoCard";
import { ClientSubscriptionDynamicModal } from "../../components/User/ClientSubscriptionDynamicModal";
import { ClientPurchaseConfirmModal } from "../../components/User/ClientPurchaseConfirmModal";
import { ClientInsufficientBonusModal } from "../../components/User/ClientInsufficientBonusModal";

export const ClientPracticesList = () => {
    const [practices, setPractices] = useState([]);
    const [cardHeight, setCardHeight] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isInsufficientBonusModalOpen, setIsInsufficientBonusModalOpen] = useState(false);
    const cardsContainerRef = useRef<HTMLDivElement>(null);
    const [subscriptionContent, setSubscriptionContent] = useState<string>('');
    const [starsContent, setStarsContent] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [accessType, setAccessType] = useState<string>('');
    const [userData, setUserData] = useState<any>(null);
    const [selectedPractice, setSelectedPractice] = useState<any>(null);

    useEffect(() => {
        fetchPractices();
        fetchContent();
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user._id) {
                const response = await api.get(`/api/user/${user._id}`);
                setUserData(response.data.data);
            }
        } catch (error) {
            console.error('Ошибка получения данных пользователя:', error);
        }
    };

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

    const handleLockedPracticeClick = (practice: any) => {
        const accessType = practice.accessType;
        
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
            const starsRequired = practice.starsRequired || 0;
            if (userData.bonus < starsRequired) {
                // Недостаточно бонусов, показываем модальное окно о недостатке бонусов
                setSelectedPractice(practice);
                setIsInsufficientBonusModalOpen(true);
                return;
            }

            // Достаточно бонусов, показываем модальное окно подтверждения покупки
            setSelectedPractice(practice);
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
        setSelectedPractice(null);
    }

    const handleCloseInsufficientBonusModal = () => {
        setIsInsufficientBonusModalOpen(false);
        setSelectedPractice(null);
    }

    const handlePurchaseSuccess = async () => {
        // Обновляем данные пользователя после покупки
        await fetchUserData();
        await fetchPractices();
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
                                            onLockedClick={practice.accessType !== 'free' ? () => handleLockedPracticeClick(practice) : undefined}
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
                                            onLockedClick={practice.accessType !== 'free' ? () => handleLockedPracticeClick(practice) : undefined} 
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
                                            onLockedClick={practice.accessType !== 'free' ? () => handleLockedPracticeClick(practice) : undefined} 
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
                accessType={accessType}
            />

            {/* Модальное окно подтверждения покупки */}
            {selectedPractice && (
                <ClientPurchaseConfirmModal
                    isOpen={isPurchaseModalOpen}
                    onClose={handleClosePurchaseModal}
                    contentId={selectedPractice._id}
                    contentType="practice"
                    contentTitle={selectedPractice.title}
                    starsRequired={selectedPractice.starsRequired || 0}
                    userBonus={userData?.bonus || 0}
                    onPurchaseSuccess={handlePurchaseSuccess}
                />
            )}

            {/* Модальное окно недостаточного количества бонусов */}
            {selectedPractice && (
                <ClientInsufficientBonusModal
                    isOpen={isInsufficientBonusModalOpen}
                    onClose={handleCloseInsufficientBonusModal}
                    starsRequired={selectedPractice.starsRequired || 0}
                    userBonus={userData?.bonus || 0}
                />
            )}
        </div>
    )
}

