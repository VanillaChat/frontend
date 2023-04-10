import "../styles/Sidebar.css";
import GuildSidebar from "./SpaceSidebar";
import ChannelSidebar from "./ChannelSidebar";

export default function Sidebar() {
  return (
    <div className="sidebar-flex">
      <GuildSidebar />
      <ChannelSidebar />
    </div>
  );
}
