import ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";
import {Payload} from "@/utils/websocket/handlers";
import {useMessages} from "@/store/messages";
import {useSession} from "@/store/session";

export function onMessageCreate(_: ReconnectingWebSocket, data: Payload) {
    const session = useSession.getState();
    if (data.d.author.id === session.currentUser?.id) return;
    useMessages.getState().pushMessage(data.d.channelId, {
        ...data.d,
        state: 'SENT'
    });
}

export function onMessageUpdate(_: ReconnectingWebSocket, data: Payload) {
    const session = useSession.getState();
    if (data.d.authorId === session.currentUser?.id) return;
    useMessages.getState().updateMessage(data.d.channelId, data.d.id, data.d);
}

export function onMessageDelete(_: ReconnectingWebSocket, data: Payload) {
    useMessages.getState().removeMessage(data.d.channelId, data.d.id);
}