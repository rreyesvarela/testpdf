'use client'

import { ThemeProvider } from '@mui/material';
import theme from '../theme';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ThemeProviderWrapper({ children }: any) {
    return (
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    )
}