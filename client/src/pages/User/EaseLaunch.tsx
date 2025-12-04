import bgGar from '../../assets/bgGar.png';
import { MyLink } from '../../components/User/MyLink';
import { useNavigate } from 'react-router-dom';
import easeLaunch from '../../assets/easeLaunch.png';

export const EaseLaunch = () => {
    const navigate = useNavigate();

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
                <h1 className='text-[48px] font-semibold text-white leading-12'>Удобство запуска</h1>
                <p className='text-white'>Для удобства последующих запусков Приложения его можно добавить на экран Домой телефона</p>
            </div>
            <div className='mt-4'>
                <img src={easeLaunch} alt="Ease Launch" className='w-full h-auto object-cover' />
            </div>
            <div>
                <button 
                    onClick={() => navigate(-1)}
                    className='w-full mt-4 bg-white/10 block text-white py-2.5 text-center font-medium rounded-full'
                >Назад</button>
                <MyLink to="/client/register" text="Далее" className='w-full mt-4' color='red'/>
            </div>
        </div>
    );
};