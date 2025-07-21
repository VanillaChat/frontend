import ReconnectingWebSocket from "@/utils/websocket/ReconnectingWebSocket";
import {Payload} from "@/utils/websocket/handlers";
import {useSession} from "@/store/session";
import {useGateway} from "@/store/gateway";
import {useChannels, useMembers, useServers} from "@/store/servers";
import {Channel, Server, ServerMember} from "@/types/Server";
import {useAppStore} from "@/store/app";
import {usePresence} from "@/store/presence";

export default function onReady(ws: ReconnectingWebSocket, data: Payload) {
    console.log(`[WS] Ready.`);
    useSession.getState().login({
        currentUser: data.d.user,
        currentAccount: data.d.account
    });
    localStorage.setItem('theme', data.d.settings.theme.toLowerCase());
    document.querySelector('html')?.classList.remove('dark', 'dim');
    document.querySelector('html')?.classList.add(data.d.settings.theme.toLowerCase());
    useGateway.getState().setConnectionStatus(true);
    useServers.getState().set(data.d.guilds);
    for (const guild of data.d.guilds as (Server & {channels: Channel[], members: ServerMember[]})[]) {
        useChannels.getState().set(guild.id, guild.channels);
        useMembers.getState().setMembers(guild.id, guild.members);
    }
    if (data.d.presences) {
        usePresence.getState().setPresences(data.d.presences);
    }
    useAppStore.getState().setSettings(data.d.appSettings);
}