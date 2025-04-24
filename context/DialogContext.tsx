// context/DialogContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import FichaTalentoContent from '@/app/[id]/[userId]/fichaTalento/FichaTalentoContent';
import AnalisisPuestoVsPersonaContent from '@/app/[id]/[userId]/app/AnalisisPuestoVsPersonaContent';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
// Import other pages you might want to show in dialogs

type DialogType = 'fichaTalento' | 'app' | null;

interface DialogContextType {
    openDialog: (type: DialogType, name: string, props?: any) => void;
    closeDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
    const [dialogType, setDialogType] = useState<DialogType>(null);
    const [dialogProps, setDialogProps] = useState<any>({});
    const [name, setName] = useState<string>('');

    const openDialog = (type: DialogType, name: string, props: any = {}) => {
        setDialogType(type);
        setName(name);
        setDialogProps(props);
    };

    const closeDialog = () => {
        setDialogType(null);
    };

    // Map dialog types to components
    const renderDialogContent = () => {
        switch (dialogType) {
            case 'fichaTalento':
                return <FichaTalentoContent isDialog={true} dialogProps={dialogProps} />;
            case 'app':
                return <AnalisisPuestoVsPersonaContent isDialog={true} dialogProps={dialogProps} />;
            default:
                return null;
        }
    };

    // Map dialog types to titles
    const getDialogTitle = () => {
        switch (dialogType) {
            case 'fichaTalento':
                return `Ficha de Talento - ${name}`;
            case 'app':
                return `Análisis Puesto vs. Persona - ${name}`;
            default:
                return '';
        }
    };

    return (
        <DialogContext.Provider value={{ openDialog, closeDialog }}>
            {children}
            <Dialog
                open={dialogType !== null}
                onClose={closeDialog}
                fullWidth
                maxWidth="xl"
            >
                <DialogTitle>{getDialogTitle()}</DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={closeDialog}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent>
                    {renderDialogContent()}
                </DialogContent>
            </Dialog>
        </DialogContext.Provider>
    );
}

export function useDialog() {
    const context = useContext(DialogContext);
    if (context === undefined) {
        throw new Error('useDialog must be used within a DialogProvider');
    }
    return context;
}