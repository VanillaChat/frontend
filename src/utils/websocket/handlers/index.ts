import dispatch from "@/utils/websocket/handlers/dispatch";
import heartbeatAck from "@/utils/websocket/handlers/heartbeatAck";
import { hello } from "@/utils/websocket/handlers/hello";
import invalidSession from "@/utils/websocket/handlers/invalidSession";
import ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";

export type Payload = {
	op: number;
	d?: any;
	s?: number;
	t?: string;
};

type OpCodeHandler = (ws: ReconnectingWebSocket, data: Payload) => void;

export const OpCodeHandlers: { [key: number]: OpCodeHandler } = {
	0: dispatch,
	9: invalidSession,
	10: hello,
	11: heartbeatAck,
};

export const ws = new ReconnectingWebSocket(
	import.meta.env.VITE_GATEWAY_URL,
	[],
	{
		maxRetries: 5,
		maxReconnectionDelay: 5000,
		startClosed: true,
	},
);
