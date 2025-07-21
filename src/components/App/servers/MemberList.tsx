import React, {useMemo, useRef} from "react";
import {useMembers} from "@/store/servers";
import {useParams} from "react-router-dom";
import {useVirtualizer} from "@tanstack/react-virtual";
import {usePresence, UserStatus} from "@/store/presence";

type UserItemProps = {
    username: string;
    userId: string;
    status: UserStatus;
}

const UserItem: React.FC<UserItemProps> = (props: UserItemProps) => {
    return <div className="flex flex-row items-center gap-[10px] font-medium">
        <img
            width="35px"
            height="35px"
            src={`${import.meta.env.VITE_API_URL}/cdn/embed/avatars/${(BigInt(props.userId) >> 22n) % 6n}.png`}
            alt="user avatar"
            style={{
                padding: "1px",
                border: "2px solid " + {
                    UNAVAILABLE: "transparent",
                    ONLINE: "#35a635",
                    LOOKING_TO_PLAY: "purple",
                    DND: "red",
                    IDLE: "yellow"
                }[props.status],
                filter: props.status === "UNAVAILABLE" ? "grayscale(100%)" : "grayscale(0%)",
                borderRadius: '100%'
            }}
        />
        <p>{props.username}</p>
    </div>
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
        <div className="bg-[#f2f2f2] w-[500px] p-[5px_15px] dark:bg-[#2C2B27] dim:bg-[#070707]">
            <div ref={parentRef} className="overflow-auto h-[100%]">
                <div
                    className={`flex flex-col gap-[10px] w-[100%] relative`}
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
                                return <UserItem key={item.index} username={user.username} userId={user.id} status={user.status} />
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
                                return <UserItem key={item.index} username={user.username} userId={user.id} status="UNAVAILABLE" />
                            })
                    }
                </div>
            </div>
        </div>
    );
};
export default MemberList;
