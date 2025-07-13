import {createContext, FC, ReactNode, useContext, useEffect, useState} from "react";

type Theme = 'light' | 'dark' | 'dim';

interface ThemeProviderProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeProviderProps | undefined>(undefined);

const ThemeProvider: FC<{children: ReactNode}> = ({children}) => {
    const [theme, setTheme] = useState<Theme>(localStorage.getItem('theme') as Theme ?? 'light');
    const html = document.querySelector('html');

    useEffect(() => {
        localStorage.setItem('theme', theme);
        if (theme === 'light') {
            html?.classList?.remove('dark');
            html?.classList?.remove('dim');
        } else if (theme === 'dark') {
            html?.classList?.remove('dim');
            html?.classList.add('dark');
        } else {
            html?.classList?.remove('dark');
            html?.classList.add('dim');
        }
    }, [theme]);

    return <ThemeContext.Provider value={{theme, setTheme}}>
        {children}
    </ThemeContext.Provider>
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export default ThemeProvider;