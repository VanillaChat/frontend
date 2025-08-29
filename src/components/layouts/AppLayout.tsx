import { useCallback, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useGateway } from "@/store/gateway";
import { OpCodeHandlers, type Payload, ws } from "@/utils/websocket/handlers";
import type { CloseEvent } from "@/utils/websocket/ReconnectingWebSocket";

export default function AppLayout() {
	const gateway = useGateway();

	const onOpen = useCallback(() => {
		console.log(`[WS] Connected.`);
	}, []);

	const onMessage = useCallback((event: MessageEvent) => {
		const data: Payload = JSON.parse(event.data);
		const handler = OpCodeHandlers[data.op];
		if (!handler) {
			console.log(`[WS] Invalid opcode: ${data.op}`);
			return;
		}
		handler(ws, data);
	}, []);

	const onClose = useCallback(
		(event: CloseEvent) => {
			console.log("[WS] Closed with the following event:", event);
			if (ws.heartbeatInterval) {
				clearInterval(ws.heartbeatInterval);
				ws.heartbeatInterval = null;
			}
			gateway.setConnectionStatus(false);
		},
		[gateway.setConnectionStatus],
	);

	useEffect(() => {
		if (ws.retryCount === 0) ws.reconnect();
		// @ts-expect-error
		ws.addEventListener("open", onOpen);
		// @ts-expect-error
		ws.addEventListener("message", onMessage);
		// @ts-expect-error
		ws.addEventListener("close", onClose);
		return () => {
			// @ts-expect-error
			ws.removeEventListener("open", onOpen);
			// @ts-expect-error
			ws.removeEventListener("message", onMessage);
			// @ts-expect-error
			ws.removeEventListener("close", onClose);
			ws.close();
		};
	}, [onClose, onMessage, onOpen]);

	if (!gateway.isConnected) {
		return (
			// biome-ignore lint/a11y/noStaticElementInteractions: yes
			<div
				className="flex justify-center items-center h-[100dvh] flex-col gap-[16px] dark:bg-[#262622] dim:bg-[#000000]"
				onContextMenu={(e) => e.preventDefault()}
			>
				<div className="px-[25px] text-[50px] text-black dark:text-white dim:text-white font-semibold rounded-[12px] font-logo animate-(--logo-animation) dark:animate-(--logo-animation-dark) dim:animate-(--logo-animation-dark)">
					<span>V</span>
				</div>
				<h1 className="text-[2rem] font-bold">Loading Vanilla</h1>
				<h3 className="text-[1.17rem] font-semibold">
					Waiting for server connection...
				</h3>
			</div>
		);
	}
	return <Outlet />;
}
