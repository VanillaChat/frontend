import ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";
import {Payload} from "@/utils/websocket/handlers";
import {useMessages} from "@/store/messages";
import {useSession} from "@/store/session";

export default function onMessageCreate(ws: ReconnectingWebSocket, data: Payload) {
    const session = useSession.getState();
    if (data.d.author.id === session.currentUser?.id) return;
    useMessages.getState().pushMessage(data.d.channelId, {
        ...data.d,
        state: 'SENT'
    });
}