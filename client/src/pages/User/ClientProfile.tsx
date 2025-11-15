import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import profile from "../../assets/profile.png";
import profileStar from "../../assets/profileStar.png";
import arrowRight from "../../assets/arrowRight.png";
import arrowDown from "../../assets/arrowDown.png";
import linkArrow from "../../assets/linkArrow.png";
import { MyLink } from "../../components/User/MyLink";
import { Switch } from "../../components/User/Switch";

export const ClientProfile = () => {
    const [userData, setUserData] = useState<any>(null);
    const [notifications, setNotifications] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Проверяем авторизацию
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
            navigate('/client/login');
            return;
        }

        try {
            const user = JSON.parse(userStr);
            // Проверяем, что пользователь зарегистрирован (есть токен и подтвержденный email)
            if (!user.emailConfirmed) {
                navigate('/client/login');
                return;
            }
        } catch (e) {
            navigate('/client/login');
            return;
        }

        fetchUserData();
    }, [navigate]);

    const fetchUserData = async () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await api.post('/api/user/profile', { userId: user._id }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.data.success) {
            setUserData(response.data.user);
        }
    }

    return (
        <div>
            <UserLayout>
                <BackNav title="Профиль" />
                <div className="px-4 mt-8 pb-10">
                    <div className="flex items-center gap-x-4">
                        <div className="w-[60px] h-[60px] bg-[#333333] rounded-full flex items-center justify-center">
                            <img src={profile} alt="profile" className="w-[30px] h-[30px] object-cover rounded-full" />
                        </div>
                        <div className="text-xl font-medium">{userData?.telegramUserName}</div>
                    </div>

                    <div className="flex items-start gap-x-3 mt-4 bg-[#333333] rounded-lg p-4">
                        <div className="shrink-0">
                            <img src={profileStar} alt="star" className="w-8 h-8 object-cover" />
                        </div>
                        <div>
                            <div className="flex items-center justify-between w-full">
                                <div className="text-xl font-medium">Звезды</div>
                                <div className="text-xl font-medium">{userData?.bonus}</div>
                            </div>
                            <div className="mt-1">
                            За выполнение бесполезного упражнения, ведение дневника и приглашение друзей. Звезды обмениваются на эксклюзивный контент, который нельзя купить
                            </div>
                            <div className="flex items-center gap-x-2 mt-2.5">
                                <div className="text-sm text-[#FFC293]">Пройти регистрацию для начисления Звезд</div>
                                <img src={arrowRight} alt="arrowRight" className="w-4 h-4 object-cover" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 bg-[#333333] rounded-lg p-4 space-y-2">
                        <div className="text-xl font-medium">Статус подписки на клуб .li</div>
                        <div>Ваша подписка действует до 12.11.2025</div>
                    </div>

                    <div className="mt-4 bg-[#333333] rounded-lg p-4 space-y-2">
                        <div className="text-xl font-medium">Вас пригласил</div>
                        <div>@ivan_trifonov, Иван Трифонов</div>
                    </div>

                    <div className="mt-4 bg-[#333333] rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="text-xl font-medium">Пригласи друга по ссылке</div>
                            <img src={arrowDown} alt="arrowDown" className="w-6 h-6 object-cover -rotate-90" />
                        </div>
                        <div>https://ref.tochka.li/18ls4abS</div>
                    </div>

                    <div className="mt-4 flex items-center gap-x-2">
                        <a
                            href={``}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="basis-1/2 bg-[#333333] rounded-lg p-4 flex items-center gap-x-2.5"
                        >
                            <div className="font-medium text-sm">Телеграм канал проекта .li</div>
                            <img src={linkArrow} alt="linkArrow" className="w-5 h-5 object-cover shrink-0" />
                        </a>
                        <a
                            href={``}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="basis-1/2 bg-[#333333] rounded-lg p-4 flex items-center gap-x-2.5"
                        >
                            <div className="font-medium text-sm">Телеграм канал клуба .li</div>
                            <img src={linkArrow} alt="linkArrow" className="w-5 h-5 object-cover shrink-0" />
                        </a>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <div>Разрешить уведомления</div>
                        <Switch checked={notifications} onChange={() => setNotifications(!notifications)} />
                    </div>

                    <MyLink to="/client/contactus" text="Связаться с нами" className='w-full mt-4' color='red'/>
                </div>
            </UserLayout>
        </div>
    )
}