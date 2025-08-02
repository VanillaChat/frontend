import React, {useMemo, useRef} from "react";
import {useMembers} from "@/store/servers";
import {useParams} from "react-router-dom";
import {useVirtualizer} from "@tanstack/react-virtual";
import {usePresence} from "@/store/presence";
import Avatar from "@/components/UI/Avatar";
import UserProfile from "@/components/UI/extension/UserProfile";
import {User} from "@/types/User";
import cn from "@/utils/cn";

const UserItem: React.FC<User> = (props: User) => {
    return <UserProfile user={props} side="right">
        {/*<div className="flex flex-row items-center gap-[10px] font-medium hover:bg-white px-2 py-1">*/}
        {(isActive) => (
            <div className={cn(
                "no-underline text-black dark:text-white dim:text-white gap-2 bg-transparent border-[1px] border-transparent p-[4px_8px] flex rounded-[8px] text-[16px] ease-in-out text-center items-center group",
                {
                    "hover:bg-white hover:border-[1px] hover:border-[#e0e0e0] dark:hover:bg-[#4D4A3D] dark:hover:border-[#4D4A3D] dim:hover:bg-[#171717] dim:hover:border-[#1C1C1C]": !isActive,
                    "bg-white border-[1px] border-[#e0e0e0] dark:bg-[#4D4A3D] dark:border-[#4D4A3D] dim:bg-[#171717] dim:border-[#1C1C1C] active": isActive
                }
            )}>
                <Avatar
                    width="35px"
                    height="35px"
                    className="rounded-[100%] p-[1px]"
                    style={{
                        border: `${props.status === "UNAVAILABLE" ? "0" : "3"}px solid ` + {
                            UNAVAILABLE: "transparent",
                            ONLINE: "#32a852",
                            LOOKING_TO_PLAY: "#4287f5",
                            DND: "#eb4034",
                            IDLE: "#fcba03"
                        }[props.status],
                        filter: props.status === "UNAVAILABLE" ? "grayscale(100%)" : "grayscale(0%)",
                    }}
                    id={props.id}
                    avatar={props.avatar}
                />
                <p>{props.username}</p>
            </div>
        )}
    </UserProfile>
}

const MemberList: React.FC = () => {
    const { guildId } = useParams();
    const members = useMembers();
    const parentRef = useRef<HTMLDivElement>(null);
    const rowVirtualizer = useVirtualizer({
        count: members.data[guildId!]?.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 60
    });
    const presences = usePresence(state => state.presences);
    const isOnline = usePresence(state => state.isOnline);

    const online = useMemo(() =>
            members.data[guildId!]?.filter(member => isOnline(member.user.id)) || [],
        [members.data[guildId!], presences]
    );

    const offline = useMemo(() =>
            members.data[guildId!]?.filter(member => !isOnline(member.user.id)) || [],
        [members.data[guildId!], presences]
    );

    return (
        <div className="bg-[#f2f2f2] w-[280px] p-[5px_8px] dark:bg-[#2C2B27] dim:bg-[#070707]">
            <div ref={parentRef} className="overflow-auto h-[100%]">
                <div
                    className="flex flex-col gap-[8px] w-[100%] relative"
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`
                    }}
                >
                    {online.length > 0 && <p className="font-medium">{online.length} online</p>}
                    {
                        rowVirtualizer.getVirtualItems()
                            .filter(item => isOnline(members.data[guildId!][item.index].user.id))
                            .sort((item1, item2) => {
                                const user1 = members.data[guildId!][item1.index].user;
                                const user2 = members.data[guildId!][item2.index].user;
                                return user1.username.localeCompare(user2.username);
                            })
                            .map(item => {
                                const user = members.data[guildId!][item.index].user;
                                return <UserItem key={item.index} {...user} />
                            })
                    }

                    {offline.length > 0 && <p className="font-medium">{offline.length} offline</p>}
                    {
                        rowVirtualizer.getVirtualItems()
                            .filter(item => !isOnline(members.data[guildId!][item.index].user.id))
                            .sort((item1, item2) => {
                                const user1 = members.data[guildId!][item1.index].user;
                                const user2 = members.data[guildId!][item2.index].user;
                                return user1.username.localeCompare(user2.username);
                            })
                            .map(item => {
                                const user = members.data[guildId!][item.index].user;
                                return <UserItem key={item.index} {...user} status="UNAVAILABLE" />
                            })
                    }
                </div>
            </div>
        </div>
    );
};
export default MemberList;
