import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import { useState, useEffect, useRef } from "react";
import api from "../../api";
import { MiniVideoCard } from "../../components/User/MiniVideoCard";
import { VideoCard } from "../../components/User/VideoCard";
import { ClientSubscriptionDynamicModal } from "../../components/User/ClientSubscriptionDynamicModal";
import { ClientPurchaseConfirmModal } from "../../components/User/ClientPurchaseConfirmModal";
import { ClientInsufficientBonusModal } from "../../components/User/ClientInsufficientBonusModal";

export const ClientVideoLessonsList = () => {
    const [videoLessons, setVideoLessons] = useState([]);
    const [cardHeight, setCardHeight] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isInsufficientBonusModalOpen, setIsInsufficientBonusModalOpen] = useState(false);
    const cardsContainerRef = useRef<HTMLDivElement>(null);
    const [content, setContent] = useState<string>('');
    const [subscriptionContent, setSubscriptionContent] = useState<string>('');
    const [starsContent, setStarsContent] = useState<string>('');
    const [accessType, setAccessType] = useState<string>('');
    const [userData, setUserData] = useState<any>(null);
    const [selectedVideoLesson, setSelectedVideoLesson] = useState<any>(null);
    const [progresses, setProgresses] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchVideoLessons();
        fetchContent();
        fetchUserData();
    }, []);

    useEffect(() => {
        if (videoLessons.length > 0 && userData?._id) {
            fetchProgresses();
        }
    }, [videoLessons, userData]);

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
    }

    const fetchContent = async () => {
        const responseSubscription = await api.get('/api/dynamic-content/name/video-subscription');
        setSubscriptionContent(responseSubscription.data.data.content);
        const responseStars = await api.get('/api/dynamic-content/name/video-stars');
        setStarsContent(responseStars.data.data.content);
    }

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

    const fetchProgresses = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user._id) return;

            const contentIds = videoLessons.map((vl: any) => vl._id);
            if (contentIds.length === 0) return;

            const response = await api.post(`/api/video-progress/batch/${user._id}/videoLesson`, {
                contentIds
            });

            if (response.data.success && response.data.data) {
                const progressMap: Record<string, number> = {};
                Object.keys(response.data.data).forEach((contentId) => {
                    progressMap[contentId] = response.data.data[contentId].progress || 0;
                });
                setProgresses(progressMap);
            }
        } catch (error) {
            console.error('Ошибка получения прогрессов:', error);
        }
    }

    const handleLockedVideoLessonClick = (videoLesson: any) => {
        const accessType = videoLesson.accessType;
        
        // Проверяем, есть ли уже доступ к контенту
        if (hasAccessToContent(videoLesson._id)) {
            // Если есть доступ, ничего не делаем (контент уже доступен)
            return;
        }
        
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
            const starsRequired = videoLesson.starsRequired || 0;
            if (userData.bonus < starsRequired) {
                // Недостаточно бонусов, показываем модальное окно о недостатке бонусов
                setSelectedVideoLesson(videoLesson);
                setIsInsufficientBonusModalOpen(true);
                return;
            }

            // Достаточно бонусов, показываем модальное окно подтверждения покупки
            setSelectedVideoLesson(videoLesson);
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
    const handleLockedVideoLessonClickSubscription = (videoLesson: any) => {
        const accessType = videoLesson.accessType;
        
        // Проверяем, есть ли уже доступ к контенту
        if (hasAccessToContentSubscription()) {
            // Если есть доступ, ничего не делаем (контент уже доступен)
            return;
        }
        
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
            const starsRequired = videoLesson.starsRequired || 0;
            if (userData.bonus < starsRequired) {
                // Недостаточно бонусов, показываем модальное окно о недостатке бонусов
                setSelectedVideoLesson(videoLesson);
                setIsInsufficientBonusModalOpen(true);
                return;
            }

            // Достаточно бонусов, показываем модальное окно подтверждения покупки
            setSelectedVideoLesson(videoLesson);
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
        setSelectedVideoLesson(null);
    }

    const handleCloseInsufficientBonusModal = () => {
        setIsInsufficientBonusModalOpen(false);
        setSelectedVideoLesson(null);
    }

    const handlePurchaseSuccess = async () => {
        // Обновляем данные пользователя после покупки
        await fetchUserData();
        await fetchVideoLessons();
    }

    // Проверка доступа к контенту
    const hasAccessToContent = (contentId: string): boolean => {
        if (!userData?.products) return false;
        return userData.products.some(
            (product: any) => product.productId === contentId && product.type === 'one-time' && product.paymentStatus === 'paid'
        );
    }

    const hasAccessToContentSubscription = (): boolean => {
        if (userData?.hasPaid && userData?.subscriptionEndDate && new Date(userData.subscriptionEndDate) > new Date()) return true;
        return false;
    }

    return (
        <div>
            <UserLayout>
                <BackNav title="Видео уроки" />

                <div className="px-4 mt-8 pb-10 bg-[#161616]">
                    <div ref={cardsContainerRef} className="flex overflow-x-auto gap-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {videoLessons.length > 0 ? (
                            videoLessons.filter((videoLesson: any) => videoLesson.accessType === 'subscription').map((videoLesson: any) => (
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
                                            progress={progresses[videoLesson._id] || 0} 
                                            accessType={hasAccessToContentSubscription() ? 'free' : videoLesson.accessType}
                                            onLockedClick={hasAccessToContentSubscription() ? undefined : (videoLesson.accessType !== 'free' ? () => handleLockedVideoLessonClickSubscription(videoLesson) : undefined)}
                                            duration={videoLesson?.duration || 0}
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
                            <>
                                {
                                    videoLessons.filter((videoLesson: any) => videoLesson.accessType === 'stars').map((videoLesson: any) => (
                                        <VideoCard 
                                            key={videoLesson._id} 
                                            title={videoLesson.title} 
                                            description={videoLesson.shortDescription} 
                                            image={videoLesson.imageUrl} 
                                            link={`/client/video-lesson/${videoLesson._id}`} 
                                            accessType={hasAccessToContent(videoLesson._id) ? 'free' : videoLesson.accessType} 
                                            progress={progresses[videoLesson._id] || 0} 
                                            onLockedClick={hasAccessToContent(videoLesson._id) ? undefined : (videoLesson.accessType !== 'free' ? () => handleLockedVideoLessonClick(videoLesson) : undefined)} 
                                            starsRequired={videoLesson?.starsRequired || 0}
                                            duration={videoLesson?.duration || 0}
                                        />
                                    ))
                                }
                                {
                                    videoLessons.filter((videoLesson: any) => videoLesson.accessType === 'free').map((videoLesson: any) => (
                                        <VideoCard 
                                            key={videoLesson._id} 
                                            title={videoLesson.title} 
                                            description={videoLesson.shortDescription} 
                                            image={videoLesson.imageUrl} 
                                            link={`/client/video-lesson/${videoLesson._id}`} 
                                            accessType={hasAccessToContent(videoLesson._id) ? 'free' : videoLesson.accessType} 
                                            progress={progresses[videoLesson._id] || 0} 
                                            onLockedClick={hasAccessToContent(videoLesson._id) ? undefined : (videoLesson.accessType !== 'free' ? () => handleLockedVideoLessonClick(videoLesson) : undefined)} 
                                            starsRequired={videoLesson?.starsRequired || 0}
                                            duration={videoLesson?.duration || 0}
                                        />
                                    ))
                                }
                            </>
                        ) : (
                            <p className="text-center text-gray-500">Нет видео уроков</p>
                        )}
                    </div>
                </div>
            </UserLayout>

            {/* Модальное окно для платных видео уроков */}
            <ClientSubscriptionDynamicModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                content={content}
                accessType={accessType}
            />

            {/* Модальное окно подтверждения покупки */}
            {selectedVideoLesson && (
                <ClientPurchaseConfirmModal
                    isOpen={isPurchaseModalOpen}
                    onClose={handleClosePurchaseModal}
                    contentId={selectedVideoLesson._id}
                    contentType="video-lesson"
                    contentTitle={selectedVideoLesson.title}
                    starsRequired={selectedVideoLesson.starsRequired || 0}
                    userBonus={userData?.bonus || 0}
                    onPurchaseSuccess={handlePurchaseSuccess}
                />
            )}

            {/* Модальное окно недостаточного количества бонусов */}
            {selectedVideoLesson && (
                <ClientInsufficientBonusModal
                    isOpen={isInsufficientBonusModalOpen}
                    onClose={handleCloseInsufficientBonusModal}
                    starsRequired={selectedVideoLesson.starsRequired || 0}
                    userBonus={userData?.bonus || 0}
                />
            )}
        </div>
    )
}

