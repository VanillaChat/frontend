import ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";
import {Payload} from "@/utils/websocket/handlers";
import {useMembers} from "@/store/servers";

export default function guildMemberAdd(ws: ReconnectingWebSocket, data: Payload) {
    useMembers.getState().addMember(data.d.guildId, data.d);
}