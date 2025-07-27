import {Popover} from "@base-ui-components/react/popover";
import * as React from "react";
import {ReactNode} from "react";
import {ArrowSvg} from "@/components/UI/Navbar";
import cn from "@/utils/cn";
import {User} from "@/types/User";
import dayjs from "dayjs";
import Avatar from "@/components/UI/Avatar";
import {Select} from "@base-ui-components/react/select";
import {ws} from "@/utils/websocket/handlers";
import {usePresence, UserStatus} from "@/store/presence";
import {useSession} from "@/store/session";
import {useMembers} from "@/store/servers";

export type UserProfileSmallProps = {
    children: ReactNode;
    user: User;
}

const statuses = [
    { 
        label: 'Online', 
        value: 'ONLINE',
        color: "#32a852"
    },
    { 
        label: 'Idle', 
        value: 'IDLE',
        color: "#fcba03"
    },
    { 
        label: 'Do Not Disturb', 
        value: 'DND',
        color: "#eb4034"
    },
    { 
        label: 'Looking to Play', 
        value: 'LOOKING_TO_PLAY',
        color: "#4287f5"
    },
    { 
        label: 'Unavailable', 
        value: 'UNAVAILABLE',
        color: "gray"
    },
];

export default function CurrentUserProfile(props: UserProfileSmallProps) {
    const presence = usePresence();
    const session = useSession();
    const members = useMembers();

    return <Popover.Root>
        <Popover.Trigger className="cursor-pointer">
            {props.children}
        </Popover.Trigger>
        <Popover.Portal>
            <Popover.Positioner sideOffset={8} side="right">
                <Popover.Popup
                    className={cn(
                        "origin-[var(--transform-origin)] w-[350px] h-fit rounded-lg bg-[canvas] text-gray-900 shadow-lg shadow-gray-200 outline-1 outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0",
                        "dim:bg-black dark:bg-[#262622] dark:text-white dim:text-white dark:shadow-none dark:-outline-offset-1 dark:outline-[#333333] dim:shadow-none dim:-outline-offset-1 dim:outline-[#2A2A2A]"
                    )}
                >
                    <Popover.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                        <ArrowSvg />
                    </Popover.Arrow>
                    <div className="w-[100%] h-[500px] rounded-lg">
                        <div className="w-[100%] h-[130px] rounded-t-lg bg-[#363636]">
                            <div className="border-white bg-white dark:border-[#262622] dark:bg-[#262622] dim:border-black dim:bg-black border-[2px] translate-y-[80px] translate-x-[15px] w-fit rounded-[100%]">
                                <Avatar
                                    width="80px"
                                    height="80px"
                                    id={props.user.id!}
                                    avatar={props.user.avatar}
                                    className="p-0.5"
                                    style={{
                                        border: "4px solid " + {
                                            UNAVAILABLE: "transparent",
                                            ONLINE: statuses[0].color,
                                            LOOKING_TO_PLAY: statuses[3].color,
                                            DND: statuses[2].color,
                                            IDLE: statuses[1].color
                                        }[props.user.status],
                                    }}
                                />
                            </div>
                        </div>
                        <div className="px-5 flex flex-col mt-[30px] h-[calc(100%-160px)]">
                            <div className="flex flex-row gap-1 items-center">
                                <h1 className="font-bold text-[20px]">{props.user.username}</h1>
                                <h1 className="text-[26px]">/</h1>
                                <h1 className="text-[18px] font-semibold opacity-80">{props.user.tag}</h1>
                            </div>
                            <div className="flex flex-col gap-1 mt-[10px]">
                                <h1 className="font-semibold text-[14px]">Joined At</h1>
                                <p className="flex flex-row gap-2 font-semibold items-center">
                                    <img
                                        src="/src/icons/squarelogo.png"
                                        className="w-[24px] h-[24px] rounded-[8px]"
                                        alt="logo"
                                    />
                                    <span className="text-[14px]">{dayjs(props.user.createdAt).format("MMMM D, YYYY").toString()}</span>
                                </p>
                            </div>
                            {
                                props.user.bio && (
                                    <div className="flex flex-col mt-[15px]">
                                        <h1 className="font-semibold text-[14px]">Bio</h1>
                                        <p className="text-[14px] items-center">
                                            {props.user.bio}
                                        </p>
                                    </div>
                                )
                            }
                            <div className="flex flex-col gap-1 justify-end h-[100%] mb-4">
                                <p className="font-medium">Status</p>
                                <Select.Root items={statuses} value={props.user.status} onValueChange={(value) => {
                                    if (value === props.user.status) return;
                                    ws.send(JSON.stringify({
                                        op: 3,
                                        d: {
                                            status: value
                                        }
                                    }));
                                    presence.setPresence(props.user.id, value as UserStatus);
                                    session.updateCurrentUser({
                                        status: value as UserStatus
                                    });
                                    Object.entries(members.data).forEach(([guildId, guildMembers]) => {
                                        guildMembers.forEach(member => {
                                            members.updateMember(guildId, {
                                               ...member,
                                               user: {
                                                   ...member.user,
                                                   status: value as UserStatus
                                               }
                                            });
                                        });
                                    });
                                }}>
                                    <Select.Trigger className="flex h-10 min-w-36 items-center justify-between gap-3 rounded-md border border-gray-200 pr-3 pl-3.5 text-base text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100 data-[popup-open]:bg-gray-100">

                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{
                                                    backgroundColor: statuses.find(f => f.value === props.user.status)?.color || 'gray'
                                                }}
                                            />
                                            <Select.Value/>
                                        </div>
                                        <Select.Icon className="flex">
                                            <ChevronUpDownIcon />
                                        </Select.Icon>
                                    </Select.Trigger>
                                    <Select.Portal>
                                        <Select.Positioner className="outline-none" sideOffset={8}>
                                            <Select.ScrollUpArrow className="top-0 z-[1] flex h-4 w-full cursor-default items-center justify-center rounded-md bg-[canvas] text-center text-xs before:absolute before:top-[-100%] before:left-0 before:h-full before:w-full before:content-[''] data-[direction=down]:bottom-0 data-[direction=down]:before:bottom-[-100%]" />
                                            <Select.Popup className="group max-h-[var(--available-height)] origin-[var(--transform-origin)] overflow-y-auto rounded-md bg-[canvas] py-1 text-gray-900 shadow-lg shadow-gray-200 outline-1 outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[ending-style]:transition-none data-[starting-style]:scale-90 data-[starting-style]:opacity-0 data-[side=none]:data-[starting-style]:scale-100 data-[side=none]:data-[starting-style]:opacity-100 data-[side=none]:data-[starting-style]:transition-none dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
                                                {statuses.map(({ label, value, color }) => (
                                                    <Select.Item
                                                        key={label}
                                                        value={value}
                                                        className="min-w-[var(--anchor-width)] cursor-default items-center flex flex-row justify-between gap-2 py-2 px-4 text-sm leading-4 outline-none select-none group-data-[side=none]:min-w-[calc(var(--anchor-width)+1rem)] group-data-[side=none]:pr-12 group-data-[side=none]:text-base group-data-[side=none]:leading-4 data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-[#f7e26b]"
                                                    >
                                                        <Select.ItemText className="flex flex-row items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{
                                                                    backgroundColor: color || 'gray'
                                                                }}
                                                            />
                                                            {label}
                                                        </Select.ItemText>
                                                        <Select.ItemIndicator className="">
                                                            <CheckIcon className="size-3" />
                                                        </Select.ItemIndicator>
                                                    </Select.Item>
                                                ))}
                                            </Select.Popup>
                                            <Select.ScrollDownArrow className="bottom-0 z-[1] flex h-4 w-full cursor-default items-center justify-center rounded-md bg-[canvas] text-center text-xs before:absolute before:top-[-100%] before:left-0 before:h-full before:w-full before:content-[''] data-[direction=down]:bottom-0 data-[direction=down]:before:bottom-[-100%]" />
                                        </Select.Positioner>
                                    </Select.Portal>
                                </Select.Root>
                            </div>
                        </div>
                    </div>
                </Popover.Popup>
            </Popover.Positioner>
        </Popover.Portal>
    </Popover.Root>
}


function ChevronUpDownIcon(props: React.ComponentProps<'svg'>) {
    return (
        <svg
            width="8"
            height="12"
            viewBox="0 0 8 12"
            fill="none"
            stroke="currentcolor"
            strokeWidth="1.5"
            {...props}
        >
            <path d="M0.5 4.5L4 1.5L7.5 4.5" />
            <path d="M0.5 7.5L4 10.5L7.5 7.5" />
        </svg>
    );
}

function CheckIcon(props: React.ComponentProps<'svg'>) {
    return (
        <svg fill="currentcolor" width="10" height="10" viewBox="0 0 10 10" {...props}>
            <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
        </svg>
    );
}