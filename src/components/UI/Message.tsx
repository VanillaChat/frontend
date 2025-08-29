import { ContextMenu, Toast } from "@base-ui-components/react";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isTomorrow from "dayjs/plugin/isTomorrow";
import isYesterday from "dayjs/plugin/isYesterday";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import { nanoid } from "nanoid";
import type React from "react";
import { useCallback, useRef } from "react";
import { FaExclamationCircle } from "react-icons/fa";
import { useParams } from "react-router-dom";
import Avatar from "@/components/UI/Avatar";
import UserProfile from "@/components/UI/extension/UserProfile";
import Input from "@/components/UI/Input";
import MessageWithInvites from "@/components/UI/MessageWithInvites";
import { useEditCache, useMessages } from "@/store/messages";
import { type UserStatus, usePresence } from "@/store/presence";
import { useSession } from "@/store/session";
import type { User } from "@/types/User";
import cn from "@/utils/cn";
import { formatDate } from "@/utils/formatDate";

dayjs.extend(localizedFormat);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(isYesterday);
dayjs.extend(utc);

type MessageProps = {
	content: string;
	author: Partial<User>;
	createdAt: Date;
	state: "SENT" | "SENDING" | "FAILED";
	updatedAt: Date | null;
	channelId: string;
	index: number;
	id: string;
};

const baseMessageStyle = (
	props: MessageProps,
	isCompact: boolean,
	editCache: ReturnType<typeof useEditCache.getState>,
) =>
	cn(
		"p-[0_16px] mt-[12px] opacity-100 flex rounded-r-[8px] text-[16px] w-[100%] justify-between hover:bg-[#d0d0d0] dark:hover:bg-[#49473f] dim:hover:bg-[#282828] group",
		{
			"opacity-[.5]": props.state === "SENDING",
			"mt-1": isCompact,
			"bg-[#d0d0d0] dark:bg-[#49473f] dim:bg-[#282828] pt-2":
				editCache.cache.isEditing && editCache.cache.messageId === props.id,
		},
	);

