import bgGar from '../../assets/bgGar.png';
import { useState, useEffect } from 'react';

export const BlockedBrowser = () => {
    const [screenHeight, setScreenHeight] = useState<number>(0);
    
    useEffect(() => {
        const updateScreenHeight = () => {
            const height = window.innerHeight;
            setScreenHeight(height);
        };

        updateScreenHeight();
        window.addEventListener('resize', updateScreenHeight);

        return () => {
            window.removeEventListener('resize', updateScreenHeight);
        };
    }, []);

    return (
        <div 
            style={{
                backgroundImage: `url(${bgGar})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
            className='min-h-screen px-4 pb-6 flex flex-col'
        >
            <div style={{ height: `${screenHeight/3}px` }}></div>
            <div className=''>
                <h1 className='text-[48px] font-semibold text-white leading-12 mb-4'>
                    Приложение доступно только через Telegram
                </h1>
                {/* <p className='text-white text-lg mb-2'>
                    Это приложение можно открыть только через Telegram WebApp.
                </p> */}
                <p className='text-white text-lg mt-10'>
                    Пожалуйста, откройте приложение через бота в Telegram.
                </p>
            </div>

            <div className='bg-[#161616] rounded-lg p-4 pl-0'>
                <div className='text-white text-lg mb-4'>
                    <p className='mb-2'>Как открыть приложение:</p>
                    <ol className='list-decimal list-inside space-y-1 ml-2'>
                        <li>Откройте Telegram</li>
                        <li>Найдите бота @io_tochkali_bot</li>
                        <li>Нажмите кнопку «Открыть Портал .li»</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

