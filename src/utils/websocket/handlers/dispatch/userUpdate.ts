import { useMembers } from "@/store/servers";
import { useSession } from "@/store/session";
import type { ServerMember } from "@/types/Server";
import type { Payload } from "@/utils/websocket/handlers";
import type ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";

export default function userUpdate(_: ReconnectingWebSocket, data: Payload) {
	const members = useMembers.getState();
	const session = useSession.getState();

	if (session.currentUser?.id === data.d.user.id) return;
	members.updateMember(data.d.guildId, {
		...(members.data[data.d.guildId]?.find(
			(member) => member.user.id === data.d.user.id,
		) as ServerMember),
		user: data.d.user,
	});
}
