import { useMessages } from "@/store/messages";
import type { Payload } from "@/utils/websocket/handlers";
import type ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";

export default function messageDeleteBulk(
	_: ReconnectingWebSocket,
	data: Payload,
) {
	if (import.meta.env.VERBOSE)
		console.log("[WS] Message delete bulk opcode received.");
	for (const messageId of data.d.messages) {
		useMessages.getState().removeMessage(data.d.channelId, messageId);
	}
}
