import { usePresence } from "@/store/presence";
import { useSession } from "@/store/session";
import type { Payload } from "@/utils/websocket/handlers";
import type ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";

export default function presenceUpdate(
	_: ReconnectingWebSocket,
	data: Payload,
) {
	const session = useSession.getState();
	const presence = usePresence.getState();

	if (
		data.d.userId === session.currentUser?.id ||
		data.d.status === presence.presences[data.d.userId]?.status
	) {
		return;
	}

	if (data.d.status === "UNAVAILABLE") {
		presence.removePresence(data.d.userId);
		return;
	}

	presence.setPresence(data.d.userId, data.d.status);
}
