import { UserLayout } from "../../components/User/UserLayout"
import { BackNav } from "../../components/User/BackNav"
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import arrowDown from "../../assets/arrowDown.png";
import { Switch } from "../../components/User/Switch.tsx";
import { RedButton } from "../../components/User/RedButton.tsx";
import { toast } from "react-toastify";

export const ClientDiary = () => {
    const [diary, setDiary] = useState<any>({
        discovery: '',
        achievement: '',
        gratitude: '',
        uselessTask: false,
    });
    const [diaries, setDiaries] = useState<any>([]);
    const [isOpenToday, setIsOpenToday] = useState(false);
    const [showTodayDiary, setShowTodayDiary] = useState(true);
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

        fetchDiaries();
    }, [navigate]);

    const fetchDiaries = async () => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await api.post('/api/diary/my', {userId: userData._id}, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        setDiaries(response.data.data.map((diary: any) => ({
            ...diary,
            isOpen: false,
        })));
        if (response.data.data.length > 0 && response.data.data[0].createdAt.split('T')[0] === new Date().toISOString().split('T')[0]) {
            setShowTodayDiary(false);
        }
    }

    const handleChange = (e: any) => {
        setDiary({ ...diary, [e.target.name]: e.target.value });
    }

    const handleSubmit = async () => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        console.log(userData);
        const response = await api.post('/api/diary', {userId: userData._id, ...diary}, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.data.success) {
            toast.success('Дневник успешно сохранен');
            fetchDiaries();
        } else {
            toast.error(response.data.message);
        }
    }

    const handleToggleDiaryToday = () => {
        setIsOpenToday(!isOpenToday);
    }

    return (
        <div>
            <UserLayout>
                <BackNav title="Дневник ОДБ" />
                <div className="px-4 mt-8 pb-10">
                    <p className="mt-4">
                        Закрепляйте свои каждодневные достижения на материальном носителе – ведите Дневник открытий, достижений и благодарности. Эта простая технология позволяет избегать уныния и быть в состоянии искреннего интереса к жизни. Записывайте в него все, что вам пришло в голову, даже если оно кажется неважным.
                    </p>

                    {showTodayDiary && (
                        <>
                            <div className="mt-4 bg-[#333333] p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-medium">Сегодня</h2>
                                    <button onClick={handleToggleDiaryToday}>
                                        <img 
                                            src={arrowDown}
                                            alt="arrow-down"
                                            className={`w-4 h-4 transition-transform duration-300 ${isOpenToday ? "rotate-180" : ""}`}
                                        />
                                    </button>
                                </div>
                                {isOpenToday && (
                                    <div className="mt-3 space-y-3">
                                        <div className="p-2 border border-white/40 rounded-lg">
                                            <p className="text-sm font-medium">Открытие</p>
                                            <textarea 
                                                name="discovery"
                                                value={diary.discovery}
                                                onChange={handleChange}
                                                className="w-full mt-1 focus:outline-none focus:border-white/80"
                                                placeholder="Что нового вы открыли для себя сегодня?"
                                                rows={1}
                                                style={{
                                                    overflow: "hidden",
                                                    minHeight: "2.5rem",
                                                    maxHeight: "7.5rem"
                                                }}
                                                onInput={e => {
                                                    const target = e.target as HTMLTextAreaElement;
                                                    target.style.height = "2.5rem";
                                                    target.style.height = Math.min(target.scrollHeight, 7.5 * 16) + "px";
                                                }}
                                            />
                                        </div>
                                        <div className="p-2 border border-white/40 rounded-lg">
                                            <p className="text-sm font-medium">Достижение</p>
                                            <textarea 
                                                name="achievement" 
                                                value={diary.achievement} 
                                                onChange={handleChange} 
                                                className="w-full mt-1 focus:outline-none focus:border-white/80" 
                                                placeholder="Что нового вы достигли сегодня?"
                                                rows={1}
                                                style={{
                                                    overflow: "hidden",
                                                    minHeight: "2.5rem",
                                                    maxHeight: "7.5rem"
                                                }}
                                                onInput={e => {
                                                    const target = e.target as HTMLTextAreaElement;
                                                    target.style.height = "2.5rem";
                                                    target.style.height = Math.min(target.scrollHeight, 7.5 * 16) + "px";
                                                }}
                                            />
                                        </div>
                                        <div className="p-2 border border-white/40 rounded-lg">
                                            <p className="text-sm font-medium">Благодарность</p>
                                            <textarea 
                                                name="gratitude" 
                                                value={diary.gratitude} 
                                                onChange={handleChange} 
                                                className="w-full mt-1 focus:outline-none focus:border-white/80" 
                                                placeholder="Кому и за что вы благодарны сегодня?"
                                                rows={1}
                                                style={{
                                                    overflow: "hidden",
                                                    minHeight: "2.5rem",
                                                    maxHeight: "7.5rem"
                                                }}
                                                onInput={e => {
                                                    const target = e.target as HTMLTextAreaElement;
                                                    target.style.height = "2.5rem";
                                                    target.style.height = Math.min(target.scrollHeight, 7.5 * 16) + "px";
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">Бесполезное упражнение</p>
                                            <Switch
                                                checked={diary.uselessTask}
                                                onChange={() => setDiary({ ...diary, uselessTask: !diary.uselessTask })}
                                                className=""
                                            />

                                        </div>
                                    </div>
                                )}
                            </div>
                            {isOpenToday && (
                                <div className="mt-3">
                                    <RedButton text="Сохранить" onClick={handleSubmit} className="w-full" />
                                </div>
                            )}
                        </>
                    )}

                    {diaries.length > 0 && (
                        <div className="mt-3">
                            {diaries.map((diary: any) => (
                                <div key={diary._id} className="mt-4 bg-[#333333] p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-medium">
                                            {diary.createdAt.split('T')[0] === new Date().toISOString().split('T')[0] ? 'Сегодня' : new Date(diary.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </h2>
                                        <button onClick={() => { setDiaries(diaries.map((d: any) => ({ ...d, isOpen: d._id === diary._id ? !d.isOpen : d.isOpen }))); }}>
                                            <img 
                                                src={arrowDown}
                                                alt="arrow-down"
                                                className={`w-4 h-4 transition-transform duration-300 ${isOpenToday ? "rotate-180" : ""}`}
                                            />
                                        </button>
                                    </div>
                                    {diary.isOpen && (
                                        <div className="mt-3 space-y-3">
                                            <div className="p-2 border border-white/40 rounded-lg max-h-[100px] overflow-y-auto">
                                                <p className="text-sm font-medium">Открытие</p>
                                                <p className="mt-1.5">{diary.discovery}</p>
                                            </div>
                                            <div className="p-2 border border-white/40 rounded-lg max-h-[100px] overflow-y-auto">
                                                <p className="text-sm font-medium">Достижение</p>
                                                <p className="mt-1.5">{diary.achievement}</p>
                                            </div>
                                            <div className="p-2 border border-white/40 rounded-lg max-h-[100px] overflow-y-auto">
                                                <p className="text-sm font-medium">Благодарность</p>
                                                <p className="mt-1.5">{diary.gratitude}</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium">Бесполезное упражнение</p>
                                                <Switch
                                                    checked={diary.uselessTask}
                                                    onChange={() => setDiary({ ...diary, uselessTask: !diary.uselessTask })}
                                                    className=""
                                                />

                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </UserLayout>
        </div>
    )
}