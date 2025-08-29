import type { User } from "@/types/User";

export type Server = {
	id: string;
	name: string;
	brief: string;
	icon: string | null;
	ownerId: string;
	// members: any[];
	createdAt: string;
};

export type Channel = {
	id: string;
	name: string;
	createdAt: string;
	guildId: string;
};

export type ServerMember = {
	id: number;
	nickname: string | null;
	user: User;
	userId: string;
};
