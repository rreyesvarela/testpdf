'use client';

import React, { useEffect, useState } from 'react';
import OrganigramaApiData from './OrganigramaApiData';
import OrganigramaSkeleton from './OrganigramaSkeleton';

interface LocalStorageProviderProps {
    area: string;
}

export default function LocalStorageProvider({ area }: LocalStorageProviderProps) {
    const [storageValues, setStorageValues] = useState({
        userId: '',
        userName: '',
        bloque: ''
    });

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Access localStorage safely in useEffect (client-side only)
        const userId = localStorage.getItem('userIdDirectores') || '';
        const userName = localStorage.getItem('userNameDirectores') || '';
        const bloque = localStorage.getItem('bloque') || '';

        setStorageValues({ userId, userName, bloque });
        setIsLoaded(true);
    }, []);

    // Only render the component once localStorage values are loaded
    if (!isLoaded) {
        return <OrganigramaSkeleton />;
    }

    return (
        <OrganigramaApiData
            area={area}
            userIdFromStorage={storageValues.userId}
            userNameFromStorage={storageValues.userName}
            bloqueFromStorage={storageValues.bloque}
        />
    );
}