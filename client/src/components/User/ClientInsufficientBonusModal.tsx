import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ClientInsufficientBonusModalProps {
    isOpen: boolean;
    onClose: () => void;
    starsRequired: number;
    userBonus: number;
    contentTitle: string;
}

const BonusPolicyModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;

    const policies = [
        { id: 1, text: 'заполнение дневника - 1 звезда' },
        { id: 2, text: 'поставили радио кнопку Б/у - 1 звезда' },
        { id: 3, text: 'кто-то зарегался по моей ссылке - 1 звезда' },
        { id: 4, text: 'просмотр любой практики/видео/медитации - 1 звезда' },
        { id: 5, text: 'за регистрацию - 10 звезд' },
    ];

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
            {/* Мобильная версия: модальное окно снизу */}
            <div className="flex items-end justify-center min-h-screen sm:hidden">
                {/* Overlay */}
                <div 
                    className="fixed inset-0 bg-black/60 transition-opacity z-20"
                    onClick={onClose}
                />

                {/* Modal - снизу на мобильных */}
                <div 
                    className="relative z-50 px-4 pt-6 pb-8 inline-block w-full bg-[#333333] rounded-t-[24px] text-left text-white overflow-hidden shadow-xl transform transition-all max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-5 cursor-pointer z-10"
                    >
                        <X size={24} />
                    </button>
                    
                    <div className="mt-4">
                        <h3 className="text-xl font-bold mb-6">Политика назначения звезд</h3>
                        <div className="space-y-4 mb-6">
                            {policies.map((policy) => (
                                <div key={policy.id} className="flex items-start gap-3">
                                    <span className="text-red-600 font-bold text-lg flex-shrink-0">{policy.id})</span>
                                    <p className="text-gray-200">{policy.text}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-gray-400 italic mb-6">
                            Возможность списания звезд на продукты только для зарегистрированных пользователей.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Понятно
                        </button>
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
                    className="relative p-8 inline-block align-middle bg-[#333333] rounded-lg text-left text-white overflow-hidden shadow-xl transform transition-all max-h-[90vh] overflow-y-auto"
                    style={{ maxWidth: '600px', width: '100%' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 cursor-pointer z-10"
                    >
                        <X size={32} />
                    </button>
                    
                    <div className="mt-4">
                        <h3 className="text-2xl font-bold mb-6">Политика назначения звезд</h3>
                        <div className="space-y-4 mb-6">
                            {policies.map((policy) => (
                                <div key={policy.id} className="flex items-start gap-4">
                                    <span className="text-red-600 font-bold text-xl flex-shrink-0">{policy.id})</span>
                                    <p className="text-gray-200 text-lg">{policy.text}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-base text-gray-400 italic mb-6">
                            Возможность списания звезд на продукты только для зарегистрированных пользователей.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Понятно
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ClientInsufficientBonusModal = ({ 
    isOpen, 
    onClose,
    starsRequired,
    userBonus,
    contentTitle,
}: ClientInsufficientBonusModalProps) => {
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

    // Сбрасываем состояние второго модального окна при закрытии основного
    useEffect(() => {
        if (!isOpen) {
            setIsPolicyModalOpen(false);
        }
    }, [isOpen]);

    if (!isOpen && !isPolicyModalOpen) return null;

    const handleMoreInfoClick = () => {
        onClose();
        setIsPolicyModalOpen(true);
    };

    const handlePolicyModalClose = () => {
        setIsPolicyModalOpen(false);
    };

    return (
        <>
            <BonusPolicyModal isOpen={isPolicyModalOpen} onClose={handlePolicyModalClose} />
            {isOpen && (
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
                        <h3 className="text-xl font-bold mb-4">Недостаточно звёзд</h3>
                        <div className="mb-4">
                            <p className="mb-2">Вы хотите приобрести контент:</p>
                            <p className="mb-4">{contentTitle}</p>
                            <p className="font-semibold text-lg mb-2">Стоимость звёзд: {starsRequired}</p>
                            <p className="font-semibold text-lg mb-4">У вас есть звёзд: {userBonus}</p>
                        </div>
                        <p className="mb-4 text-gray-300">
                            Вы можете получить дополнительные звёзды, выполняя задания. Немного терпения.
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleMoreInfoClick}
                                className="flex-1 px-4 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Подробнее
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
                        <h3 className="text-2xl font-bold mb-4">Недостаточно звёзд</h3>
                        <div className="mb-6">
                            <p className="mb-2">Вы хотите приобрести контент:</p>
                            <p className="mb-4">{contentTitle}</p>
                            <p className="font-semibold text-lg mb-2">Стоимость звёзд: {starsRequired}</p>
                            <p className="font-semibold text-lg mb-4">У вас есть звёзд: {userBonus}</p>
                        </div>
                        <p className="mb-6 text-gray-300">
                            Вы можете получить дополнительные звёзды, выполняя задания. Немного терпения.
                        </p>
                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleMoreInfoClick}
                                className="flex-1 px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Подробнее
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            )}
        </>
    );
};

