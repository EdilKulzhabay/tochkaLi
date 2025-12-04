import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import profile from "../../assets/profile.png";
import profileStar from "../../assets/profileStar.png";
import arrowRight from "../../assets/arrowRight.png";
import copyLink from "../../assets/copyLink.png";
import linkArrow from "../../assets/linkArrow.png";
import { MyLink } from "../../components/User/MyLink";
import { Switch } from "../../components/User/Switch";

export const ClientProfile = () => {
    const [userData, setUserData] = useState<any>(null);
    const [notifications, setNotifications] = useState(true);
    const [locatedInRussia, setLocatedInRussia] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
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
            setNotifications(response.data.user.notifyPermission);
            setLocatedInRussia(response.data.user.locatedInRussia);
        }
    }

    const copyReferralLink = async () => {
        if (userData?.telegramId) {
            const referralLink = `t.me/@io_tochkali_bot?start=${userData.telegramId}`;
            try {
                await navigator.clipboard.writeText(referralLink);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
            } catch (error) {
                console.error('Ошибка копирования ссылки:', error);
            }
        }
    }

    const updateUserData = async (field: string, value: boolean) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await api.patch(`/api/user/${user._id}`, { [field]: value });
        if (response.data.success) {
            setUserData(response.data.user);
        }
    }
    return (
        <div>
            <UserLayout>
                <BackNav title="Профиль" />
                <div className="px-4 mt-2 pb-10 bg-[#161616]">
                    <div className="flex items-center gap-x-4">
                        <div className="w-[60px] h-[60px] bg-[#333333] rounded-full flex items-center justify-center">
                            <img src={profile} alt="profile" className="w-[30px] h-[30px] object-cover rounded-full" />
                        </div>
                        <div>
                            <div className="text-xl font-medium">{userData?.fullName}</div>
                            <div>{userData?.mail || ""}</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-x-3 mt-4 bg-[#333333] rounded-lg p-4">
                        <div className="shrink-0">
                            <img src={profileStar} alt="star" className="w-8 h-8 object-cover" />
                        </div>
                        <div className="w-full">
                            <div className="flex items-center justify-between w-full">
                                <div className="text-xl font-medium">Звезды</div>
                                <div className="text-xl font-medium">{userData?.bonus}</div>
                            </div>
                            <div className="mt-1">
                            За выполнение бесполезного упражнения, ведение дневника и приглашение друзей. Звезды обмениваются на эксклюзивный контент, который нельзя купить
                            </div>
                            {!userData?.emailConfirmed && (
                                <Link to="/client/register" className="flex items-center gap-x-2 mt-2.5">
                                    <div className="text-sm text-[#FFC293]">Пройти регистрацию для начисления Звезд</div>
                                    <img src={arrowRight} alt="arrowRight" className="w-4 h-4 object-cover" />
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 bg-[#333333] rounded-lg p-4 space-y-2">
                        <div className="text-xl font-medium">Статус подписки на клуб .li</div>
                        {userData?.hasPaid && userData?.subscriptionEndDate && new Date(userData.subscriptionEndDate) > new Date() ? (
                            <div>
                                Ваша подписка действует до{' '}
                                {userData?.subscriptionEndDate ? new Date(userData.subscriptionEndDate).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                            </div>
                        ) : (
                            <div>У вас нет подписки на клуб .li</div>
                        )}
                    </div>

                    {userData?.invitedUser && (
                        <div className="mt-4 bg-[#333333] rounded-lg p-4 space-y-2">
                            <div className="text-xl font-medium">Вас пригласил</div>
                            <div>
                                {userData.invitedUser.telegramUserName 
                                    ? `@${userData.invitedUser.telegramUserName}`
                                    : ''
                                }
                                {userData.invitedUser.fullName 
                                    ? `, ${userData.invitedUser.fullName}`
                                    : ''
                                }
                            </div>
                        </div>
                    )}

                    <div onClick={copyReferralLink} className="mt-4 bg-[#333333] rounded-lg p-4 space-y-2 cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div className="text-xl font-medium">Пригласи друга по ссылке</div>
                            <div className="text-lg font-medium">{userData?.inviteesCount}</div>
                        </div>
                        <div className="flex items-center gap-x-2">
                            <div 
                                className="break-all"
                            >
                                {userData?.telegramId 
                                    ? `t.me/io_tochkali_bot?start=${userData.telegramId}`
                                    : 'Загрузка...'
                                }
                            </div>
                            <img src={copyLink} alt="copy" className="w-5 h-5 object-cover" />
                        </div>
                        {linkCopied && (
                            <div className="text-sm text-[#EC1313] mt-1">Ссылка скопирована!</div>
                        )}
                    </div>

                    <div className="mt-4 flex items-center gap-x-2">
                        <a
                            href="https://t.me/tochka_li"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="basis-1/2 bg-[#333333] rounded-lg p-4 flex items-center gap-x-2.5"
                        >
                            <div className="font-medium text-sm">Телеграм канал проекта .li</div>
                            <img src={linkArrow} alt="linkArrow" className="w-5 h-5 object-cover shrink-0" />
                        </a>
                        <a
                            href="https://t.me/tochka_li"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="basis-1/2 bg-[#333333] rounded-lg p-4 flex items-center gap-x-2.5"
                        >
                            <div className="font-medium text-sm">Телеграм канал клуба .li</div>
                            <img src={linkArrow} alt="linkArrow" className="w-5 h-5 object-cover shrink-0" />
                        </a>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <div>Просмотр видео в РФ без VPN</div>
                        <Switch checked={locatedInRussia} onChange={() => {
                            updateUserData('locatedInRussia', !locatedInRussia);
                            setLocatedInRussia(!locatedInRussia);
                        }} />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <div>Разрешить уведомления</div>
                        <Switch checked={notifications} onChange={() => {
                            updateUserData('notifyPermission', !notifications);
                            setNotifications(!notifications);
                        }} />
                    </div>

                    <MyLink to="/client/contactus" text="Связаться с нами" className='w-full mt-4' color='red'/>
                </div>
            </UserLayout>
        </div>
    )
}