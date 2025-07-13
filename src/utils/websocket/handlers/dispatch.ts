import ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";
import {Payload} from "@/utils/websocket/handlers/index";
import {dispatchHandlers} from "@/utils/websocket/handlers/dispatch/handlers";

export default function dispatch(ws: ReconnectingWebSocket, data: Payload) {
    const handler = dispatchHandlers[data.t!];
    if (!handler) {
        console.log(`[WS] Unknown gateway event: ${data.t}`);
        return;
    }
    handler(ws, data);
}