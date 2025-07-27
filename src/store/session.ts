import {create} from "zustand/react";
import {Account, User} from "@/types/User";
import {devtools} from "zustand/middleware";

export type SessionState = {
    currentAccount: Account | null;
    currentUser: User | null;
    login: (data: Omit<SessionState, 'login' | 'logout' | 'updateCurrentUser'>) => void;
    logout: () => void;
    updateCurrentUser: (data: Partial<User>) => void;
}

export const useSession = create<SessionState>()(devtools((set) => ({
    currentAccount: null,
    currentUser: null,
    login: (data: Omit<SessionState, 'login' | 'logout'>) => set(() => ({
        currentAccount: data.currentAccount,
        currentUser: data.currentUser
    })),
    logout: () => set(() => ({
        currentAccount: null,
        currentUser: null
    })),
    updateCurrentUser: (data: Partial<User>) => set((state) => ({
        currentUser: state.currentUser ? {...state.currentUser, ...data} : null
    }))
})));