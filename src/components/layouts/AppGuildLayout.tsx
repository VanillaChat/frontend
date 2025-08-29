import { useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import GuildSidebar from "@/components/App/ServerSidebar";
import ChannelSidebar from "@/components/App/servers/ChannelSidebar";
import { useChannels } from "@/store/servers";

export default function AppGuildLayout({ id }: { id: string }) {
	const params = useParams();
	const navigate = useNavigate();
	const channels = useChannels();

	useEffect(() => {
		if (
			!params.channelId &&
			channels.data[params.guildId as string]?.length > 0
		)
			navigate(
				`/channels/${params.guildId}/${channels.data[params.guildId as string]?.[0].id ?? ""}`,
				{ replace: true },
			);
	}, [
		params.channelId,
		channels.data[params.guildId as string]?.[0].id,
		channels.data[params.guildId as string]?.length,
		navigate,
		params.guildId,
	]);
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
		<main
			id={`app-${id}`}
			className="h-[100dvh] grid grid-cols-[72px_300px_1fr_auto] overflow-x-hidden"
			onContextMenu={(e) => e.preventDefault()}
		>
			<GuildSidebar />
			<ChannelSidebar />
			<Outlet />
		</main>
	);
}
