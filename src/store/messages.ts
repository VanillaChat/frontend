import {create} from "zustand/react";
import {Message} from "@/types/Message";
import {devtools} from "zustand/middleware";
import {nanoid} from "nanoid";

export type MessageState = {
    data: Record<string, Message[]>;
    savedContent: {[key: string]:  string};
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
    setMessages: (channel: string, messages: Message[]) => set((state) => ({
        data: {...state.data, [channel]: messages}
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
    clearCache: () => set({data: {}, savedContent: {}})
})));