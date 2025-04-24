'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TalendCard, HoganAssessment, MGTData, TalentCardDetail } from '../app/[id]/[userId]/fichaTalento/types';

interface ProfileState {
    talendCard: TalendCard | null;
    hoganData: HoganAssessment | null;
    mgtData: MGTData | null;
    talentCardDetailData: TalentCardDetail | null;
    loading: boolean;
    userId: string | null;
    userName: string | null;
    positionId: string | null;
}

interface ProfileContextProps {
    profileState: ProfileState;
    setProfileState: React.Dispatch<React.SetStateAction<ProfileState>>;
}

const ProfileContext = createContext<ProfileContextProps | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
    const [profileState, setProfileState] = useState<ProfileState>({
        talendCard: null,
        hoganData: null,
        mgtData: null,
        talentCardDetailData: null,
        userId: null,
        userName: null,
        positionId: null,
        loading: true, // Estado inicial de carga
    });

    return (
        <ProfileContext.Provider value={{ profileState, setProfileState }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfileContext = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfileContext must be used within a ProfileProvider');
    }
    return context;
};
