import { devtools } from "zustand/middleware";
import { create } from "zustand/react";
import type { Channel, Server, ServerMember } from "@/types/Server";

export type ServersState = {
	data: Server[];
	insert: (data: Server) => void;
	delete: (id: string) => void;
	get: (id: string) => Server | undefined;
	update: (id: string, data: Server) => void;
	set: (data: Server[]) => void;
};

export const useServers = create<ServersState>()(
	devtools((set, get) => ({
		data: [],
		insert: (data: Server) =>
			set((state) => ({
				data: [...state.data, data],
			})),
		delete: (id: string) =>
			set((state) => ({
				data: state.data.filter((server) => server.id !== id),
			})),
		get: (id: string) => get().data.find((server) => server.id === id),
		update: (id: string, data: Server) =>
			set((state) => {
				const array = [...state.data];
				const index = array.findIndex((server) => server.id === id);
				array[index] = data;
				return {
					data: array,
				};
			}),
		set: (data: Server[]) =>
			set(() => ({
				data,
			})),
	})),
);

export type ChannelsState = {
	data: { [key: string]: Channel[] };
	insert: (serverId: string, channel: Channel) => void;
	delete: (serverId: string, channelId: string) => void;
	clear: (serverId: string) => void;
	set: (serverId: string, data: Channel[]) => void;
};

export const useChannels = create<ChannelsState>()(
	devtools((set) => ({
		data: {},
		insert: (serverId: string, channel: Channel) =>
			set((state) => ({
				data: {
					...state.data,
					[serverId]: [...(state.data[serverId] ?? []), channel],
				},
			})),
		delete: (serverId: string, channelId: string) =>
			set((state) => {
				const newArray = [...(state.data[serverId] ?? [])].filter(
					(channel) => channel.id !== channelId,
				);
				return {
					data: { ...state.data, [serverId]: newArray },
				};
			}),
		clear: (serverId: string) =>
			set((state) => {
				const servers = { ...state.data };
				delete servers[serverId];
				return {
					data: servers,
				};
			}),
		set: (serverId: string, data: Channel[]) =>
			set((state) => ({
				data: { ...state.data, [serverId]: data },
			})),
	})),
);

export type MembersState = {
	data: Record<string, ServerMember[]>;
	setMembers: (serverId: string, members: ServerMember[]) => void;
	addMember: (serverId: string, member: ServerMember) => void;
	updateMember: (serverId: string, member: ServerMember) => void;
	removeMember: (serverId: string, userId: string) => void;
};

export const useMembers = create<MembersState>()(
	devtools((set) => ({
		data: {},
		setMembers: (serverId: string, members: ServerMember[]) =>
			set((state) => ({
				data: { ...state.data, [serverId]: members },
			})),
		addMember: (serverId: string, member: ServerMember) =>
			set((state) => {
				const newArray = [...(state.data[serverId] ?? [])];
				const index = newArray.findIndex((m) => m.id === member.id);
				if (index !== -1) {
					newArray[index] = member;
				} else {
					newArray.push(member);
				}
				return {
					data: { ...state.data, [serverId]: newArray },
				};
			}),
		updateMember: (serverId: string, member: ServerMember) =>
			set((state) => {
				const newArray = [...(state.data[serverId] ?? [])];
				const index = newArray.findIndex((m) => m.id === member.id);
				if (index !== -1) {
					newArray[index] = member;
				}
				return {
					data: { ...state.data, [serverId]: newArray },
				};
			}),
		removeMember: (serverId: string, userId: string) =>
			set((state) => {
				const newArray = [...(state.data[serverId] ?? [])].filter(
					(member) => member.userId !== userId,
				);
				return {
					data: { ...state.data, [serverId]: newArray },
				};
			}),
	})),
);
