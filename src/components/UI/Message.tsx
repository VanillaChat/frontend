import React, {Dispatch, Fragment, SetStateAction, useCallback, useEffect, useRef} from "react";
import cn from "@/utils/cn";
import {User} from "@/types/User";
import {useEditCache, useMessages} from "@/store/messages";
import {FaExclamationCircle} from "react-icons/fa";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isTomorrow from "dayjs/plugin/isTomorrow";
import isYesterday from "dayjs/plugin/isYesterday";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import {ContextMenu} from "@base-ui-components/react";
import {useSession} from "@/store/session";
import Input from "@/components/UI/Input";
import {formatDate} from "@/utils/formatDate";
import {useParams} from "react-router-dom";
import Avatar from "@/components/UI/Avatar";
import UserProfile from "@/components/UI/extension/UserProfile";
import {usePresence} from "@/store/presence";
import MessageWithInvites from "@/components/UI/MessageWithInvites";

dayjs.extend(localizedFormat);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(isYesterday);
dayjs.extend(utc);


type MessageProps = {
    content: string;
    author: Partial<User>;
    createdAt: Date;
    state: 'SENT' | 'SENDING' | 'FAILED';
    updatedAt: Date | null;
    channelId: string;
    index: number;
    id: string;
    isProfileOpen: boolean;
    setIsProfileOpen: Dispatch<SetStateAction<boolean>>;
};

const baseMessageStyle = (props: MessageProps, isCompact: boolean, editCache: ReturnType<typeof useEditCache.getState>) => cn(
    "p-[0_16px] mt-[12px] opacity-100 flex rounded-r-[8px] text-[16px] w-[100%] justify-between hover:bg-[#d0d0d0] dark:hover:bg-[#49473f] dim:hover:bg-[#282828] group",
    {
        "opacity-[.5]": props.state === "SENDING",
        "mt-1": isCompact,
        "bg-[#d0d0d0] dark:bg-[#49473f] dim:bg-[#282828] pt-2": editCache.cache.isEditing && editCache.cache.messageId === props.id,
    }
)


function BaseMessage(props: MessageProps & { isCompact: boolean; isBare?: boolean; messageRef?: React.RefObject<HTMLDivElement | null> | React.RefObject<HTMLLIElement | null>; }) {
    const editCache = useEditCache();
    const messages = useMessages();
    const { channelId } = useParams();
    const isOnline = usePresence(state => state.isOnline);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const onUpdateMessage = useCallback(async (event: React.KeyboardEvent) => {
        if (event.key === "Enter" && !event.shiftKey && !event.repeat) {
            event.preventDefault();
            if (editCache.cache.content!.trim().length > 0) {
                editCache.clear();
                if (editCache.cache.content?.trim() === messages.data[channelId!]![props.index].content) return;
                const res = await fetch(`${import.meta.env.VITE_API_URL}/channels/${channelId!}/messages/${props.id}`, {
                    method: 'PATCH',
                    credentials: 'include',
                    body: JSON.stringify({
                        content: editCache.cache.content!.trim(),
                    }),
                });
                const json = await res.json();
                if (res.status === 200) {
                    messages.updateMessage(channelId!, props.id, {
                        content: json.content,
                        updatedAt: json.updatedAt,
                    });
                }
            }
        }
    }, [editCache.cache]);

    const Element: React.ElementType = props.isBare ? "li" : "div";

    return <Element
        className={cn(
            "w-[100%]",
            {
                [baseMessageStyle(props, props.isCompact, editCache)]: props.isBare
            }
        )}
        // @ts-expect-error
        ref={props.messageRef}
        data-message-id={props.id}
    >
        <div className="grid grid-cols-[42px_1fr] items-start gap-[8px] w-[100%]">
            <div className="flex justify-start items-start">
                {!props.isCompact ? (
                    <UserProfile user={{
                        ...props.author as User,
                        status: isOnline(props.author.id!) ? props.author.status! : "UNAVAILABLE"
                    }} side="right">
                        {
                            (isActive) => {
                                useEffect(() => {
                                    props.setIsProfileOpen(isActive);
                                }, [isActive]);
                                return <Avatar
                                    width="42px"
                                    height="auto"
                                    id={props.author.id!}
                                    avatar={props.author.avatar}
                                    className={cn(
                                        "mr-[8px] mt-0.5",
                                        {
                                            "[data-parent]:overflow-hidden": isActive
                                        }
                                    )}
                                />
                            }
                        }
                    </UserProfile>
                ) : (
                    <div className="w-[42px] h-auto min-h-[1em] opacity-0"></div>
                )}
            </div>
            
            <div className="flex flex-col justify-start items-start max-w-[100%] w-[100%]">
                    {!props.isCompact &&
                        <div>
                            <UserProfile user={{
                                ...props.author as User,
                                status: isOnline(props.author.id!) ? props.author.status! : "UNAVAILABLE"
                            }} side="right">
                                {
                                    (isActive) => {
                                        useEffect(() => {
                                            props.setIsProfileOpen(isActive);
                                        }, [isActive]);
                                        return <span className={cn(
                                            "font-medium cursor-pointer hover:underline",
                                            {
                                                "underline": isActive
                                            }
                                        )}>{(props.author.nickname ?? props.author.username) || "Unknown User"}</span>
                                    }
                                }
                            </UserProfile>
                            <span className="text-[12px] ml-[5px] dark:text-[#C2C2C2] dim:text-[#C2C2C2]">
                    {formatDate(props.createdAt)}
                  </span>
                        </div>
                    }
                {
                    (!editCache.cache.isEditing || editCache.cache.messageId !== props.id) &&
                    <div className="flex flex-col gap-1">
                        <MessageWithInvites content={props.content} />
                        {props.updatedAt && <small className="opacity-45 text-[12px]">(edited)</small>}
                    </div>
                }
                {
                    editCache.cache.isEditing &&
                    editCache.cache.messageId === props.id &&
                    <div className="w-[100%] flex flex-col gap-1">
                        <Input
                            containerClass="flex mb-[10px] w-[98%] text-center justify-self-center self-center mt-auto"
                            className="shadow-none border-[1px] border-[#D3D2C8] bg-[#fffefa]"
                            textarea
                            id="text-input"
                            value={editCache.cache.content || ''}
                            onChange={(e) => editCache.setContent(e.target.value)}
                            onKeyDown={onUpdateMessage}
                            innerRef={textareaRef}
                        />
                        <small className="font-semibold flex flex-row">
                            escape to&nbsp;<p className="cursor-pointer" onClick={() => editCache.clear()}>cancel</p>, enter to save
                        </small>
                    </div>
                }
                {props.state === 'FAILED' && (
                    <div className="flex flex-row gap-[6px] mt-[6px] items-center">
                        <FaExclamationCircle color="#EF4444" size="14px" />
                        <p className="text-[#EF4444] text-[14px]">Failed to send this message.</p>
                    </div>
                )}
            </div>
        </div>
    </Element>
}

