import {create} from "zustand/react";
import {Message} from "@/types/Message";
import {devtools} from "zustand/middleware";
import {nanoid} from "nanoid";
import {User} from "@/types/User";

export type MessageState = {
    data: Record<string, Message[]>;
    savedContent: {[key: string]:  string};
    typingIndicators: {[key: string]: User[]};
    isLoadingMore: boolean;
    isLoadingNewer: boolean;
    hasMoreMessages: Record<string, boolean>;
    hasNewerMessages: Record<string, boolean>;
    maxMessagesPerChannel: number;
    lastLoadedOldestMessageId: Record<string, string>;
    lastLoadedNewestMessageId: Record<string, string>;
    addTypingIndicator: (channel: string, user: User) => void;
    removeTypingIndicator: (channel: string, user: string) => void;
    setContent: (channel: string, content: string) => void;
    setMessages: (channel: string, messages: Message[]) => void;
    setHasMoreMessages: (channel: string, hasMore: boolean) => void;
    setHasNewerMessages: (channel: string, hasNewer: boolean) => void;
    pushOptimistic: (channel: string, message: Omit<Message, 'id' | 'state'>) => {
        edit: (patch: Partial<Message>) => void;
        remove: () => void;
    };
    updateMessage: (channel: string, id: string, message: Partial<Message>) => void;
    pushMessage: (channel: string, message: Message) => void;
    removeMessage: (channel: string, id: string) => void;
    loadMoreMessages: (channel: string) => Promise<void>;
    loadNewerMessages: (channel: string) => Promise<void>;
    trimMessages: (channel: string, direction?: 'up' | 'down' | 'none') => void;
}

