import React, {useCallback, useRef} from "react";
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
import Markdown from "react-markdown";
import {Highlight, themes} from "prism-react-renderer";
import {useTheme} from "@/context/ThemeProvider";

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
};

const baseMessageStyle = (props: MessageProps, isCompact: boolean, editCache: ReturnType<typeof useEditCache.getState>) => cn(
    "p-[0_16px] mt-[12px] opacity-100 flex rounded-r-[8px] text-[16px] w-[100%] justify-between hover:bg-[#d0d0d0] dark:hover:bg-[#49473f] dim:hover:bg-[#282828] group",
    {
        "opacity-[.5]": props.state === "SENDING",
        "px-[74px] mt-1": isCompact,
        "bg-[#d0d0d0] dark:bg-[#49473f] dim:bg-[#282828] pt-2": editCache.cache.isEditing && editCache.cache.messageId === props.id,
    }
)

function BaseMessage(props: MessageProps & { isCompact: boolean; isBare?: boolean; messageRef?: React.RefObject<HTMLDivElement | null>; }) {
    const editCache = useEditCache();
    const messages = useMessages();
    const { channelId } = useParams();
    const { theme } = useTheme();

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

    return <div className={cn(
        "w-[100%]",
        {
            [baseMessageStyle(props, props.isCompact, editCache)]: props.isBare
        }
    )}
                ref={props.messageRef}
                data-message-id={props.id}
    >
        <div className="flex flex-row items-start gap-[8px] w-[100%]">
            {!props.isCompact && <Avatar width="42px" height="42px" id={props.author.id!} avatar={props.author.avatar} className="mr-[8px]" />}
            <div className="flex flex-col justify-center items-start max-w-[100%] w-[100%]">
                <div>
                    {!props.isCompact &&
                        <>
                            <span className="font-medium">{(props.author.nickname ?? props.author.username) || "Unknown User"}</span>
                            <span className="text-[12px] ml-[5px] dark:text-[#C2C2C2] dim:text-[#C2C2C2]">
                    {formatDate(props.createdAt)}
                  </span>
                        </>
                    }
                </div>
                {
                    (!editCache.cache.isEditing || editCache.cache.messageId !== props.id) &&
                    <div className="flex flex-col items-center justify-center gap-1">
                        {/*<p className={cn(*/}
                        {/*    "text-[14px] !select-text m-0 whitespace-pre-line wrap-break-word max-w-[100%] break-all dark:text-[#C2C2C2] dim:text-[#C2C2C2]",*/}
                        {/*    {*/}
                        {/*        "text-[#EF4444] dark:text-[#EF4444] dim:text-[#EF4444]": props.state === "FAILED"*/}
                        {/*    }*/}
                        {/*)}>{props.content}</p>*/}
                        <Markdown
                            components={{
                                strong: ({children, ...rest}) => <strong className="pointer-events-auto !select-text" {...rest}>{children}</strong>,
                                p: ({children, ...rest}) => <p className="pointer-events-auto !select-text" {...rest}>{children}</p>,
                                h1: ({children, ...rest}) => <h1 className="pointer-events-auto !select-text text-[32px] font-bold" {...rest}>{children}</h1>,
                                h2: ({children, ...rest}) => <h2 className="pointer-events-auto !select-text text-[24px] font-bold" {...rest}>{children}</h2>,
                                h3: ({children, ...rest}) => <h3 className="pointer-events-auto !select-text text-[16px] font-bold" {...rest}>{children}</h3>,
                                code({children, className, node, ...rest}) {
                                    const match = /language-(\w+)/.exec(className || '')
                                    return match ? (
                                        <Highlight language={match[1]} code={children!.toString()} theme={theme === "light" ? themes.oneLight : themes.oneDark}>
                                            {({ style, tokens, getLineProps, getTokenProps }) => (
                                                <pre className="border-[#f2f2f2] rounded-[10px] p-2" style={{...style, userSelect: 'text', pointerEvents: 'all'}}>
                                                    {tokens.map((line, i) => {
                                                        if (i + 1 !== tokens.length) return <div key={i} style={{userSelect: 'text', pointerEvents: 'all'}} {...getLineProps({ line })}>
                                                            {line.map((token, key) => (
                                                                <span key={key} {...getTokenProps({ token })} style={{userSelect: 'text', pointerEvents: 'all', ...getTokenProps({token}).style}} />
                                                            ))}
                                                        </div>
                                                    })}
                                                </pre>
                                            )}
                                        </Highlight>
                                    ) : (
                                        <code {...rest} className={className}>
                                            {children}
                                        </code>
                                    )
                                }
                            }}
                        >
                            {props.content}
                        </Markdown>
                        {props.updatedAt && <small className="opacity-45 text-[12px]">(edited)</small>}
                    </div>
                }
                {
                    editCache.cache.isEditing &&
                    editCache.cache.messageId === props.id &&
                    <div className="w-[100%] flex flex-col gap-1">
                        <Input
                            containerClass="flex mb-[10px] w-[98%] h-[45px] text-center justify-self-center self-center mt-auto [&>input]:resize-none [&>input>:shadow-none"
                            className="resize-none shadow-none border-[1px] border-[#D3D2C8] bg-[#fffefa]"
                            textarea
                            id="text-input"
                            value={editCache.cache.content || ''}
                            onChange={(e) => editCache.setContent(e.target.value)}
                            onKeyDown={onUpdateMessage}
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
        {/*<div className="hidden flex-row h-fit p-[8px_12px] bg-[#fff] border-[1px] border-[#e0e0e0] rounded-[8px] shadow-message translate-x-[22px] translate-y-[-32px] group-hover:flex">*/}
        {/*  <p style={{ margin: 0 }}>action</p>*/}
        {/*</div>*/}
    </div>
}

export default function Message(props: MessageProps) {
    const messages = useMessages();
    const previous = messages.data[props.channelId]?.[props.index - 1];
    const isCompact = (
        previous &&
        previous.author.id === props.author.id &&
        dayjs(previous.createdAt).diff(props.createdAt, 'minutes') < 5
    ) || false;

    console.log(isCompact);
    console.log(previous?.createdAt);
    console.log(props.createdAt);
    console.log(dayjs(previous?.createdAt).diff(props.createdAt, 'minutes'));

    const editCache = useEditCache();
    const session = useSession();
    const ref = useRef<HTMLDivElement>(null);

    return (props.state !== "SENT" || editCache.cache.isEditing && editCache.cache.messageId === props.id) ?
        <BaseMessage {...props} isCompact={isCompact} isBare messageRef={ref} />
        : <ContextMenu.Root>
            <ContextMenu.Trigger className={baseMessageStyle(props, isCompact, editCache)}>
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