export default function Message(props: MessageProps) {
    const messages = useMessages();
    const previous = messages.data[props.channelId]?.[props.index - 1];
    const isCompact = (
        previous &&
        previous.author.id === props.author.id &&
        dayjs(props.createdAt).diff(previous.createdAt, 'minutes') < 5
    ) || false;
    
    const editCache = useEditCache();
    const session = useSession();
    const ref = useRef<HTMLDivElement>(null);

    return (props.state !== "SENT" || editCache.cache.isEditing && editCache.cache.messageId === props.id) ?
        <BaseMessage {...props} isCompact={isCompact} isBare messageRef={ref} />
        : <ContextMenu.Root>
            <ContextMenu.Trigger className={baseMessageStyle(props, isCompact, editCache)} render={<li />}>
                <BaseMessage {...props} isCompact={isCompact} messageRef={ref} />
            </ContextMenu.Trigger>
            <ContextMenu.Portal>
                <ContextMenu.Positioner className="outline-none">
                    <ContextMenu.Popup className={cn(
                        "origin-[var(--transform-origin)] rounded-md bg-[canvas] py-1 text-gray-900 shadow-lg shadow-gray-200 outline-1 outline-gray-200 transition-[opacity] data-[ending-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300 dim:shadow-none dim:-outline-offset-1 dim:outline-gray-300",
                        "dim:bg-black dark:bg-[#2C2B27] dark:text-white dim:text-white dark:shadow-none dark:-outline-offset-1 dark:outline-[#333333] dim:shadow-none dim:-outline-offset-1 dim:outline-[#2E2E2E]"
                    )}>
                        <ContextMenu.Item
                            className="flex cursor-pointer py-2 pr-8 pl-4 text-sm leading-4 outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-gray-50 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-gray-900 dim:data-[highlighted]:before:bg-[#2E2E2E] dark:data-[highlighted]:before:bg-[#454545]"
                            onClick={async () => {
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
                                            content: props.content
                                        });
                                        ref.current?.scrollIntoView({
                                            behavior: "smooth",
                                            block: "nearest",
                                            inline: "nearest"
                                        });
                                    }}
                                    className="flex cursor-pointer py-2 pr-8 pl-4 text-sm leading-4 outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-gray-50 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-gray-900 dim:data-[highlighted]:before:bg-[#2E2E2E] dark:data-[highlighted]:before:bg-[#454545]"
                                >
                                    Edit
                                </ContextMenu.Item>
                                <ContextMenu.Separator className="mx-4 my-1.5 h-px bg-gray-200 dim:bg-[#2E2E2E] dark:bg-[#2E2E2E]" />
                                <ContextMenu.Item
                                    onClick={async () => {
                                        await fetch(`${import.meta.env.VITE_API_URL}/channels/${props.channelId}/messages/${props.id}`, {
                                            method: 'DELETE',
                                            credentials: 'include',
                                        });
                                    }}
                                    className="flex text-[#ff0000] cursor-pointer py-2 pr-8 pl-4 text-sm leading-4 outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-white data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-[#ff0000]"
                                >
                                    Delete
                                </ContextMenu.Item>
                            </>
                        )}
                    </ContextMenu.Popup>
                </ContextMenu.Positioner>
            </ContextMenu.Portal>
        </ContextMenu.Root>
}