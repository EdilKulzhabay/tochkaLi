import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClientInsufficientBonusModalProps {
    isOpen: boolean;
    onClose: () => void;
    starsRequired: number;
    userBonus: number;
}

export const ClientInsufficientBonusModal = ({ 
    isOpen, 
    onClose,
    starsRequired,
    userBonus,
}: ClientInsufficientBonusModalProps) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleFAQClick = () => {
        navigate('/client/faq');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Мобильная версия: модальное окно снизу */}
            <div className="flex items-end justify-center min-h-screen sm:hidden">
                {/* Overlay */}
                <div 
                    className="fixed inset-0 bg-black/60 transition-opacity z-20"
                    onClick={onClose}
                />

                {/* Modal - снизу на мобильных */}
                <div 
                    className="relative z-50 px-4 pt-6 pb-8 inline-block w-full bg-[#333333] rounded-t-[24px] text-left text-white overflow-hidden shadow-xl transform transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-5 cursor-pointer"
                    >
                        <X size={24} />
                    </button>
                    
                    <div className="mt-4">
                        <h3 className="text-xl font-bold mb-4">Недостаточно бонусов</h3>
                        <div className="mb-4">
                            <p className="mb-2">Для доступа к этому контенту требуется:</p>
                            <p className="font-semibold text-lg mb-2">{starsRequired} бонусов</p>
                            <p className="mb-2">У вас есть:</p>
                            <p className="font-semibold text-lg mb-4">{userBonus} бонусов</p>
                        </div>
                        <p className="mb-4 text-gray-300">
                            Вы можете получить бонусы, выполняя задания. Подробнее можно прочитать в разделе FAQ.
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Закрыть
                            </button>
                            <button
                                onClick={handleFAQClick}
                                className="flex-1 px-4 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Перейти в FAQ
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Десктопная версия: модальное окно по центру */}
            <div className="hidden sm:flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
                {/* Overlay */}
                <div 
                    className="fixed inset-0 bg-black/60 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal - по центру на десктопе */}
                <div 
                    className="relative p-8 inline-block align-middle bg-[#333333] rounded-lg text-left text-white overflow-hidden shadow-xl transform transition-all"
                    style={{ maxWidth: '500px', width: '100%' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 cursor-pointer"
                    >
                        <X size={32} />
                    </button>
                    
                    <div className="mt-4">
                        <h3 className="text-2xl font-bold mb-4">Недостаточно бонусов</h3>
                        <div className="mb-6">
                            <p className="mb-2">Для доступа к этому контенту требуется:</p>
                            <p className="font-semibold text-xl mb-3">{starsRequired} бонусов</p>
                            <p className="mb-2">У вас есть:</p>
                            <p className="font-semibold text-xl mb-4">{userBonus} бонусов</p>
                        </div>
                        <p className="mb-6 text-gray-300">
                            Вы можете получить бонусы, выполняя задания. Подробнее можно прочитать в разделе FAQ.
                        </p>
                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Закрыть
                            </button>
                            <button
                                onClick={handleFAQClick}
                                className="flex-1 px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Перейти в FAQ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

