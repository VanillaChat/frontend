import {Payload} from "@/utils/websocket/handlers";
import {useSession} from "@/store/session";
import {usePresence} from "@/store/presence";
import ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";

export default function presenceUpdate(_: ReconnectingWebSocket, data: Payload) {
    const session = useSession.getState();
    const presence = usePresence.getState();

    const currentPresence = presence.getPresence(data.d.userId);
    if (data.d.userId === session.currentUser!.id ||
        data.d.status === currentPresence?.status) {
        return;
    }

    if (data.d.status === "UNAVAILABLE") {
        presence.removePresence(data.d.userId);
        return;
    }

    presence.setPresence(data.d.userId, data.d.status);
}