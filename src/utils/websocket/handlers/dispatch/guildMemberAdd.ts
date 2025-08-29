import { usePresence } from "@/store/presence";
import { useMembers } from "@/store/servers";
import type { Payload } from "@/utils/websocket/handlers";
import type ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";

export default function guildMemberAdd(
	_ws: ReconnectingWebSocket,
	data: Payload,
) {
	useMembers.getState().addMember(data.d.guildId, data.d);
	if (data.d.user.status !== "UNAVAILABLE")
		usePresence.getState().setPresence(data.d.user.id, data.d.user.status);
}

export function guildMemberRemove(_ws: ReconnectingWebSocket, data: Payload) {
	useMembers.getState().removeMember(data.d.guildId, data.d.user.id);
	usePresence.getState().removePresence(data.d.user.id);
}
