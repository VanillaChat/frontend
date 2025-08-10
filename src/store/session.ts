import {create} from "zustand/react";
import {Account, User} from "@/types/User";
import {devtools} from "zustand/middleware";
import {Theme} from "@/context/ThemeProvider";

export type SessionState = {
    currentAccount: Account | null;
    currentUser: User | null;
    settings: {
      theme: Theme;
    };
    login: (data: Omit<SessionState, 'login' | 'logout' | 'updateCurrentUser'>) => void;
    logout: () => void;
    setSettings: (data: Partial<SessionState['settings']>) => void;
    updateCurrentUser: (data: Partial<User>) => void;
}

export const useSession = create<SessionState>()(devtools((set) => ({
    currentAccount: null,
    currentUser: null,
    settings: {
        theme: "light"
    },
    login: (data: Omit<SessionState, 'login' | 'logout' | 'updateCurrentUser'>) => set(() => ({
        currentAccount: data.currentAccount,
        currentUser: data.currentUser,
        settings: data.settings
    })),
    logout: () => set(() => ({
        currentAccount: null,
        currentUser: null,
        settings: {
            theme: "light"
        }
    })),
    setSettings: (data: Partial<SessionState['settings']>) => set((state) => ({
        settings: {...state.settings, ...data}
    })),
    updateCurrentUser: (data: Partial<User>) => set((state) => ({
        currentUser: state.currentUser ? {...state.currentUser, ...data} : null
    }))
})));