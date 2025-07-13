import onReady from "@/utils/websocket/handlers/dispatch/ready";
import ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";
import {Payload} from "@/utils/websocket/handlers";
import onMessageCreate from "@/utils/websocket/handlers/dispatch/messageCreate";
import inviteCodeDelete, {inviteCodeUse} from "@/utils/websocket/handlers/dispatch/inviteCodeDelete";

export type Handler = (ws: ReconnectingWebSocket, data: Payload) => void;

export const dispatchHandlers: {[name: string]: Handler} = {
    READY: onReady,
    MESSAGE_CREATE: onMessageCreate,
    INVITE_CODE_DELETE: inviteCodeDelete,
    INVITE_CODE_USE: inviteCodeUse
}