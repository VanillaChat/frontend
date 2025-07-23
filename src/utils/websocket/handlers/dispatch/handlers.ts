import onReady from "@/utils/websocket/handlers/dispatch/ready";
import ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";
import {Payload} from "@/utils/websocket/handlers";
import inviteCodeDelete, {inviteCodeUse} from "@/utils/websocket/handlers/dispatch/inviteCodeDelete";
import presenceUpdate from "@/utils/websocket/handlers/dispatch/presenceUpdate";
import guildMemberAdd from "@/utils/websocket/handlers/dispatch/guildMemberAdd";
import {onMessageCreate, onMessageDelete, onMessageUpdate} from "@/utils/websocket/handlers/dispatch/messageEvents";

export type Handler = (ws: ReconnectingWebSocket, data: Payload) => void;

export const dispatchHandlers: {[name: string]: Handler} = {
    READY: onReady,
    MESSAGE_CREATE: onMessageCreate,
    MESSAGE_UPDATE: onMessageUpdate,
    MESSAGE_DELETE: onMessageDelete,
    INVITE_CODE_DELETE: inviteCodeDelete,
    INVITE_CODE_USE: inviteCodeUse,
    PRESENCE_UPDATE: presenceUpdate,
    GUILD_MEMBER_ADD: guildMemberAdd
}