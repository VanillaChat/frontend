export type User = {
	id: string;
	username: string;
	tag: string;
	createdAt: Date;
	bot: boolean;
	status: "ONLINE" | "DND" | "IDLE" | "LOOKING_TO_PLAY" | "UNAVAILABLE";
	flags: number;
	nickname?: string;
	bio: string | null;
	avatar?: string | null;
	banner?: string | null;
};

export type Account = {
	id: string;
	email: string;
	emailVerified: boolean;
	locale: string;
};
