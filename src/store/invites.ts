import { create } from "zustand/react";
import { devtools } from "zustand/middleware";

export type InviteData = {
  type: number;
  code: string;
  inviter: {
    id: string;
    username: string;
    avatar?: string | null;
  } | null;
  guild: {
    id: string;
    name: string;
    brief: string;
    icon: string | null;
  };
  guildId: string;
  channel: {
    id: string;
    type: number;
    name: string;
  };
};

export type InvitesState = {
  cache: Record<string, InviteData>;
  isLoading: Record<string, boolean>;
  addInvite: (code: string, data: InviteData) => void;
  getInvite: (code: string) => InviteData | undefined;
  hasInvite: (code: string) => boolean;
  fetchInvite: (code: string) => Promise<InviteData | null>;
  clearCache: () => void;
};

export const useInvites = create<InvitesState>()(
  devtools((set, get) => ({
    cache: {},
    isLoading: {},
    
    addInvite: (code: string, data: InviteData) => 
      set((state) => ({
        cache: { ...state.cache, [code]: data },
        isLoading: { ...state.isLoading, [code]: false }
      })),
    
    getInvite: (code: string) => get().cache[code],
    
    hasInvite: (code: string) => !!get().cache[code],
    
    fetchInvite: async (code: string) => {
      const state = get();

      if (state.cache[code]) {
        return state.cache[code];
      }

      if (state.isLoading[code]) {
        return null;
      }

      set((state) => ({
        isLoading: { ...state.isLoading, [code]: true }
      }));
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/invites/${code}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          set((state) => ({
            isLoading: { ...state.isLoading, [code]: false }
          }));
          return null;
        }
        
        const data = await response.json();

        get().addInvite(code, data);
        
        return data;
      } catch (error) {
        console.error("Failed to fetch invite:", error);
        set((state) => ({
          isLoading: { ...state.isLoading, [code]: false }
        }));
        return null;
      }
    },
    
    clearCache: () => set({ cache: {}, isLoading: {} })
  }))
);