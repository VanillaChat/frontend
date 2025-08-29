import { Toast } from "@base-ui-components/react";
import { createColumnHelper } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { FaCopy, FaTrash } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import { RiQuestionFill } from "react-icons/ri";
import Alert from "@/components/UI/Alert";
import Avatar from "@/components/UI/Avatar";
import Button from "@/components/UI/Button";
import FullScreen from "@/components/UI/FullScreen";
import { Tab } from "@/components/UI/Tab";
import Table from "@/components/UI/Table";
import { useAppStore } from "@/store/app";
import { useSession } from "@/store/session";
import cn from "@/utils/cn";
import { formatDate } from "@/utils/formatDate";
import { buttonStyles } from "@/utils/styles/buttonStyle";
import { serverLinkStyle } from "@/utils/styles/serverLinkStyle";

export const AdminPane = (props: {
	currentTab?: "overview" | "users" | "instance-settings" | "invite-codes";
}) => {
	const [currentTab, setCurrentTab] = useState<typeof props.currentTab>(
		props.currentTab || "overview",
	);
	const appStore = useAppStore();
	const [error, setError] = useState<boolean>(false);
	const session = useSession();
	const toastManager = Toast.useToastManager();

	const columnHelper =
		createColumnHelper<(typeof appStore.settings.inviteCodes)[number]>();

	// console.log(appStore.settings.inviteCodes.filter((x) => x.used));

	const unusedInviteColumns = useMemo(
		() => [
			columnHelper.accessor("code", {
				header: "Code",
				filterFn: "includesString",
				cell: ({ cell }) => (
					<div className="flex flex-row gap-2 items-center">
						<span className="!select-text">{cell.getValue()}</span>
						<button
							className={cn(buttonStyles({ filled: false }), "p-2")}
							onClick={() => navigator.clipboard.writeText(cell.getValue())}
							type="button"
						>
							<FaCopy />
						</button>
					</div>
				),
			}),
			columnHelper.accessor("createdAt", {
				header: "Created At",
				filterFn: "includesString",
				cell: ({ cell }) => formatDate(cell.getValue()),
			}),
			columnHelper.accessor("createdBy", {
				header: "Created By",
				filterFn: "includesString",
				cell: ({ cell }) => (
					<div className="flex flex-row gap-2 text-center items-center">
						<Avatar
							width="32px"
							height="32px"
							id={cell.getValue().id}
							avatar={cell.getValue().avatar}
							className="rounded-[100%]"
						/>
						{/*<img src="https://cdn.discordapp.com/avatars/309427040908476416/f04949f40541d7036f687933d482a8dc.webp?size=1024" width="32px" height="32px" className="rounded-[100%]" alt="avatar" />*/}
						<p>{cell.getValue().username}</p>
					</div>
				),
			}),
			// columnHelper.accessor('id', {
			//     header: 'ID',
			//     filterFn: 'includesString',
			// }),
			columnHelper.display({
				cell: (cell) => (
					<button
						className={cn(
							buttonStyles({ filled: false }),
							"p-2 w-fit justify-self-end",
						)}
						onClick={async () => {
							const res = await fetch(
								`${import.meta.env.VITE_API_URL}/admin/invite-codes/${cell.row.original.id}`,
								{
									method: "DELETE",
									credentials: "include",
								},
							);

							if (res.status === 204) {
								appStore.setSettings({
									inviteCodes: appStore.settings.inviteCodes.filter(
										(code) => code.id !== cell.row.original.id,
									),
								});
							} else {
								setError(true);
							}
						}}
						type="button"
					>
						<FaTrash color="#FF4D4D" />
					</button>
				),
				id: "actions",
			}),
		],
		[
			appStore.setSettings,
			appStore.settings.inviteCodes.filter,
			columnHelper.accessor, // columnHelper.accessor('id', {
			//     header: 'ID',
			//     filterFn: 'includesString',
			// }),
			columnHelper.display,
		],
	);

	const usedInviteColumns = useMemo(
		() => [
			columnHelper.accessor("code", {
				header: "Code",
				filterFn: "includesString",
				cell: ({ cell }) => (
					<div className="flex flex-row gap-2 items-center">
						<span className="!select-text">{cell.getValue()}</span>
						<button
							className={cn(buttonStyles({ filled: false }), "p-2")}
							onClick={() => navigator.clipboard.writeText(cell.getValue())}
							type="button"
						>
							<FaCopy />
						</button>
					</div>
				),
			}),
			columnHelper.accessor("createdAt", {
				header: "Created At",
				filterFn: "includesString",
				cell: ({ cell }) => formatDate(cell.getValue()),
			}),
			columnHelper.accessor("createdBy", {
				header: "Created By",
				filterFn: "includesString",
				cell: ({ cell }) => (
					<div className="flex flex-row gap-2 text-center items-center">
						<Avatar
							width="32px"
							height="32px"
							id={cell.getValue().id}
							avatar={cell.getValue().avatar}
							className="rounded-[100%]"
						/>
						{/*<img src="https://cdn.discordapp.com/avatars/309427040908476416/f04949f40541d7036f687933d482a8dc.webp?size=1024" width="32px" height="32px" className="rounded-[100%]" alt="avatar" />*/}
						<p>{cell.getValue().username}</p>
					</div>
				),
			}),
			columnHelper.accessor("usedBy", {
				header: "Used By",
				filterFn: "includesString",
				cell: ({ cell }) => {
					// console.log(cell.getValue());
					return (
						<div className="flex flex-row gap-2 text-center items-center">
							<Avatar
								width="32px"
								height="32px"
								id={cell.getValue().user.id}
								avatar={cell.getValue().user.avatar}
								className="rounded-[100%]"
							/>
							{/*<img src="https://cdn.discordapp.com/avatars/309427040908476416/f04949f40541d7036f687933d482a8dc.webp?size=1024" width="32px" height="32px" className="rounded-[100%]" alt="avatar" />*/}
							<p>{cell.getValue().user.username}</p>
						</div>
					);
				},
			}),
		],
		[columnHelper.accessor],
	);

	const onCreateCode = useCallback(async () => {
		const res = await fetch(
			`${import.meta.env.VITE_API_URL}/admin/invite-codes`,
			{
				method: "POST",
				credentials: "include",
			},
		);
		if (res.status === 200) {
			const code = await res.json();
			appStore.setSettings({
				inviteCodes: [
					...appStore.settings.inviteCodes,
					{
						...code,
						createdBy: session.currentUser,
					},
				],
			});
			toastManager.add({
				title: "Invite code created!",
				description: `Your invite code: ${code.code}`,
				timeout: 10000,
			});
			setError(false);
		} else {
			setError(true);
		}
	}, [
		appStore.setSettings,
		appStore.settings.inviteCodes,
		session.currentUser,
		toastManager,
	]);

	return (
		<FullScreen
			ButtonElement={(props) => (
				<button
					className={serverLinkStyle({
						isActive: false,
					})}
					onClick={props.onClick}
					type="button"
				>
					<MdAdminPanelSettings size="28px" />
				</button>
			)}
		>
			<div className="h-[100%] w-[340px] py-10 px-3 flex flex-col gap-2 bg-[#F2F2F2] dark:bg-[#302F2B] dim:bg-[#000000]">
				<p className="font-bold">Admin Settings</p>
				<Tab
					active={currentTab === "overview"}
					onClick={() => setCurrentTab("overview")}
				>
					Overview
				</Tab>
				<Tab
					active={currentTab === "users"}
					onClick={() => setCurrentTab("users")}
				>
					Users
				</Tab>
				{import.meta.env.VITE_REGISTRATION_CLOSED && (
					<Tab
						active={currentTab === "invite-codes"}
						onClick={() => setCurrentTab("invite-codes")}
					>
						Invite Codes
					</Tab>
				)}
				<Tab
					active={currentTab === "instance-settings"}
					onClick={() => setCurrentTab("instance-settings")}
				>
					Instance Configuration
				</Tab>
			</div>
			<div
				className="w-full mx-6 my-10 flex flex-col gap-5 overflow-auto"
				style={{ scrollbarGutter: "stable both-edges" }}
			>
				<h1 className="font-bold text-[22px]">
					{currentTab
						?.split("-")
						.map((str) => str[0].toUpperCase() + str.slice(1).toLowerCase())
						.join(" ")}
				</h1>
				{currentTab === "invite-codes" && (
					<>
						<p className="translate-y-[-12px] max-w-[660px]">
							Registration is closed on this instance and new users require an
							invite code to register. To reopen it, a sysadmin needs to toggle
							its flag in the environment variables.
						</p>
						<div className="flex z-50">
							<Button filled onClick={onCreateCode}>
								Create code
							</Button>
						</div>
						{error && <Alert variant="destructive">An error occurred.</Alert>}
						{appStore.settings.inviteCodes.length === 0 && (
							<div className="flex flex-col gap-3 h-full w-full justify-center items-center translate-y-[-48px]">
								<RiQuestionFill size="42px" />
								<h1 className="font-bold text-[24px]">No invite codes found</h1>
								<p>
									There are no invite codes present. Create one and get the
									party started!
								</p>
							</div>
						)}
						{appStore.settings.inviteCodes.filter((x) => !x.used).length >
							0 && (
							<>
								<p className="font-bold mt-2 translate-x-[0_5px]">
									Active codes
								</p>
								<Table
									columns={unusedInviteColumns}
									data={appStore.settings.inviteCodes.filter((x) => !x.used)}
								/>
							</>
						)}
						{appStore.settings.inviteCodes.filter((x) => x.used).length > 0 && (
							<>
								<p className="font-bold mt-2 translate-x-[0_5px]">
									Archived codes
								</p>
								<Table
									columns={usedInviteColumns}
									data={appStore.settings.inviteCodes.filter((x) => x.used)}
								/>
							</>
						)}
					</>
				)}
			</div>
		</FullScreen>
	);
};
