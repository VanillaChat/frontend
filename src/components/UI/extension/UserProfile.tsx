import {Popover} from "@base-ui-components/react/popover";
import * as React from "react";
import {ReactNode, useState} from "react";
import {ArrowSvg} from "@/components/UI/Navbar";
import cn from "@/utils/cn";
import {User} from "@/types/User";
import dayjs from "dayjs";
import Avatar from "@/components/UI/Avatar";
import logo from "@/icons/squarelogo.png";
import {ServerMember} from "@/types/Server";

export type UserProfileProps = {
    children: (isActive: boolean) => ReactNode;
    user: User;
    member?: ServerMember;
    side: "left" | "right"
}

export default function UserProfile(props: UserProfileProps) {
    const [isActive, setIsActive] = useState(false);

    return <Popover.Root open={isActive} onOpenChange={setIsActive}>
        <Popover.Trigger className="cursor-pointer">
            {props.children(isActive)}
        </Popover.Trigger>
        <Popover.Portal>
            <Popover.Positioner sideOffset={8} side={props.side}>
                <Popover.Popup
                    className={cn(
                        "origin-[var(--transform-origin)] w-[350px] h-fit rounded-lg bg-[canvas] text-gray-900 shadow-lg shadow-gray-200 outline-1 outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0",
                        "dim:bg-black dark:bg-[#262622] dark:text-white dim:text-white dark:shadow-none dark:-outline-offset-1 dark:outline-[#333333] dim:shadow-none dim:-outline-offset-1 dim:outline-[#2A2A2A]"
                    )}
                >
                    <Popover.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                        <ArrowSvg />
                    </Popover.Arrow>
                    <div className="w-[100%] h-[500px] rounded-lg p-1">
                        <div className="w-[100%] h-[130px] rounded-t-lg bg-[#363636]">
                            <div className="border-white bg-white dark:border-[#262622] dark:bg-[#262622] dim:border-black dim:bg-black border-[2px] translate-y-[80px] translate-x-[15px] w-fit rounded-[100%]">
                                <Avatar
                                    width="80px"
                                    height="80px"
                                    id={props.user.id!}
                                    avatar={props.user.avatar}
                                    className="p-0.5"
                                    style={{
                                        border: `${props.user.status === "UNAVAILABLE" ? "0" : "4"}px solid ` + {
                                            UNAVAILABLE: "transparent",
                                            ONLINE: "#32a852",
                                            LOOKING_TO_PLAY: "#4287f5",
                                            DND: "#eb4034",
                                            IDLE: "#fcba03"
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
                                        src={logo}
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
                        </div>
                    </div>
                </Popover.Popup>
            </Popover.Positioner>
        </Popover.Portal>
    </Popover.Root>
}