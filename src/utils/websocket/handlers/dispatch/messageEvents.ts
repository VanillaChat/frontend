import ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";
import {Payload} from "@/utils/websocket/handlers";
import {useMessages} from "@/store/messages";
import {useSession} from "@/store/session";

export function onMessageCreate(_: ReconnectingWebSocket, data: Payload) {
    const session = useSession.getState();
    const messages = useMessages.getState();

    if (data.d.author.id === session.currentUser?.id) return;

    messages.removeTypingIndicator(data.d.channelId, data.d.author.id);

    messages.pushMessage(data.d.channelId, {
        ...data.d,
        state: 'SENT'
    });

    const currentChannelId = window.location.pathname.split('/').pop();

    if (currentChannelId === data.d.channelId) {
        const msgContainer = document.querySelector('[class*="max-w-[100%] h-[88vh]"]');
        if (msgContainer) {
            const scrollBottom = msgContainer.scrollHeight - msgContainer.scrollTop - msgContainer.clientHeight;
            const isScrolledUp = scrollBottom > 200;

            if (isScrolledUp) {
                messages.setHasNewerMessages(data.d.channelId, true);
            }
        }
    } else {
        messages.setHasNewerMessages(data.d.channelId, true);
    }
}

export function onMessageUpdate(_: ReconnectingWebSocket, data: Payload) {
    const session = useSession.getState();
    if (data.d.authorId === session.currentUser?.id) return;
    useMessages.getState().updateMessage(data.d.channelId, data.d.id, data.d);
}

export function onMessageDelete(_: ReconnectingWebSocket, data: Payload) {
    useMessages.getState().removeMessage(data.d.channelId, data.d.id);
}