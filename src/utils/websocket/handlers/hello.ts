import type { Payload } from "@/utils/websocket/handlers/index";
import type ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";

export const hello = (ws: ReconnectingWebSocket, data: Payload) => {
	console.log(
		"[WS] HELLO opcode received. Attempting to identify and establish a heartbeat loop...",
	);
	setTimeout(() => {
		ws.send(
			JSON.stringify({
				op: 1,
			}),
		);
		if (ws.heartbeatInterval) clearInterval(ws.heartbeatInterval);
		ws.heartbeatInterval = setInterval(() => {
			ws.send(
				JSON.stringify({
					op: 1,
				}),
			);
			if (import.meta.env.VERBOSE) console.log("[WS] Heartbeat opcode sent.");
		}, data.d.heartbeat_interval);
	}, Math.random() * data.d.heartbeat_interval);

	ws.send(JSON.stringify({ op: 2 }));
};