function BaseMessage(
	props: MessageProps & {
		isCompact: boolean;
		isBare?: boolean;
		messageRef?:
			| React.RefObject<HTMLDivElement | null>
			| React.RefObject<HTMLLIElement | null>;
	},
) {
	const { settings } = useSession();
	const editCache = useEditCache();
	const messages = useMessages();
	const { channelId } = useParams();
	const isOnline = usePresence((state) => state.isOnline);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const onUpdateMessage = useCallback(
		async (event: React.KeyboardEvent) => {
			if (event.key === "Enter" && !event.shiftKey && !event.repeat) {
				event.preventDefault();
				if ((editCache.cache.content?.trim().length as number) > 0) {
					editCache.clear();
					if (
						editCache.cache.content?.trim() ===
						messages.data[channelId as string]?.[props.index].content
					)
						return;
					const res = await fetch(
						`${import.meta.env.VITE_API_URL}/channels/${channelId as string}/messages/${props.id}`,
						{
							method: "PATCH",
							credentials: "include",
							body: JSON.stringify({
								content: editCache.cache.content?.trim(),
							}),
						},
					);
					const json = await res.json();
					if (res.status === 200) {
						messages.updateMessage(channelId as string, props.id, {
							content: json.content,
							updatedAt: json.updatedAt,
						});
					}
				}
			}
		},
		[
			editCache.cache,
			channelId,
			editCache.clear,
			messages.data[channelId as string]?.[props.index].content,
			messages.updateMessage,
			props.id,
			props.index,
		],
	);

	const Element: React.ElementType = props.isBare ? "li" : "div";

	return (
		<Element
			className={cn("w-[100%]", {
				[baseMessageStyle(props, props.isCompact, editCache)]: props.isBare,
			})}
			// @ts-expect-error
			ref={props.messageRef}
			data-message-id={props.id}
		>
			<div
				className={cn({
					"grid grid-cols-[42px_1fr] gap-[8px] items-start w-[100%]":
						!settings.compactMode,
					"flex items-start w-[100%] -ml-2": settings.compactMode,
				})}
			>
				<div
					className={cn("flex justify-start items-start", {
						"w-0": settings.compactMode,
					})}
				>
					{!props.isCompact ? (
						<UserProfile
							user={{
								...(props.author as User),
								status: isOnline(props.author.id as string)
									? (props.author.status as UserStatus)
									: "UNAVAILABLE",
							}}
							side="right"
						>
							<Avatar
								width="42px"
								height="auto"
								id={props.author.id as string}
								avatar={props.author.avatar}
								className={cn("mr-[8px] mt-0.5 transition-opacity", {
									"opacity-0":
										settings.compactMode && !settings.compactShowAvatars,
									"opacity-100":
										!settings.compactMode || settings.compactShowAvatars,
								})}
							/>
						</UserProfile>
					) : (
						<div className="w-[42px] h-auto min-h-[1em] opacity-0"></div>
					)}
				</div>

				<div className="w-full">
					{settings.compactMode ? (
						<div className="flex items-start w-full gap-1">
							<span className="text-xs opacity-50 text-right w-[40px] flex-shrink-0 pt-1.5">
								{dayjs(props.createdAt).format("HH:mm")}
							</span>

							{settings.compactShowAvatars && (
								<UserProfile
									user={{
										...(props.author as User),
										status: isOnline(props.author.id as string)
											? (props.author.status as UserStatus)
											: "UNAVAILABLE",
									}}
									side="right"
								>
									<div className="flex-shrink-0 mr-1">
										<Avatar
											width="20px"
											height="20px"
											id={props.author.id as string}
											avatar={props.author.avatar}
											className="rounded-full"
										/>
									</div>
								</UserProfile>
							)}

							<div className="min-w-0">
								<UserProfile
									user={{
										...(props.author as User),
										status: isOnline(props.author.id as string)
											? (props.author.status as UserStatus)
											: "UNAVAILABLE",
									}}
									side="right"
								>
									<span className="font-medium cursor-pointer hover:underline whitespace-nowrap leading-tight">
										{(props.author.nickname ?? props.author.username) ||
											"Unknown User"}
									</span>
								</UserProfile>
							</div>
							<div className="min-w-0">
								{!editCache.cache.isEditing ||
								editCache.cache.messageId !== props.id ? (
									<MessageWithInvites content={props.content} />
								) : (
									<div className="w-[100%] flex flex-col gap-1">
										<Input
											containerClass="flex mb-[10px] w-[98%] text-center justify-self-center self-center mt-auto"
											className="shadow-none border-[1px] border-[#D3D2C8] bg-[#fffefa]"
											textarea
											id={`text-input-${nanoid()}`}
											value={editCache.cache.content || ""}
											onChange={(e) => editCache.setContent(e.target.value)}
											onKeyDown={onUpdateMessage}
											innerRef={textareaRef}
										/>
										<small className="font-semibold flex flex-row">
											escape to&nbsp;
											<button
												className="cursor-pointer outline-none p-0"
												onClick={() => editCache.clear()}
												type="button"
											>
												cancel
											</button>
											, enter to save
										</small>
									</div>
								)}
								{props.updatedAt && (
									<small className="opacity-45 text-[12px]">(edited)</small>
								)}
							</div>
						</div>
					) : (
						<>
							{!props.isCompact && (
								<div className="flex items-center gap-1 w-full">
									<UserProfile
										user={{
											...(props.author as User),
											status: isOnline(props.author.id as string)
												? (props.author.status as UserStatus)
												: "UNAVAILABLE",
										}}
										side="right"
									>
										<span className="font-medium cursor-pointer hover:underline">
											{(props.author.nickname ?? props.author.username) ||
												"Unknown User"}
										</span>
									</UserProfile>
									<span className="text-[12px] dark:text-[#C2C2C2] dim:text-[#C2C2C2]">
										{formatDate(props.createdAt)}
									</span>
								</div>
							)}
							<div className="flex flex-col gap-1">
								{!editCache.cache.isEditing ||
								editCache.cache.messageId !== props.id ? (
									<MessageWithInvites content={props.content} />
								) : (
									<div className="w-[100%] flex flex-col gap-1">
										<Input
											containerClass="flex mb-[10px] w-[98%] text-center justify-self-center self-center mt-auto"
											className="shadow-none border-[1px] border-[#D3D2C8] bg-[#fffefa]"
											textarea
											id={`text-input-${nanoid()}`}
											value={editCache.cache.content || ""}
											onChange={(e) => editCache.setContent(e.target.value)}
											onKeyDown={onUpdateMessage}
											innerRef={textareaRef}
										/>
										<small className="font-semibold flex flex-row">
											escape to&nbsp;
											<button
												className="cursor-pointer outline-none p-0"
												onClick={() => editCache.clear()}
												type="button"
											>
												cancel
											</button>
											, enter to save
										</small>
									</div>
								)}
								{props.updatedAt && (
									<small className="opacity-45 text-[12px]">(edited)</small>
								)}
							</div>
						</>
					)}
				</div>
				{props.state === "FAILED" && (
					<div className="flex flex-row gap-[6px] mt-[6px] items-center">
						<FaExclamationCircle color="#EF4444" size="14px" />
						<p className="text-[#EF4444] text-[14px]">
							Failed to send this message.
						</p>
					</div>
				)}
			</div>
		</Element>
	);
}

