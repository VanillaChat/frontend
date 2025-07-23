import {create} from "zustand/react";
import {Message} from "@/types/Message";
import {devtools} from "zustand/middleware";
import {nanoid} from "nanoid";
import {User} from "@/types/User";

export type MessageState = {
    data: Record<string, Message[]>;
    savedContent: {[key: string]:  string};
    typingIndicators: {[key: string]: User[]};
    addTypingIndicator: (channel: string, user: User) => void;
    removeTypingIndicator: (channel: string, user: string) => void;
    setContent: (channel: string, content: string) => void;
    setMessages: (channel: string, messages: Message[]) => void;
    pushOptimistic: (channel: string, message: Omit<Message, 'id' | 'state'>) => {
        edit: (patch: Partial<Message>) => void;
        remove: () => void;
    };
    updateMessage: (channel: string, id: string, message: Partial<Message>) => void;
    pushMessage: (channel: string, message: Message) => void;
    removeMessage: (channel: string, id: string) => void;
}

export const useMessages = create<MessageState>()(devtools((set, get) => ({
    data: {},
    savedContent: {},
    typingIndicators: {},
    setMessages: (channel: string, messages: Message[]) => set((state) => ({
        data: {...state.data, [channel]: messages},
        typingIndicators: {[channel]: []}
    })),
    addTypingIndicator: (channel: string, user: User) => set((state) => ({
        typingIndicators: {...state.typingIndicators, [channel]: [...state.typingIndicators[channel], user]},
    })),
    removeTypingIndicator: (channel: string, user: string) => set((state) => ({
        typingIndicators: {...state.typingIndicators, [channel]: state.typingIndicators[channel].filter(x => x.id !== user)}
    })),
    pushOptimistic: (channel: string, message: Message) => {
        const tempId = nanoid();

        set((state) => ({
            data: {
                ...state.data,
                [channel]: [...(state.data[channel] || []), {...message, id: tempId, state: 'SENDING'}]
            }
        }));

        return {
            edit: (patch: Partial<Message>) => get().updateMessage(channel, tempId, patch),
            remove: () => get().removeMessage(channel, tempId)
        }
    },
    pushMessage: (channel: string, message: Message) => set((state) => ({
        data: {
            ...state.data,
            [channel]: [...(state.data[channel] || []), {...message, state: 'SENT'}]
        }
    })),
    updateMessage: (channel, id, message) => set((state) => ({
        data: {
            ...state.data,
            [channel]: (state.data[channel] || []).map((msg) => msg.id === id ? { ...msg, ...message } : msg)
        }
    })),
    removeMessage: (channel, id) => set((state) => ({
        data: {
            ...state.data,
            [channel]: (state.data[channel] || []).filter(msg => msg.id !== id)
        }
    })),
    setContent: (channel: string, content: string) => set((state) => ({
        savedContent: {...state.savedContent, [channel]: content}
    })),
    clearCache: () => set({data: {}, savedContent: {}, typingIndicators: {}})
})));

export type EditCache = {
    isEditing: boolean;
    messageId: string | null;
    content: string | null;
}

export type EditCacheState = {
    cache: EditCache;
    set: (cache: EditCache) => void;
    setContent: (content: string) => void;
    clear: () => void;
}

export const useEditCache = create<EditCacheState>()(devtools((set) => ({
    cache: {
        isEditing: false,
        messageId: null,
        content: null
    },
    set: (cache: EditCache) => set(() => ({cache})),
    setContent: (content: string) => set((state) => ({
        cache: {...state.cache, content}
    })),
    clear: () => set(() => ({cache: {isEditing: false, messageId: null, content: null}}))
})));