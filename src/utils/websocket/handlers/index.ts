import {hello} from "@/utils/websocket/handlers/hello";
import ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";
import heartbeatAck from "@/utils/websocket/handlers/heartbeatAck";
import invalidSession from "@/utils/websocket/handlers/invalidSession";
import dispatch from "@/utils/websocket/handlers/dispatch";

export type Payload = {
    op: number;
    d?: any;
    s?: number;
    t?: string;
}

type OpCodeHandler = (ws: ReconnectingWebSocket, data: Payload) => void;

export const OpCodeHandlers: {[key: number]: OpCodeHandler} = {
    0: dispatch,
    9: invalidSession,
    10: hello,
    11: heartbeatAck
}