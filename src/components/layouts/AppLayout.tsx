import "../../styles/App/App.css";
import {useGateway} from "@/store/gateway";
import {Outlet} from "react-router-dom";
import ReconnectingWebSocket, {CloseEvent} from "@/utils/websocket/ReconnectingWebSocket";
import {useCallback, useEffect} from "react";
import {OpCodeHandlers, Payload} from "@/utils/websocket/handlers";

const ws = new ReconnectingWebSocket(import.meta.env.VITE_GATEWAY_URL!, [], {
    maxRetries: 5,
    maxReconnectionDelay: 5000,
    startClosed: true
});

export default function AppLayout() {
    const gateway = useGateway();
    // const ws = new WebSocket(`${import.meta.env.VITE_API_URL}/gateway`);

    const onOpen = useCallback(() => {
        console.log(`[WS] Connected.`);
    }, [gateway.isConnected]);

    const onMessage = useCallback((event: MessageEvent) => {
        const data: Payload = JSON.parse(event.data);
        const handler = OpCodeHandlers[data.op];
        if (!handler) {
            console.log(`[WS] Invalid opcode: ${data.op}`);
            return;
        }
        handler(ws, data);
    }, [gateway.isConnected]);

    const onClose = useCallback((event: CloseEvent) => {
        console.log('[WS] Closed with the following event:', event);
        if (ws.heartbeatInterval) {
            clearInterval(ws.heartbeatInterval);
            ws.heartbeatInterval = null;
        }
        gateway.setConnectionStatus(false);
    }, [gateway.isConnected]);

    useEffect(() => {
        if (ws.retryCount === 0) ws.reconnect();
        ws.addEventListener('open', onOpen);
        ws.addEventListener('message', onMessage);
        ws.addEventListener('close', onClose);
        return () => {
            ws.removeEventListener('open', onOpen);
            ws.removeEventListener('message', onMessage);
            ws.removeEventListener('close', onClose);
            ws.close();
        }
    }, []);

    if (!gateway.isConnected) {
        return <div className="flex justify-center items-center h-[100dvh] flex-col gap-[16px] dark:bg-[#262622] dim:bg-[#000000]">
            {/*<img src={logo} alt="logo" className="connecting-logo" />*/}
            <div className="px-[25px] text-[50px] text-black dark:text-white dim:text-white font-semibold rounded-[12px] font-logo animate-(--logo-animation) dark:animate-(--logo-animation-dark) dim:animate-(--logo-animation-dark)">
                <span>V</span>
            </div>
            <h1 className="text-[2rem] font-bold">Loading Vanilla</h1>
            <h3 className="text-[1.17rem] font-semibold">Waiting for server connection...</h3>
        </div>
    }
    return <Outlet />
}