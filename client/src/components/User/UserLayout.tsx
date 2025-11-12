import type { ReactNode } from 'react';

interface UserLayoutProps {
    children: ReactNode;
}

export const UserLayout = ({ children }: UserLayoutProps) => {
    return (
        <div className="min-h-screen" style={{ backgroundColor: '#161616', color: '#ffffff' }}>
            <div className="">
                {children}
            </div>
        </div>
    );
};

