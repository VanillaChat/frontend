import { devtools } from "zustand/middleware";
import { create } from "zustand/react";

export type InviteData = {
	type: number;
	code: string;
	inviter: {
		id: string;
		username: string;
		avatar?: string | null;
	} | null;
	guild: {
		id: string;
		name: string;
		brief: string;
		icon: string | null;
	};
	guildId: string;
	channel: {
		id: string;
		type: number;
		name: string;
	};
};

export type InvitesState = {
	cache: Record<string, InviteData>;
	isLoading: Record<string, boolean>;
	fetchErrors: Record<string, boolean>;
	membershipStatus: Record<string, boolean>;
	addInvite: (code: string, data: InviteData) => void;
	getInvite: (code: string) => InviteData | undefined;
	hasInvite: (code: string) => boolean;
	hasFetchError: (code: string) => boolean;
	getMembershipStatus: (code: string) => boolean | undefined;
	setMembershipStatus: (code: string, isMember: boolean) => void;
	hasMembershipStatus: (code: string) => boolean;
	fetchInvite: (code: string) => Promise<InviteData | null>;
	clearCache: () => void;
	clearFetchError: (code: string) => void;
	retryFailedInvites: () => void;
};

export const useInvites = create<InvitesState>()(
	devtools((set, get) => ({
		cache: {},
		isLoading: {},
		fetchErrors: {},
		membershipStatus: {},

		addInvite: (code: string, data: InviteData) =>
			set((state) => ({
				cache: { ...state.cache, [code]: data },
				isLoading: { ...state.isLoading, [code]: false },
				fetchErrors: { ...state.fetchErrors, [code]: false },
			})),

		getInvite: (code: string) => get().cache[code],

		hasInvite: (code: string) => !!get().cache[code],

		hasFetchError: (code: string) => get().fetchErrors[code],

		getMembershipStatus: (code: string) => get().membershipStatus[code],

		setMembershipStatus: (code: string, isMember: boolean) =>
			set((state) => ({
				membershipStatus: { ...state.membershipStatus, [code]: isMember },
			})),

		hasMembershipStatus: (code: string) => code in get().membershipStatus,

		clearFetchError: (code: string) =>
			set((state) => ({
				fetchErrors: { ...state.fetchErrors, [code]: false },
			})),

		retryFailedInvites: () => {
			const state = get();
			const failedCodes = Object.keys(state.fetchErrors).filter(
				(code) => state.fetchErrors[code],
			);

			const updatedFetchErrors = { ...state.fetchErrors };
			failedCodes.forEach((code) => {
				updatedFetchErrors[code] = false;
			});

			set({ fetchErrors: updatedFetchErrors });

			failedCodes.forEach((code) => {
				get().fetchInvite(code);
			});
		},

		fetchInvite: async (code: string) => {
			const state = get();

			if (state.cache[code]) {
				return state.cache[code];
			}

			if (state.fetchErrors[code]) {
				return null;
			}

			if (state.isLoading[code]) {
				return null;
			}

			set((state) => ({
				isLoading: { ...state.isLoading, [code]: true },
			}));

			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 10000);

				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/invites/${code}`,
					{
						credentials: "include",
						signal: controller.signal,
					},
				);

				clearTimeout(timeoutId);

				if (!response.ok) {
					if (!import.meta.env.PROD) {
						set((state) => ({
							isLoading: { ...state.isLoading, [code]: false },
							fetchErrors: { ...state.fetchErrors, [code]: true },
						}));
					} else {
						set((state) => ({
							isLoading: { ...state.isLoading, [code]: false },
						}));
					}
					return null;
				}

				const data = await response.json();

				get().addInvite(code, data);

				return data;
			} catch (error) {
				console.error("Failed to fetch invite:", error);

				if (!import.meta.env.PROD) {
					set((state) => ({
						isLoading: { ...state.isLoading, [code]: false },
						fetchErrors: { ...state.fetchErrors, [code]: true },
					}));
				} else {
					set((state) => ({
						isLoading: { ...state.isLoading, [code]: false },
					}));
				}
				return null;
			}
		},

		clearCache: () =>
			set({ cache: {}, isLoading: {}, fetchErrors: {}, membershipStatus: {} }),
	})),
);
