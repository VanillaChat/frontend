import {Outlet, useNavigate, useParams} from "react-router-dom";
import ChannelSidebar from "@/components/App/servers/ChannelSidebar";
import GuildSidebar from "@/components/App/ServerSidebar";
import {useEffect} from "react";
import {useChannels} from "@/store/servers";

export default function AppGuildLayout() {
    const params = useParams();
    const navigate = useNavigate();
    const channels = useChannels();

    useEffect(() => {
        if (!params.channelId && channels.data[params.guildId!]?.length > 0) navigate(`/channels/${params.guildId}/${channels.data[params.guildId!]?.[0].id ?? ''}`, { replace: true });
    }, [params.channelId]);
  // const { memberId, channelId, guildId } = useParams();
  // const groups: Server[] = useSelector(
  //   (state: RootState) => state.groupsReducer.groups
  // );
  // const group = groups.find((x) => x.id === guildId);
  // const nav = useNavigate();

  // useEffect(() => {
  //   if (!group) nav("/app/guilds/@me");
  // }, [group]);
  //
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
        <main id="app" className="h-[100dvh] flex flex-row">
            <div className="flex shrink-0">
                <GuildSidebar />
                <ChannelSidebar />
            </div>
            <Outlet />
        </main>
    );
}
