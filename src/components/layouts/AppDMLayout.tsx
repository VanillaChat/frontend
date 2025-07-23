import {Outlet, useParams,} from "react-router-dom";
import MeSidebar from "@/components/App/me/MeSidebar";
import GuildSidebar from "@/components/App/ServerSidebar";
import {useMessages} from "@/store/messages";
import {useEffect} from "react";

export default function AppDMLayout() {
    const messages = useMessages();
    const { channelId } = useParams();

    useEffect(() => {
        messages.setMessages(channelId!, []);
        messages.setContent(channelId!, '');
    }, []);

    // useMeta(
    //   location.pathname.endsWith("@me")
    //     ? "Friends"
    //     : memberId
    //     ? `User @${memberId}`
    //     : guildId
    //     ? `${group?.name} ${guildId} #${channelId}`
    //     : "unknown"
    // );

    return (
        <main id="app" className="h-[100dvh] dark:!bg-[#262622] dim:!bg-[#141413] flex flex-row" onContextMenu={(e) => e.preventDefault()}>
            <div className="flex shrink-0">
                <GuildSidebar />
                <MeSidebar />
            </div>
            <Outlet />
        </main>
    );
}
