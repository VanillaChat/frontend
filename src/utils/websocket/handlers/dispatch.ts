import { dispatchHandlers } from "@/utils/websocket/handlers/dispatch/handlers";
import type { Payload } from "@/utils/websocket/handlers/index";
import type ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";

export default function dispatch(ws: ReconnectingWebSocket, data: Payload) {
	const handler = dispatchHandlers[data.t as string];
	if (!handler) {
		console.log(`[WS] Unknown gateway event: ${data.t}`);
		return;
	}
	handler(ws, data);
}
