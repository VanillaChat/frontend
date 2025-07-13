import {create} from "zustand/react";
import {devtools} from "zustand/middleware";

type AppStore = {
    hasModal: boolean;
    setHasModal: (state: boolean) => void;
    settings: {
        inviteCodes: {
            code: string;
            createdBy: {
                username: string;
            };
            usedBy: {
                username: string;
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