import {create} from "zustand/react";
import {devtools} from "zustand/middleware";
import {User} from "@/types/User";

type AppStore = {
    hasModal: boolean;
    setHasModal: (state: boolean) => void;
    settings: {
        inviteCodes: {
            code: string;
            createdBy: {
                username: string;
                id: string;
                avatar: string | null;
            };
            usedBy: {
                username: string;
                id: string;
                avatar: string | null;
                user: User;
            };
            used: boolean;
            id: string;
            createdAt: string;
        }[];
    };
    setSettings: (state: AppStore['settings']) => void;
}

export const useAppStore = create<AppStore>()(devtools((set) => ({
    hasModal: false,
    settings: {
        inviteCodes: []
    },
    setHasModal: (state: boolean) => set(() => ({hasModal: state})),
    setSettings: (state: AppStore['settings'])=> set(() => ({
        settings: state
    }))
})));