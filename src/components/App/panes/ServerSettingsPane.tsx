import { nanoid } from "nanoid";
import { useState } from "react";
import { useParams } from "react-router-dom";
import FullScreen from "@/components/UI/FullScreen";
import { Tab } from "@/components/UI/Tab";
import { useServers } from "@/store/servers";

export default function ServerSettingsPane() {
	const [currentTab, setCurrentTab] = useState<string>("overview");
	const { guildId } = useParams();
	const server = useServers((s) => s.get(guildId as string));

	if (!server) return null;

	return (
		<FullScreen ButtonElement={(props) => <></>}>
			<div className="h-[100%] w-[340px] py-10 px-3 flex flex-col gap-2 bg-[#F2F2F2] dark:bg-[#302F2B] dim:bg-[#000000]">
				<p className="font-bold">{server.name}</p>
				<Tab
					active={currentTab === "overview"}
					onClick={() => setCurrentTab("overview")}
				>
					Overview
				</Tab>
				<Tab
					active={currentTab === "roles"}
					onClick={() => setCurrentTab("roles")}
				>
					Roles
				</Tab>
				<Tab
					active={currentTab === "invites"}
					onClick={() => setCurrentTab("invites")}
				>
					Invites
				</Tab>
			</div>
			<div
				className="w-full ml-6 mr-11 my-10 flex flex-col gap-5 overflow-auto"
				style={{ scrollbarGutter: "stable both-edges" }}
			>
				<h1 className="font-bold text-[22px]">
					{currentTab
						?.split("-")
						.map((str) => str[0].toUpperCase() + str.slice(1).toLowerCase())
						.join(" ")}
				</h1>
				{currentTab === "overview" && (
					<div>
						<p>Overview</p>
						<p>Overview</p>
						<p>Overview</p>
					</div>
				)}
			</div>
		</FullScreen>
	);
}
