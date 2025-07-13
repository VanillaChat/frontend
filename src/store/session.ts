import {create} from "zustand/react";
import {Account, User} from "@/types/User";
import {devtools} from "zustand/middleware";

export type SessionState = {
    currentAccount: Account | null;
    currentUser: User | null;
    login: (data: Omit<SessionState, 'login' | 'logout'>) => void;
    logout: () => void;
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
    }))
})));