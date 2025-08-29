import { zodResolver } from "@hookform/resolvers/zod";
import { useVirtualizer } from "@tanstack/react-virtual";
import { nanoid } from "nanoid";
import React, { useEffect, useRef } from "react";
import { type FieldError, type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import z from "zod/v4";
import { AccountSettingsPane } from "@/components/App/panes/AccountSettingsPane";
import { AdminPane } from "@/components/App/panes/AdminSettingsPane";
import Alert from "@/components/UI/Alert";
import Avatar from "@/components/UI/Avatar";
import CurrentUserProfile from "@/components/UI/extension/CurrentUserProfile";
import Tabs from "@/components/UI/Tabs";
import { useAppStore } from "@/store/app";
import { useChannels, useMembers, useServers } from "@/store/servers";
import { useSession } from "@/store/session";
import type { User } from "@/types/User";
import { serverLinkStyle } from "@/utils/styles/serverLinkStyle";
import Server from "../../icons/Server.svg";
import { FormInput } from "../UI/Input";
import Modal from "../UI/Modal";

const ServerCreateSchema = z.object({
	name: z
		.string()
		.min(2, "app.modals.serverCreate.nameMinChars")
		.max(64, "app.modals.serverCreate.nameMaxChars"),
	brief: z
		.string()
		.min(2, "app.modals.serverCreate.briefMinChars")
		.max(36, "app.modals.serverCreate.briefMinChars"),
});

const ServerJoinSchema = z.object({
	invite: z.string().nonempty("app.modals.serverJoin.inviteRequired"),
});

const ServerAddModal: React.FC = () => {
	const [showModal, setModal] = React.useState(false);
	const { t } = useTranslation();
	const user = useSession((session) => session.currentUser);
	const servers = useServers();
	const channels = useChannels();
	const members = useMembers();
	const navigate = useNavigate();
	const [globalError, setGlobalError] = React.useState<string | null>(null);
	const [mode, setMode] = React.useState<"create" | "join">("create");
	const appStore = useAppStore();
	const session = useSession();
	const {
		register: registerCreate,
		handleSubmit: handleSubmitCreate,
		formState: {
			errors: errorsCreate,
			isValid: isValidCreate,
			isSubmitting: isSubmittingCreate,
		},
		setError: setErrorCreate,
		setValue: setValueCreate,
	} = useForm<z.infer<typeof ServerCreateSchema>>({
		resolver: zodResolver(ServerCreateSchema),
	});

	const {
		register: registerJoin,
		handleSubmit: handleSubmitJoin,
		formState: {
			errors: errorsJoin,
			isValid: isValidJoin,
			isSubmitting: isSubmittingJoin,
		},
		setError: setErrorJoin,
		setValue: setValueJoin,
	} = useForm<z.infer<typeof ServerJoinSchema>>({
		resolver: zodResolver(ServerJoinSchema),
	});

	useEffect(() => {
		setValueCreate(
			"name",
			t("app.modals.serverCreate.defaultName", { username: user?.username }),
		);
		setValueCreate("brief", t("app.modals.serverCreate.defaultBrief"));
		setValueJoin("invite", "");
	}, [setValueCreate, setValueJoin, t, user?.username]);

	const onSubmitCreate: SubmitHandler<z.infer<typeof ServerCreateSchema>> =
		React.useCallback(
			async (data) => {
				try {
					const createdGuild = await fetch(
						`${import.meta.env.VITE_API_URL}/guilds`,
						{
							method: "POST",
							credentials: "include",
							body: JSON.stringify(data),
							headers: {
								"Content-Type": "application/json",
							},
						},
					);
					const json = await createdGuild.json();
					if (createdGuild.status === 200) {
						servers.insert(json.guild);
						channels.set(json.guild.id, json.channels);
						if (session.currentUser) {
							members.setMembers(json.guild.id, [
								{
									userId: session.currentUser.id,
									nickname: null,
									user: session.currentUser,
									id: Math.floor(Math.random() * 100000),
								},
							]);
						}
						setModal(false);
						appStore.setHasModal(false);
						navigate(`/channels/${json.guild.id}/${json.channels[0].id}`);
					} else {
						if (json.path === "global") setGlobalError(json.message);
						else setErrorCreate(json.path, json.message);
					}
				} catch (e) {
					console.error(e);
				}
			},
			[
				session.currentUser,
				appStore.setHasModal,
				channels.set,
				members.setMembers,
				navigate,
				servers.insert,
				setErrorCreate,
			],
		);

	const onSubmitJoin: SubmitHandler<z.infer<typeof ServerJoinSchema>> =
		React.useCallback(
			async (data) => {
				try {
					const guild = await fetch(
						`${import.meta.env.VITE_API_URL}/invites/${data.invite.replace(import.meta.env.VITE_INVITE_URL, "")}`,
						{
							method: "POST",
							credentials: "include",
							headers: {
								"Content-Type": "application/json",
							},
						},
					);
					const json = await guild.json();
					if (guild.status === 200) {
						servers.insert(json.guild);
						channels.set(json.guild.id, json.guild.channels);
						members.setMembers(json.guild.id, json.guild.members);
						setModal(false);
						appStore.setHasModal(false);
						navigate(`/channels/${json.guild.id}/${json.guild.channels[0].id}`);
					} else {
						if (json.path === "global") setGlobalError(json.message);
						else setErrorJoin(json.path, json.message);
					}
				} catch (e) {
					console.error(e);
				}
			},
			[
				appStore.setHasModal,
				channels.set,
				members.setMembers,
				navigate,
				servers.insert,
				setErrorJoin,
			],
		);

	return (
		<>
			<button
				className={serverLinkStyle({ isActive: false })}
				onClick={() => {
					setModal(true);
					appStore.setHasModal(true);
				}}
				type="button"
			>
				<svg
					width="24"
					height="24"
					className="dark:text-[#F7E26B]"
					viewBox="0 0 24 25"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					role="img"
					aria-label="add server icon"
				>
					<path
						d="M12 5.63403V19.634M5 12.634H19"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>
			<Modal
				show={showModal}
				close={() => {
					setModal(false);
					appStore.setHasModal(false);
				}}
				title={t(
					mode === "create"
						? "app.modals.serverCreate.title"
						: "app.modals.serverJoin.title",
				)}
				confirmText={
					mode === "create"
						? isSubmittingCreate
							? t("common.creating")
							: t("common.create")
						: isSubmittingJoin
							? t("common.joining")
							: t("common.join")
				}
				confirmDisabled={
					mode === "create"
						? !isValidCreate || isSubmittingCreate
						: !isValidJoin || isSubmittingJoin
				}
				closable={mode === "create" ? !isSubmittingCreate : !isSubmittingJoin}
				onConfirm={() => {
					if (mode === "create") handleSubmitCreate(onSubmitCreate)();
					else handleSubmitJoin(onSubmitJoin)();
				}}
				subtitle={t("app.modals.serverCreate.subtitle")}
				icon={<img src={Server} alt="icon" className="w-[32px] h-[20px]" />}
			>
				{globalError && (
					<Alert variant="destructive" title="Server error">
						{t(globalError)}
					</Alert>
				)}
				<Tabs
					activeTab={mode}
					setActiveTab={setMode}
					data={[
						{
							name: t("common.create"),
							id: "create",
							contents: (
								<form onSubmit={handleSubmitCreate(onSubmitCreate)}>
									<FormInput
										type="text"
										placeholder={t("app.modals.serverCreate.name")}
										label={t("app.modals.serverCreate.name")}
										name="name"
										id={`name-${nanoid()}`}
										labelStyle={{ marginTop: "15px" }}
										register={registerCreate}
										translatedError={{ error: errorsCreate.name as FieldError }}
									/>
									<FormInput
										type="text"
										placeholder={t("app.modals.serverCreate.brief")}
										label={t("app.modals.serverCreate.brief")}
										name="brief"
										id={`brief-${nanoid()}`}
										labelStyle={{ marginTop: "15px" }}
										register={registerCreate}
										translatedError={{
											error: errorsCreate.brief as FieldError,
										}}
									/>
								</form>
							),
						},
						{
							name: t("common.join"),
							id: "join",
							contents: (
								<form onSubmit={handleSubmitJoin(onSubmitJoin)}>
									<FormInput
										type="text"
										placeholder={t("app.modals.serverJoin.invite")}
										label={t("app.modals.serverJoin.invite")}
										name="invite"
										id={`invite-${nanoid()}`}
										labelStyle={{ marginTop: "15px" }}
										register={registerJoin}
										translatedError={{ error: errorsJoin.invite as FieldError }}
									/>
								</form>
							),
						},
					]}
				/>
			</Modal>
		</>
	);
};

const ServerSidebar: React.FC = () => {
	const servers = useServers();
	const channels = useChannels();
	const session = useSession();
	const parentRef = useRef<HTMLDivElement>(null);

	const serverVirtualizer = useVirtualizer({
		count: servers.data.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 60,
	});

	return (
		<div
			ref={parentRef}
			className="flex overflow-hidden flex-col h-[100%] bg-[#e9e9e9] w-[72px] items-center pt-[15px] dark:bg-[#302F2B] dim:bg-black"
		>
			<div>
				<NavLink
					to="/channels/@me"
					className={({ isActive }) =>
						serverLinkStyle({
							isActive,
							className: "text-[32px] font-logo font-bold",
						})
					}
				>
					V
				</NavLink>
				<ServerAddModal />
			</div>
			{servers.data.length > 0 && (
				<div className="w-[35px] h-[1px] bg-black dark:bg-[#9b8f4d] dim:bg-[#9b8f4d]" />
			)}
			<div
				className="overflow-auto mt-[10px]"
				style={{
					scrollbarWidth: "none",
					height: `${serverVirtualizer.getTotalSize()}px`,
				}}
			>
				{serverVirtualizer.getVirtualItems().map((virtualItem) => {
					const server = servers.data[virtualItem.index];
					return (
						<NavLink
							to={`/channels/${server.id}/${channels.data[server.id]?.[0].id ?? ""}`}
							className={({ isActive }) =>
								serverLinkStyle({ isActive, className: "font-semibold" })
							}
							key={server.id}
						>
							{server.name
								.split(" ")
								.map((word) => word[0])
								.join("")}
						</NavLink>
					);
				})}
			</div>
			<div className="justify-self-end mt-auto gap-2 mb-4 items-center justify-center flex flex-col">
				{((session.currentUser?.flags as number) & (1 << 0)) === 1 << 0 && (
					<AdminPane />
				)}
				<CurrentUserProfile user={session.currentUser as User}>
					<Avatar
						avatar={session.currentUser?.avatar}
						id={session.currentUser?.id as string}
						className="cursor-pointer"
						width="40px"
						height="40px"
					/>
				</CurrentUserProfile>
				<AccountSettingsPane currentTab="overview" />
			</div>
		</div>
	);
};
export default ServerSidebar;
