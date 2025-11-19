import { useEffect, useState } from "react";
import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import api from "../../api";
import { ClientSubscriptionDynamicModal } from "../../components/User/ClientSubscriptionDynamicModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface TransitEntity {
    _id: string;
    startDate: string | Date;
    endDate: string | Date;
    title: string;
    subtitle?: string;
    image?: string;
    lines: any[];
    accessType: string;
}

export const ClientTransitsList = () => {
    const [transits, setTransits] = useState<TransitEntity[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [userHasPaid, setUserHasPaid] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [content, setContent] = useState<string>('');
    
    useEffect(() => {
        fetchTransits();
        fetchContent();
        fetchUserPaymentStatus();
    }, []);

    const fetchContent = async () => {
        const response = await api.get('/api/dynamic-content/name/transit-subscription');
        setContent(response.data.data.content);
    }

    const fetchUserPaymentStatus = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userData = JSON.parse(userStr);
                if (userData._id) {
                    const response = await api.post('/api/user/profile', { userId: userData._id });
                    if (response.data && response.data.success && response.data.user) {
                        setUserHasPaid(response.data.user.hasPaid || false);
                    }
                }
            }
            // Также проверяем из AuthContext
            if (user?.hasPaid !== undefined) {
                setUserHasPaid(user.hasPaid);
            }
        } catch (error) {
            console.error('Ошибка загрузки статуса оплаты:', error);
        }
    };

    const isTransitActive = (transit: TransitEntity): boolean => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        const start = typeof transit.startDate === 'string' ? new Date(transit.startDate) : transit.startDate;
        const end = typeof transit.endDate === 'string' ? new Date(transit.endDate) : transit.endDate;
        
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        
        return start <= now && end >= now;
    };

    const fetchTransits = async () => {
        setLoading(true);
        try {
            const response = await api.get("/api/transit");
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                // Сортируем: активные транзиты первыми
                const sortedTransits = [...response.data.data].sort((a, b) => {
                    const aActive = isTransitActive(a);
                    const bActive = isTransitActive(b);
                    if (aActive && !bActive) return -1;
                    if (!aActive && bActive) return 1;
                    return 0;
                });
                setTransits(sortedTransits);
            }
        } catch (error) {
            console.error("Failed to fetch transits", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDateRange = (startDate: string | Date, endDate: string | Date): string => {
        const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
        const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
        
        const year = start.getFullYear();
        const startDay = start.getDate();
        const endDay = end.getDate();
        
        const monthNames = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];
        
        const startMonth = monthNames[start.getMonth()];
        const endMonth = monthNames[end.getMonth()];
        
        return `${year}: ${startDay} ${startMonth} - ${endDay} ${endMonth}`;
    };

    const handleTransitClick = async (transit: TransitEntity) => {
        // Проверяем, активен ли транзит (startDate <= currentDate <= endDate)
        const isActive = isTransitActive(transit);
        
        if (isActive) {
            // Если транзит активен, показываем его сразу
            navigate(`/client/transit/${transit._id}`);
        } else {
            // Если транзит не активен (startDate > currentDate или endDate < currentDate), проверяем подписку
            let hasPaid = userHasPaid;
            
            // Обновляем статус оплаты перед проверкой
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const userData = JSON.parse(userStr);
                    if (userData._id) {
                        const response = await api.post('/api/user/profile', { userId: userData._id });
                        if (response.data && response.data.success && response.data.user) {
                            hasPaid = response.data.user.hasPaid || false;
                            setUserHasPaid(hasPaid);
                        }
                    }
                }
            } catch (error) {
                console.error('Ошибка проверки статуса оплаты:', error);
            }
            if (!hasPaid) {
                // Показываем модальное окно подписки
                setShowModal(true);
            } else {
                // Если есть подписка, показываем транзит
                navigate(`/client/transit/${transit._id}`);
            }
        }
    };

    return (
        <UserLayout>
            <BackNav title="Все транзиты" />
            <div className="px-4 mt-4 pb-10">
                {loading ? (
                    <div className="text-center py-8">
                        <p className="text-white/60">Загрузка...</p>
                    </div>
                ) : transits.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-white/60">Нет транзитов</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transits.map((transit) => {
                            const isActive = isTransitActive(transit);
                            return (
                                <div
                                    key={transit._id}
                                    onClick={() => handleTransitClick(transit)}
                                    className="bg-[#333333] rounded-lg p-4 cursor-pointer hover:bg-[#3a3a3a] transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-white">{formatDateRange(transit.startDate, transit.endDate)}</h3>
                                            <p className="text-sm text-white/60 mt-1">
                                                {transit.title}
                                            </p>
                                        </div>
                                        {isActive && (
                                            <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                                                Активен
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <ClientSubscriptionDynamicModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                content={content}
            />
        </UserLayout>
    );
};

