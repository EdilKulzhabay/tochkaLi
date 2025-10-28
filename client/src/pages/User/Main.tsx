import { useParams } from 'react-router-dom';
import { RobokassaPayment } from '../../components/RobokassaPayment';
import { useEffect } from 'react';

export const Main = () => {
    const { telegramId = "", saleBotId = "", telegramUserName = "", phone = "" } = useParams();

    useEffect(() => {
        console.log("telegramId: ", telegramId);
        console.log("saleBotId: ", saleBotId);
        console.log("telegramUserName: ", telegramUserName);
        console.log("phone: ", phone);
        localStorage.setItem("telegramId", telegramId);
        localStorage.setItem("saleBotId", saleBotId);
        localStorage.setItem("telegramUserName", telegramUserName);
        localStorage.setItem("phone", phone);
    }, [telegramId, saleBotId, telegramUserName, phone]);
    
    return (
        <div className="container mx-auto p-6">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Оплата курса</h1>
                
                <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">Доступ к курсу</h2>
                        <p className="text-gray-600 mb-4">
                            Получите полный доступ ко всем материалам курса
                        </p>
                        <div className="text-2xl font-bold text-blue-600 mb-4">
                            100 ₸
                        </div>
                    </div>
                    
                    <RobokassaPayment 
                        amount={100} 
                        description="Оплата курса TochkaLi"
                    />
                </div>
            </div>
        </div>
    )
}