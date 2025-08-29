import { Checkbox } from "@base-ui-components/react/checkbox";
import { nanoid } from "nanoid";
import type React from "react";
import { useMemo, useRef, useState } from "react";
import { FaCog, FaPencilAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DeleteAccountModal from "@/components/App/modals/DeleteAccountModal";
import EmailChangeModal from "@/components/App/modals/EmailChangeModal";
import PasswordChangeModal from "@/components/App/modals/PasswordChangeModal";
import ProfileEditModal from "@/components/App/modals/ProfileEditModal";
import Avatar from "@/components/UI/Avatar";
import FullScreen from "@/components/UI/FullScreen";
import { type Theme, useTheme } from "@/context/ThemeProvider";
import CompactModeOffDark from "@/icons/images/compact-mode-off-dark.svg";
import CompactModeOffDim from "@/icons/images/compact-mode-off-dim.svg";
import CompactModeOffLight from "@/icons/images/compact-mode-off-light.svg";
import CompactModeOnDark from "@/icons/images/compact-mode-on-dark.svg";
import CompactModeOnDim from "@/icons/images/compact-mode-on-dim.svg";
import CompactModeOnLight from "@/icons/images/compact-mode-on-light.svg";
import DarkThemePreview from "@/icons/images/dark-theme-preview.svg";
import DimThemePreview from "@/icons/images/dim-theme-preview.svg";
import LightThemePreview from "@/icons/images/light-theme-preview.svg";
import { useMembers } from "@/store/servers";
import { useSession } from "@/store/session";
import cn from "@/utils/cn";
import { serverLinkStyle } from "@/utils/styles/serverLinkStyle";
import { updateUserInAllGuilds } from "@/utils/updateUserInAllGuilds";
import { Tab } from "../../UI/Tab";

export const AccountSettingsPane = (props: {
	currentTab?: "overview" | "appearance";
}) => {
	const [currentTab, setCurrentTab] = useState<typeof props.currentTab>(
		props.currentTab || "overview",
	);
	const session = useSession();
	const members = useMembers();
	const [compactMode, setCompactMode] = useState(session.settings.compactMode);
	const [compactShowAvatars, setCompactShowAvatars] = useState(
		session.settings.compactShowAvatars,
	);
	const avatarInputRef = useRef<HTMLInputElement>(null);
	const bannerInputRef = useRef<HTMLInputElement>(null);
	const { theme, setTheme } = useTheme();
	const navigate = useNavigate();

	const updateUserImage = async (
		type: "avatar" | "banner",
		file: File | null,
	) => {
		if (
			!file &&
			!window.confirm(`Are you sure you want to remove your ${type}?`)
		) {
			return;
		}

		try {
			let base64: string | null = null;

			if (file) {
				base64 = await new Promise<string>((resolve, reject) => {
					const reader = new FileReader();
					reader.readAsDataURL(file);
					reader.onload = () => resolve(reader.result as string);
					reader.onerror = (error) => reject(error);
				});
			}

			const res = await fetch(`${import.meta.env.VITE_API_URL}/users/@me`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					[type]: base64,
				}),
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.error || `Failed to update ${type}`);
			}

			const updatedUser = await res.json();
			session.updateCurrentUser(updatedUser);
			updateUserInAllGuilds(
				updatedUser,
				members,
				session.currentUser?.id as string,
			);
		} catch (error) {
			console.error(`Error updating ${type}:`, error);
		}
	};

	const updateTheme = async (newTheme: Theme) => {
		if (newTheme === theme) return;

		try {
			setTheme(newTheme);

			const res = await fetch(
				`${import.meta.env.VITE_API_URL}/users/@me/user-settings`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({
						theme: newTheme.toUpperCase(),
					}),
				},
			);

			if (res.status !== 204) {
				setTheme(session.settings.theme);
			} else {
				session.setSettings({ theme: newTheme });
			}
		} catch (error) {
			console.error("Error updating theme:", error);
		}
	};

	const updateCompactMode = async (
		newCompact: boolean,
		newShowAvatars: boolean,
	) => {
		const previousCompact = compactMode;
		const previousShowAvatars = compactShowAvatars;

		setCompactMode(newCompact);
		setCompactShowAvatars(newShowAvatars);

		if (
			session.settings.compactMode === newCompact &&
			session.settings.compactShowAvatars === newShowAvatars
		) {
			return;
		}

		const updates: any = {};
		if (newCompact !== session.settings.compactMode)
			updates.compactMode = newCompact;
		if (newShowAvatars !== session.settings.compactShowAvatars)
			updates.compactShowAvatars = newShowAvatars;

		try {
			const res = await fetch(
				`${import.meta.env.VITE_API_URL}/users/@me/user-settings`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify(updates),
				},
			);

			if (res.status !== 204) {
				setCompactMode(previousCompact);
				setCompactShowAvatars(previousShowAvatars);
				throw new Error("Failed to update settings");
			}

			session.setSettings({
				...session.settings,
				...updates,
			});
		} catch (error) {
			console.error("Error updating compact mode settings:", error);
			setCompactMode(previousCompact);
			setCompactShowAvatars(previousShowAvatars);
		}
	};

	const currentNonCompactModeImage = useMemo(() => {
		switch (theme) {
			case "light":
				return CompactModeOffLight;
			case "dark":
				return CompactModeOffDark;
			case "dim":
				return CompactModeOffDim;
			default:
		}
	}, [theme]);

	const currentCompactModeImage = useMemo(() => {
		switch (theme) {
			case "light":
				return CompactModeOnLight;
			case "dark":
				return CompactModeOnDark;
			case "dim":
				return CompactModeOnDim;
			default:
		}
	}, [theme]);

	if (!session.currentUser || !session.currentAccount) return null;

	return (
		<FullScreen
			ButtonElement={(props) => (
				<button
					className={serverLinkStyle({ isActive: false })}
					onClick={props.onClick}
					type="button"
				>
					<FaCog size="24px" />
				</button>
			)}
		>
			<div className="h-[100%] w-[340px] py-10 px-3 flex flex-col gap-2 bg-[#F2F2F2] dark:bg-[#302F2B] dim:bg-[#000000]">
				<p className="font-bold">User Settings</p>
				<Tab
					active={currentTab === "overview"}
					onClick={() => setCurrentTab("overview")}
				>
					Overview
				</Tab>
				<Tab
					active={currentTab === "appearance"}
					onClick={() => setCurrentTab("appearance")}
				>
					Appearance
				</Tab>
				<Tab
					active={false}
					onClick={async () => {
						await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
							method: "POST",
							credentials: "include",
						});
						session.logout();
						navigate("/login");
					}}
				>
					<p className="text-red-500">Log out</p>
				</Tab>
			</div>
			<div
				className="w-full ml-6 mr-11 my-10 flex flex-col gap-5 overflow-auto"
				style={{ scrollbarGutter: "stable both-edges" }}
			>
				<h1 className="font-bold text-[22px]">
					{currentTab
						?.split("-")
						.map((str) => str[0].toUpperCase() + str.slice(1).toLowerCase())
						.join(" ")}
				</h1>
				{currentTab === "overview" && (
					<div className="flex flex-col gap-2 mt-2">
						<p className="font-bold text-[20px]">Profile</p>
						<div className="flex flex-row gap-2">
							<div className="relative">
								<div className="relative w-[95px] h-[95px] rounded-[10px] overflow-hidden group">
									<Avatar
										id={session.currentUser.id}
										avatar={session.currentUser.avatar}
										width="100%"
										height="100%"
										className="w-full h-full object-cover rounded-[10px]"
									/>
									<button
										className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
										onClick={(e) => {
											e.stopPropagation();
											avatarInputRef.current?.click();
										}}
										type="button"
									>
										<FaPencilAlt className="text-white text-lg" />
									</button>
									<input
										type="file"
										ref={avatarInputRef}
										className="hidden"
										accept="image/png,image/jpeg,image/webp,image/gif"
										id={`avatar-${nanoid()}`}
										name="avatar"
										onChange={async (e) => {
											const file = e.target.files?.[0];
											if (file) {
												await updateUserImage("avatar", file);
											}
										}}
									/>
								</div>
								<div className="h-5">
									{session.currentUser.avatar && (
										<button
											className="text-xs hover:underline cursor-pointer"
											onClick={async (e) => {
												e.stopPropagation();
												await updateUserImage("avatar", null);
											}}
											type="button"
										>
											Remove Avatar
										</button>
									)}
								</div>
							</div>
							<div className="relative flex-1 flex flex-col">
								<button
									className="relative w-full h-[94px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-[10px] overflow-hidden cursor-pointer group"
									onClick={() => bannerInputRef.current?.click()}
									type="button"
								>
									{session.currentUser.banner && (
										<img
											src={`${import.meta.env.VITE_API_URL}/cdn/banners/${session.currentUser.id}/${session.currentUser.banner}.webp`}
											alt="Banner"
											className="w-full h-full object-cover"
										/>
									)}
									<div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-row gap-2 font-bold items-center justify-center z-10">
										<FaPencilAlt className="text-white text-lg mb-1" />
										<span className="text-white text-sm">Change Banner</span>
									</div>
									<input
										type="file"
										ref={bannerInputRef}
										className="hidden"
										accept="image/png,image/jpeg,image/webp,image/gif"
										id={`banner-${nanoid()}`}
										name="banner"
										onChange={async (e) => {
											const file = e.target.files?.[0];
											if (file) {
												await updateUserImage("banner", file);
											}
										}}
									/>
									<div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/80 to-transparent w-full">
										<div className="flex flex-col items-start text-white my-[8px]">
											<span className="text-xl font-bold">
												{session.currentUser.username}
											</span>
											<span className="text-[14px] text-gray-300">
												/ {session.currentUser.tag}
											</span>
										</div>
									</div>
								</button>
								<div className="h-5">
									{session.currentUser.banner && (
										<button
											className="text-xs hover:underline cursor-pointer"
											onClick={async (e) => {
												e.stopPropagation();
												await updateUserImage("banner", null);
											}}
											type="button"
										>
											Remove Banner
										</button>
									)}
								</div>
							</div>
						</div>
						<div className="flex flex-col mt-4">
							<ProfileEditModal />
							<EmailChangeModal />
							<PasswordChangeModal />
							<DeleteAccountModal />
						</div>
					</div>
				)}
				{currentTab === "appearance" && (
					<div className="flex flex-col justify-center">
						<p>Theme</p>
						<div className="flex flex-row gap-2 mt-2">
							<button
								className="flex flex-col items-center justify-center gap-2 cursor-pointer"
								onClick={async () => await updateTheme("light")}
								type="button"
							>
								<img
									src={LightThemePreview}
									className={cn(
										"rounded-[8px] cursor-pointer border-4 dark:border-2 dim:border-2 border-transparent p-0.5 hover:border-[#f7e26c]",
										{
											"border-[#f7e26c]": theme === "light",
										},
									)}
									alt="light-theme"
									width={256}
									height={128}
								/>
								<p className="font-bold">Light</p>
							</button>
							<button
								className="flex flex-col items-center justify-center gap-2 cursor-pointer"
								onClick={async () => await updateTheme("dark")}
								type="button"
							>
								<img
									src={DarkThemePreview}
									className={cn(
										"rounded-[8px] cursor-pointer border-4 dark:border-2 dim:border-2 border-transparent p-0.5 hover:border-[#f7e26c]",
										{
											"border-[#f7e26c]": theme === "dark",
										},
									)}
									alt="dark-theme"
									width={256}
									height={128}
								/>
								<p className="font-bold">Dark</p>
							</button>
							<button
								className="flex flex-col items-center justify-center gap-2 cursor-pointer"
								onClick={async () => await updateTheme("dim")}
								type="button"
							>
								<img
									src={DimThemePreview}
									className={cn(
										"rounded-[8px] cursor-pointer border-4 dark:border-2 dim:border-2 border-transparent p-0.5 hover:border-[#f7e26c]",
										{
											"border-[#f7e26c]": theme === "dim",
										},
									)}
									alt="light-theme"
									width={256}
									height={128}
								/>
								<p className="font-bold">Dim</p>
							</button>
						</div>
						<p className="mt-4">Compact Mode</p>
						<div className="flex flex-row gap-2 mt-2">
							<button
								className="flex flex-col items-center justify-center gap-2 cursor-pointer"
								onClick={async () =>
									await updateCompactMode(
										false,
										session.settings.compactShowAvatars,
									)
								}
								type="button"
							>
								<img
									src={currentNonCompactModeImage}
									className={cn(
										"rounded-[8px] cursor-pointer border-4 dark:border-2 dim:border-2 border-transparent p-0.5 hover:border-[#f7e26c]",
										{
											"border-[#f7e26c]": !compactMode,
										},
									)}
									alt="compact-mode-off"
									width={256}
									height={128}
								/>
								<p className="font-bold">Off</p>
							</button>
							<button
								className="flex flex-col items-center justify-center gap-2 cursor-pointer"
								onClick={async () =>
									await updateCompactMode(
										true,
										session.settings.compactShowAvatars,
									)
								}
								type="button"
							>
								<img
									src={currentCompactModeImage}
									className={cn(
										"rounded-[8px] cursor-pointer border-4 dark:border-2 dim:border-2 border-transparent p-0.5 hover:border-[#f7e26c]",
										{
											"border-[#f7e26c]": compactMode,
										},
									)}
									alt="compact-mode-on"
									width={256}
									height={128}
								/>
								<p className="font-bold">On</p>
							</button>
						</div>
						<label
							className="flex items-center gap-2 text-base text-gray-900 dark:text-gray-100 dim:text-gray-200 mt-4"
							htmlFor="compact-show-avatars"
						>
							<Checkbox.Root
								checked={compactShowAvatars}
								onCheckedChange={(checked) =>
									updateCompactMode(
										session.settings.compactMode,
										checked as boolean,
									)
								}
								className={cn(
									"group relative flex size-5 items-center justify-center rounded border-2 transition-colors cursor-pointer",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
									"border-gray-300 dark:border-gray-500 dim:border-gray-600",
									"disabled:opacity-50 disabled:cursor-not-allowed",
									{
										"bg-[#f7e26c] border-[#f7e26c] border-none":
											compactShowAvatars,
										"hover:border-gray-400 dark:hover:border-gray-400 dim:hover:border-gray-500":
											!compactShowAvatars,
									},
								)}
								disabled={!compactMode}
								name="compact-show-avatars"
							>
								<Checkbox.Indicator>
									<div
										className={cn(
											"absolute inset-0 flex items-center justify-center rounded-sm transition-colors",
											{
												"bg-[#f7e26c]": compactShowAvatars,
												"group-hover:bg-gray-200 dark:group-hover:bg-gray-600 dim:group-hover:bg-gray-700":
													!compactShowAvatars,
											},
										)}
									>
										<CheckIcon
											className={cn("size-3.5 transition-opacity", {
												"text-gray-900 dark:text-gray-900 dim:text-gray-900":
													compactShowAvatars,
												"text-gray-400 opacity-0 group-hover:opacity-100 dark:group-hover:text-gray-300 dim:group-hover:text-gray-300":
													!compactShowAvatars,
											})}
										/>
									</div>
								</Checkbox.Indicator>
							</Checkbox.Root>
							<span
								className={cn(
									"text-sm font-medium",
									!session.settings.compactMode &&
										"opacity-50 cursor-not-allowed",
								)}
							>
								Show avatars
							</span>
						</label>
					</div>
				)}
			</div>
		</FullScreen>
	);
};

export function CheckIcon(props: React.ComponentProps<"svg">) {
	return (
		<svg
			fill="currentcolor"
			width="10"
			height="10"
			viewBox="0 0 10 10"
			role="img"
			aria-label="Check icon"
			{...props}
		>
			<path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
		</svg>
	);
}
