import { useSession } from "@/store/session";
import { router } from "@/utils/router";
import type { Payload } from "@/utils/websocket/handlers/index";
import type ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";

export default async function invalidSession(
	ws: ReconnectingWebSocket,
	data: Payload,
) {
	console.log(`[WS] Invalid session opcode received. Closing connection...`);
	if (ws.heartbeatInterval) {
		clearInterval(ws.heartbeatInterval);
		ws.heartbeatInterval = null;
	}
	if (!data.d) {
		ws.close();
		useSession.getState().logout();
		await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
			credentials: "include",
			method: "POST",
		});
		await router.navigate("/login");
	}
}
