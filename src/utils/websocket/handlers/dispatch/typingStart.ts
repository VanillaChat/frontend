import ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";
import {Payload} from "@/utils/websocket/handlers";
import {useMessages} from "@/store/messages";
import {useSession} from "@/store/session";

const typingTimeouts: {[channelId: string]: {[userId: string]: number}} = {};

export default function typingStart(ws: ReconnectingWebSocket, data: Payload) {
    const messages = useMessages.getState();
    const session = useSession.getState();
    
    if (data.d.userId === session.currentUser?.id) {
        return;
    }
    
    const { channelId, userId, user, expiresAt } = data.d;
    
    messages.addTypingIndicator(channelId, user);
    
    if (typingTimeouts[channelId]?.[userId]) {
        clearTimeout(typingTimeouts[channelId][userId]);
    }
    
    if (!typingTimeouts[channelId]) {
        typingTimeouts[channelId] = {};
    }
    
    const timeoutDuration = expiresAt - Date.now();
    if (timeoutDuration > 0) {
        typingTimeouts[channelId][userId] = setTimeout(() => {
            messages.removeTypingIndicator(channelId, userId);
            delete typingTimeouts[channelId][userId];
        }, timeoutDuration) as unknown as number;
    }
}