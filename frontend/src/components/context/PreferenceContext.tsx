import { createContext, useState, ReactNode } from 'react';

interface PreferenceContextType {
    theme: 'light' | 'dark';
}

export const PreferenceContext = createContext<PreferenceContextType | null>(null);

interface PreferenceProviderProps {
    children: ReactNode;
}

export const PreferenceProvider = ({ children }: PreferenceProviderProps) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    }

    const value = {
        theme,
        toggleTheme,
    }

    return (
        <PreferenceContext.Provider value={value}>
            {children}
        </PreferenceContext.Provider>
    )
}