export default function Message(props: MessageProps) {
	const messages = useMessages();
	const { settings } = useSession();
	const previous = messages.data[props.channelId]?.[props.index - 1];

	const isCompact =
		settings.compactMode ||
		(previous &&
			previous.author.id === props.author.id &&
			dayjs(props.createdAt).diff(previous.createdAt, "minutes") < 5);

	const editCache = useEditCache();
	const session = useSession();
	const ref = useRef<HTMLDivElement>(null);
	const toastManager = Toast.useToastManager();

	return props.state !== "SENT" ||
		(editCache.cache.isEditing && editCache.cache.messageId === props.id) ? (
		<BaseMessage {...props} isCompact={isCompact} isBare messageRef={ref} />
	) : (
		<ContextMenu.Root>
			<ContextMenu.Trigger
				className={baseMessageStyle(props, isCompact, editCache)}
				render={<li />}
			>
				<BaseMessage {...props} isCompact={isCompact} messageRef={ref} />
			</ContextMenu.Trigger>
			<ContextMenu.Portal>
				<ContextMenu.Positioner className="outline-none">
					<ContextMenu.Popup
						className={cn(
							"origin-[var(--transform-origin)] rounded-md bg-[canvas] py-1 text-gray-900 shadow-lg shadow-gray-200 outline-1 outline-gray-200 transition-[opacity] data-[ending-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300 dim:shadow-none dim:-outline-offset-1 dim:outline-gray-300",
							"dim:bg-black dark:bg-[#2C2B27] dark:text-white dim:text-white dark:shadow-none dark:-outline-offset-1 dark:outline-[#333333] dim:shadow-none dim:-outline-offset-1 dim:outline-[#2E2E2E]",
						)}
					>
						<ContextMenu.Item
							className="flex cursor-pointer py-2 pr-8 pl-4 text-sm leading-4 outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-[#f7e26b]"
							onClick={async () => {
								if (typeof navigator.clipboard === "undefined") {
									toastManager.add({
										title: "Error",
										description: "Clipboard is not supported without HTTPS.",
									});
									return;
								}
								await navigator.clipboard.writeText(props.content);
								navigator.vibrate([100, 50, 100]);
							}}
						>
							Copy Message
						</ContextMenu.Item>
						{session.currentUser?.id === props.author.id && (
							<>
								<ContextMenu.Item
									onClick={() => {
										editCache.set({
											isEditing: true,
											messageId: props.id,
											content: props.content,
										});
										ref.current?.scrollIntoView({
											behavior: "smooth",
											block: "nearest",
											inline: "nearest",
										});
									}}
									className="flex cursor-pointer py-2 pr-8 pl-4 text-sm leading-4 outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-[#f7e26b]"
								>
									Edit
								</ContextMenu.Item>
								<ContextMenu.Separator className="mx-4 my-1.5 h-px bg-gray-200 dim:bg-[#2E2E2E] dark:bg-[#2E2E2E]" />
								<ContextMenu.Item
									onClick={async () => {
										await fetch(
											`${import.meta.env.VITE_API_URL}/channels/${props.channelId}/messages/${props.id}`,
											{
												method: "DELETE",
												credentials: "include",
											},
										);
									}}
									className="flex text-[#eb4034] cursor-pointer py-2 pr-8 pl-4 text-sm leading-4 outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-white data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-[#eb4034]"
								>
									Delete
								</ContextMenu.Item>
							</>
						)}
					</ContextMenu.Popup>
				</ContextMenu.Positioner>
			</ContextMenu.Portal>
		</ContextMenu.Root>
	);
}
