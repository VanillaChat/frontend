import ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";
import {Payload} from "@/utils/websocket/handlers/index";
import {useSession} from "@/store/session";
import {router} from "@/utils/router";

export default function invalidSession(ws: ReconnectingWebSocket, data: Payload) {
    console.log(`[WS] Invalid session opcode received. Closing connection...`);
    if (ws.heartbeatInterval) {
        clearInterval(ws.heartbeatInterval);
        ws.heartbeatInterval = null;
    }
    if (!data.d) {
        ws.close();
        useSession.getState().logout();
        router.navigate('/login');
    }
}