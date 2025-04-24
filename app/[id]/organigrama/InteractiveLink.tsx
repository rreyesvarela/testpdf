'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface InteractiveLinkProps {
    href: string;
    className?: string;
    children: ReactNode;
    name?: string;
    lastName?: string;
    userId: string;
    userName: string;
    positionId: string;
}

export default function InteractiveLink({
    href,
    className,
    children,
    name,
    lastName,
    userId,
    userName,
    positionId,
}: InteractiveLinkProps) {
    const handleClick = () => {
        if (name) localStorage.setItem('name', name);
        if (lastName) localStorage.setItem('lastName', lastName);
        if (userId) localStorage.setItem('userId', userId);
        if (userName) localStorage.setItem('userName', userName);
        if (positionId) localStorage.setItem('positionId', positionId);
        window.dispatchEvent(new Event('localStorageChange'));
    };

    return (
        <Link href={href} className={className} onClick={handleClick}>
            {children}
        </Link>
    );
}