import { useEffect, useState } from "react";
import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import api from "../../api";
import { ClientSubscriptionDynamicModal } from "../../components/User/ClientSubscriptionDynamicModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface HoroscopeEntity {
    _id: string;
    startDate: string | Date;
    endDate: string | Date;
    title: string;
    subtitle?: string;
    image?: string;
    lines: any[];
    accessType: string;
}

export const ClientHoroscopesList = () => {
    const [horoscopes, setHoroscopes] = useState<HoroscopeEntity[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [userHasPaid, setUserHasPaid] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [content, setContent] = useState<string>('');

    useEffect(() => {
        fetchHoroscopes();
        fetchUserPaymentStatus();
        fetchContent();
    }, []);

    const fetchContent = async () => {
        const response = await api.get('/api/dynamic-content/name/horoscope-subscription');
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

    const fetchHoroscopes = async () => {
        setLoading(true);
        try {
            const response = await api.get("/api/horoscope");
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                setHoroscopes(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch horoscopes", error);
        } finally {
            setLoading(false);
        }
    };

    const isHoroscopeActive = (horoscope: HoroscopeEntity): boolean => {
        const now = new Date();
        const nowMonth = now.getMonth();
        const nowDay = now.getDate();
        
        const start = typeof horoscope.startDate === 'string' ? new Date(horoscope.startDate) : horoscope.startDate;
        const end = typeof horoscope.endDate === 'string' ? new Date(horoscope.endDate) : horoscope.endDate;
        
        const startMonth = start.getMonth();
        const startDay = start.getDate();
        const endMonth = end.getMonth();
        const endDay = end.getDate();
        
        // Если период пересекает границу года (например, декабрь - январь)
        if (startMonth > endMonth) {
            // Текущая дата должна быть либо после start (в том же году), либо до end (в следующем году)
            return (nowMonth > startMonth || (nowMonth === startMonth && nowDay >= startDay)) ||
                   (nowMonth < endMonth || (nowMonth === endMonth && nowDay <= endDay));
        } else {
            // Обычный случай: период в пределах одного года
            return (nowMonth > startMonth || (nowMonth === startMonth && nowDay >= startDay)) &&
                   (nowMonth < endMonth || (nowMonth === endMonth && nowDay <= endDay));
        }
    };

    const handleHoroscopeClick = async (horoscope: HoroscopeEntity) => {
        // Проверяем, активен ли гороскоп (startDate <= currentDate <= endDate)
        const isActive = isHoroscopeActive(horoscope);
        
        if (isActive) {
            // Если гороскоп активен, показываем его сразу
            navigate(`/client/horoscope/${horoscope._id}`);
        } else {
            // Если гороскоп не активен (startDate > currentDate или endDate < currentDate), проверяем подписку
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
                // Если есть подписка, показываем гороскоп
                navigate(`/client/horoscope/${horoscope._id}`);
            }
        }
    };

    return (
        <UserLayout>
            <BackNav title="Все гороскопы" />
            <div className="px-4 mt-4 pb-10">
                {loading ? (
                    <div className="text-center py-8">
                        <p className="text-white/60">Загрузка...</p>
                    </div>
                ) : horoscopes.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-white/60">Нет гороскопов</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {horoscopes.map((horoscope) => {
                            const isActive = isHoroscopeActive(horoscope);
                            return (
                                <div
                                    key={horoscope._id}
                                    onClick={() => handleHoroscopeClick(horoscope)}
                                    className="bg-[#333333] rounded-lg p-4 cursor-pointer hover:bg-[#3a3a3a] transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-white">{horoscope.title}</h3>
                                            <p className="text-sm text-white/60 mt-1">
                                                {horoscope.subtitle}
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

