import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

interface UserLayoutProps {
    children: ReactNode;
}

const isIOS = (): boolean => {
    // Проверяем через Telegram WebApp API если доступен
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.platform) {
        return (window as any).Telegram.WebApp.platform === 'ios';
    }
    
    // Fallback: проверка через user agent
    if (typeof navigator !== 'undefined') {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    }
    
    return false;
};

export const UserLayout = ({ children }: UserLayoutProps) => {
    const [isIOSDevice, setIsIOSDevice] = useState(false);

    useEffect(() => {
        setIsIOSDevice(isIOS());
    }, []);

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#161616', color: '#ffffff' }}>
            <div className={isIOSDevice ? 'p-10' : ''}>
                {children}
            </div>
        </div>
    );
};

