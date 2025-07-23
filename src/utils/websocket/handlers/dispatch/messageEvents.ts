import ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";
import {Payload} from "@/utils/websocket/handlers";
import {useMessages} from "@/store/messages";
import {useSession} from "@/store/session";

export function onMessageCreate(_: ReconnectingWebSocket, data: Payload) {
    const session = useSession.getState();
    const messages = useMessages.getState();

    // Skip if the message is from the current user
    if (data.d.author.id === session.currentUser?.id) return;

    // Add the message to the store
    messages.pushMessage(data.d.channelId, {
        ...data.d,
        state: 'SENT'
    });

    // Check if the user is viewing the channel where the message was sent
    const currentChannelId = window.location.pathname.split('/').pop();

    if (currentChannelId === data.d.channelId) {
        // Check if the user is scrolled up (not at the bottom)
        const msgContainer = document.querySelector('[class*="max-w-[100%] h-[88vh]"]');
        if (msgContainer) {
            const scrollBottom = msgContainer.scrollHeight - msgContainer.scrollTop - msgContainer.clientHeight;
            const isScrolledUp = scrollBottom > 200;

            // Only set hasNewerMessages if the user is scrolled up
            if (isScrolledUp) {
                messages.setHasNewerMessages(data.d.channelId, true);
            }
        }
    } else {
        // If the message is for a different channel, always set hasNewerMessages
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