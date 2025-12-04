import bgGar from '../../assets/bgGar.png';
import { MyLink } from '../../components/User/MyLink';
import { Link } from 'react-router-dom';

export const BlockedUser = () => {
    return (
        <div 
            style={{
                backgroundImage: `url(${bgGar})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
            className='min-h-screen px-4 pb-6 flex flex-col justify-between'
        >
            <div className='h-[200px]'></div>
            <div className='flex-1'>
                <h1 className='text-[48px] font-semibold text-white leading-12'>Доступ заблокирован</h1>
                <p className='text-white'>Администратор заблокировал Вам доступ к приложению за нарушение правил пользования</p>
            </div>

            <div>
                <Link
                    to="/client/contactus"
                    className='w-full mt-4 bg-white/10 block text-white py-2.5 text-center font-medium rounded-full'
                >
                    Связаться с нами
                </Link>
                <MyLink to="/" text="Назад" className='w-full mt-4' color='red'/>
            </div>
        </div>
    );
};