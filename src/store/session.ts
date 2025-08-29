import { devtools } from "zustand/middleware";
import { create } from "zustand/react";
import type { Theme } from "@/context/ThemeProvider";
import type { Account, User } from "@/types/User";

export type SessionState = {
	currentAccount: Account | null;
	currentUser: User | null;
	settings: {
		theme: Theme;
		compactMode: boolean;
		compactShowAvatars: boolean;
		pendingDeletion: boolean;
		deleteAt: number;
	};
	login: (
		data: Omit<
			SessionState,
			"login" | "logout" | "updateCurrentUser" | "setSettings"
		>,
	) => void;
	logout: () => void;
	setSettings: (data: Partial<SessionState["settings"]>) => void;
	updateCurrentUser: (data: Partial<User>) => void;
};

export const useSession = create<SessionState>()(
	devtools((set) => ({
		currentAccount: null,
		currentUser: null,
		settings: {
			theme: "light",
			compactMode: false,
			compactShowAvatars: false,
			pendingDeletion: false,
			deleteAt: 0,
		},
		login: (
			data: Omit<SessionState, "login" | "logout" | "updateCurrentUser">,
		) =>
			set(() => ({
				currentAccount: data.currentAccount,
				currentUser: data.currentUser,
				settings: data.settings,
			})),
		logout: () =>
			set(() => ({
				currentAccount: null,
				currentUser: null,
				settings: {
					theme: "light",
					compactMode: false,
					compactShowAvatars: false,
					pendingDeletion: false,
					deleteAt: 0,
				},
			})),
		setSettings: (data: Partial<SessionState["settings"]>) =>
			set((state) => ({
				settings: { ...state.settings, ...data },
			})),
		updateCurrentUser: (data: Partial<User>) =>
			set((state) => ({
				currentUser: state.currentUser
					? { ...state.currentUser, ...data }
					: null,
			})),
	})),
);
