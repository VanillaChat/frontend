export type  User = {
    id: string;
    username: string;
    tag: string;
    createdAt: Date;
    bot: boolean;
    status: 'ONLINE' | 'DND' | 'IDLE' | 'LOOKING_TO_PLAY' | 'UNAVAILABLE';
    flags: number;
    nickname?: string;
};

export type Account = {
    id: string;
    email: string;
    emailVerified: boolean;
    locale: string;
}