import type { Payload } from "@/utils/websocket/handlers";
import guildMemberAdd, {
	guildMemberRemove,
} from "@/utils/websocket/handlers/dispatch/guildMemberAdd";
import inviteCodeDelete, {
	inviteCodeUse,
} from "@/utils/websocket/handlers/dispatch/inviteCodeDelete";
import messageDeleteBulk from "@/utils/websocket/handlers/dispatch/messageDeleteBulk";
import {
	onMessageCreate,
	onMessageDelete,
	onMessageUpdate,
} from "@/utils/websocket/handlers/dispatch/messageEvents";
import presenceUpdate from "@/utils/websocket/handlers/dispatch/presenceUpdate";
import onReady from "@/utils/websocket/handlers/dispatch/ready";
import typingStart from "@/utils/websocket/handlers/dispatch/typingStart";
import userUpdate from "@/utils/websocket/handlers/dispatch/userUpdate";
import type ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";

export type Handler = (ws: ReconnectingWebSocket, data: Payload) => void;

export const dispatchHandlers: { [name: string]: Handler } = {
	READY: onReady,
	MESSAGE_CREATE: onMessageCreate,
	MESSAGE_UPDATE: onMessageUpdate,
	MESSAGE_DELETE: onMessageDelete,
	INVITE_CODE_DELETE: inviteCodeDelete,
	INVITE_CODE_USE: inviteCodeUse,
	PRESENCE_UPDATE: presenceUpdate,
	GUILD_MEMBER_ADD: guildMemberAdd,
	TYPING_START: typingStart,
	USER_UPDATE: userUpdate,
	MESSAGE_DELETE_BULK: messageDeleteBulk,
	GUILD_MEMBER_REMOVE: guildMemberRemove,
};