export const useMessages = create<MessageState>()(devtools((set, get) => ({
    data: {},
    savedContent: {},
    typingIndicators: {},
    isLoadingMore: false,
    isLoadingNewer: false,
    hasMoreMessages: {},
    hasNewerMessages: {},
    maxMessagesPerChannel: 100,
    lastLoadedOldestMessageId: {},
    lastLoadedNewestMessageId: {},
    setMessages: (channel: string, messages: Message[]) => {
        set((state) => ({
            data: {...state.data, [channel]: messages},
            typingIndicators: {[channel]: []}
        }));
        get().trimMessages(channel);
    },
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

        get().trimMessages(channel);

        return {
            edit: (patch: Partial<Message>) => get().updateMessage(channel, tempId, patch),
            remove: () => get().removeMessage(channel, tempId)
        }
    },
    pushMessage: (channel: string, message: Message) => {
        set((state) => ({
            data: {
                ...state.data,
                [channel]: [...(state.data[channel] || []), {...message, state: 'SENT'}]
            }
        }));

        get().trimMessages(channel);
    },
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
    setHasMoreMessages: (channel: string, hasMore: boolean) => set((state) => ({
        hasMoreMessages: {...state.hasMoreMessages, [channel]: hasMore}
    })),
    setHasNewerMessages: (channel: string, hasNewer: boolean) => set((state) => ({
        hasNewerMessages: {...state.hasNewerMessages, [channel]: hasNewer}
    })),
    trimMessages: (channel: string, direction = 'none') => {
        const state = get();
        const messages = state.data[channel];
        
        if (!messages || messages.length <= state.maxMessagesPerChannel) return;

        const buffer = Math.min(20, Math.floor(state.maxMessagesPerChannel * 0.2));
        const trimThreshold = state.maxMessagesPerChannel + buffer;

        if (messages.length <= trimThreshold) return;
        
        let trimmedMessages;
        
        if (direction === 'up') {
            const olderCount = Math.floor(state.maxMessagesPerChannel * 0.7);
            const newerCount = state.maxMessagesPerChannel - olderCount;
            
            trimmedMessages = [
                ...messages.slice(0, olderCount),
                ...messages.slice(-newerCount)
            ];
        } else if (direction === 'down') {
            const olderCount = Math.floor(state.maxMessagesPerChannel * 0.3);
            const newerCount = state.maxMessagesPerChannel - olderCount;
            
            trimmedMessages = [
                ...messages.slice(0, olderCount),
                ...messages.slice(-newerCount)
            ];
        } else {
            const halfMax = Math.floor(state.maxMessagesPerChannel / 2);
            
            trimmedMessages = [
                ...messages.slice(0, halfMax),
                ...messages.slice(-halfMax)
            ];
        }
        
        set((state) => ({
            data: {
                ...state.data,
                [channel]: trimmedMessages
            }
        }));
    },
    loadMoreMessages: async (channel: string) => {
        const state = get();
        if (state.isLoadingMore || !state.hasMoreMessages[channel]) {
            return;
        }

        const oldestMessageId = state.data[channel]?.[0]?.id;

        if (oldestMessageId && state.lastLoadedOldestMessageId[channel] === oldestMessageId) {
            set((state) => ({
                hasMoreMessages: {
                    ...state.hasMoreMessages,
                    [channel]: false
                }
            }));
            
            return;
        }

        set({ isLoadingMore: true });
        
        try {
            
            const url = `${import.meta.env.VITE_API_URL}/channels/${channel}/messages?before=${oldestMessageId}`;
            
            const response = await fetch(url, { credentials: 'include' });
            
            if (!response.ok) {
                console.log(`Failed to fetch older messages: ${response.status} ${response.statusText}`);
                return;
            }
            
            const olderMessages = await response.json();
            if (olderMessages.length === 0) {
                set((state) => ({
                    hasMoreMessages: {
                        ...state.hasMoreMessages,
                        [channel]: false
                    },
                    isLoadingMore: false
                }));
                return;
            }

            set((state) => ({
                data: {
                    ...state.data,
                    [channel]: [...olderMessages, ...state.data[channel]]
                },
                hasMoreMessages: {
                    ...state.hasMoreMessages,
                    [channel]: olderMessages.length === 50
                },
                lastLoadedOldestMessageId: {
                    ...state.lastLoadedOldestMessageId,
                    [channel]: oldestMessageId
                },
                isLoadingMore: false
            }));

            get().trimMessages(channel, 'up');
        } catch (error) {
            console.error("Failed to load more messages:", error);
            set({ isLoadingMore: false });
        }
    },
    loadNewerMessages: async (channel: string) => {
        const state = get();
        if (state.isLoadingNewer || !state.hasNewerMessages[channel]) {
            return;
        }

        const newestMessageId = state.data[channel]?.[state.data[channel].length - 1]?.id;
        if (newestMessageId && state.lastLoadedNewestMessageId[channel] === newestMessageId) {
            set((state) => ({
                hasNewerMessages: {
                    ...state.hasNewerMessages,
                    [channel]: false
                }
            }));
            
            return;
        }

        set({ isLoadingNewer: true });
        
        try {
            const url = `${import.meta.env.VITE_API_URL}/channels/${channel}/messages?after=${newestMessageId}`;
            const response = await fetch(url, { credentials: 'include' });
            
            if (!response.ok) {
                console.log(`Failed to fetch newer messages: ${response.status} ${response.statusText}`);
                return;
            }
            
            const newerMessages = await response.json();

            if (newerMessages.length === 0) {
                set((state) => ({
                    hasNewerMessages: {
                        ...state.hasNewerMessages,
                        [channel]: false
                    },
                    isLoadingNewer: false
                }));
                return;
            }

            set((state) => ({
                data: {
                    ...state.data,
                    [channel]: [...state.data[channel], ...newerMessages]
                },
                hasNewerMessages: {
                    ...state.hasNewerMessages,
                    [channel]: newerMessages.length === 50
                },
                lastLoadedNewestMessageId: {
                    ...state.lastLoadedNewestMessageId,
                    [channel]: newestMessageId
                },
                isLoadingNewer: false
            }));

            get().trimMessages(channel, 'down');
        } catch (error) {
            console.error("Failed to load newer messages:", error);
            set({ isLoadingNewer: false });
        }
    },
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