import { UserLayout } from "../../components/User/UserLayout"
import { Link } from "react-router-dom"
import logo from "../../assets/logo.png"
import users from "../../assets/users.png"
import faq from "../../assets/faq.png"
import user from "../../assets/user.png"
import LC1 from "../../assets/LC1.png"
import LC2 from "../../assets/LC2.png"
import LC3 from "../../assets/LC3.png"


const SmallCard = ({ title, link}: { title: string, link: string }) => {
    return (
        <Link to={link} className="min-h-24 flex items-center bg-[#333333] relative rounded-lg p-4 overflow-hidden">
            <p className="text-sm font-medium">{title}</p>
            <div className="absolute top-0 right-0 bg-white/10 rounded-full translate-x-1/4 -translate-y-1/3"
                style={{
                    width: "33.33%",
                    aspectRatio: "1 / 1",
                }}
            />
        </Link>
    )
}

const LargeCard = ({ title, link, image, content }: { title: string, link: string, image: string, content: string }) => {
    return (
        <Link to={link} className="flex items-center bg-[#333333] rounded-lg p-4 gap-x-4">
            <div className="basis-2/3">
                <p className="text-lg font-medium">{title}</p>
                <p className="text-sm mt-1">{content}</p>    
            </div>
            <div className="basis-1/3">
                <img src={image} alt={title} className="w-full object-cover" />
            </div>
        </Link>
    )
}

export const Main = () => {

    return (
        <UserLayout>
            <div className="px-4 pb-10">
                <div className="flex items-center justify-between pt-5 pb-4">
                    <div className="">
                        <img src={logo} alt="logo" className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-6">
                        <Link to="/">
                            <img src={users} alt="users" className="w-6 h-6" />
                        </Link>
                        <Link to="/client/faq">
                            <img src={faq} alt="faq" className="w-6 h-6" />
                        </Link>
                        <Link to="/user">
                            <img src={user} alt="user" className="w-6 h-6" />
                        </Link>
                    </div>
                </div>
                <h1 className="mt-3 text-2xl font-bold">Добро пожаловать!</h1>
                <div className="grid grid-cols-2 gap-4 mt-3">
                    <SmallCard title="Дневник" link="/my-clubs" />
                    <SmallCard title="Расписание" link="/client/schedule" />
                    <SmallCard title="Описание транзитов" link="/client/transit" />
                    <SmallCard title="Антисоциумный гороскоп" link="/client/horoscope" />
                </div>
                <div className="mt-4 space-y-3">
                    <LargeCard 
                        title="Видео" 
                        link="/client/video-lessons" 
                        image={LC1} 
                        content="Самые популярные видео проекта .li, которые содержать эксклюзивный контент и знакомят с нами" 
                    />
                    <LargeCard 
                        title="Практики" 
                        link="/client/practices" 
                        image={LC2} 
                        content="Самые действенные и простые инструменты управления подсознанием на каждый день" 
                    />
                    <LargeCard 
                        title="Медитации" 
                        link="/client/meditations" 
                        image={LC3} 
                        content="Эффективная проработка внутренних конфликтов, соединение со своей энергией и запуск процессов" 
                    />
                </div>
            </div>
        </UserLayout>
    )
}