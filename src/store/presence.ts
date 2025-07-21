import {create} from "zustand/react";
import {devtools} from "zustand/middleware";

export type UserStatus = 'ONLINE' | 'DND' | 'IDLE' | 'LOOKING_TO_PLAY' | 'UNAVAILABLE';

export type Presence = {
    id: string;
    status: UserStatus;
};

export type PresenceState = {
    presences: Presence[];
    setPresences: (presences: Presence[]) => void;
    setPresence: (id: string, status: UserStatus) => void;
    removePresence: (id: string) => void;
    getPresence: (id: string) => Presence | undefined;
    isOnline: (id: string) => boolean;
};

export const usePresence = create<PresenceState>()(
    devtools((set, get) => ({
        presences: [],
        setPresences: (presences: Presence[]) => set({ presences }),
        setPresence: (id: string, status: UserStatus) => set((state) => {
            const index = state.presences.findIndex(presence => presence.id === id);
            if (index !== -1) {
                const newPresences = [...state.presences];
                newPresences[index] = { id, status };
                return { presences: newPresences };
            } else {
                return { presences: [...state.presences, { id, status }] };
            }
        }),
        removePresence: (id: string) => set((state) => ({
            presences: state.presences.filter(presence => presence.id !== id)
        })),
        getPresence: (id: string) => get().presences.find(presence => presence.id === id),
        isOnline: (id: string) => {
            const presence = get().presences.find(presence => presence.id === id);
            return presence !== undefined && presence.status !== 'UNAVAILABLE';
        }
    }))
);