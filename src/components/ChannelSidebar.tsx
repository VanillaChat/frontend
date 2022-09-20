import React from "react";
import { useLocation } from "react-router-dom";
import Input from "./Input";
import ChannelLink from "./ChannelLink";
import Users from "../icons/users.svg";

const ChannelSidebar: React.FC = () => {
  const loc = useLocation();
  return loc.pathname.includes("@me") ? (
    <div className="channel-list">
      <Input
        id="searchInput"
        className="search"
        placeholder="Search for DMs..."
        style={{
          width: "100%",
          height: "36px",
          borderRadius: "8px",
          boxSizing: "border-box",
          backgroundColor: "#fff",
          borderWidth: "1px",
        }}
      />
      <ChannelLink style={{ marginTop: "10px" }} name="Friends" icon={Users} />
      <p className="dm-text">Direct Messages</p>
      <ChannelLink
        name="John Doe"
        closeable
        to="/app/@me/32423423423423423423"
        isAvatar
        icon="https://images-ext-1.discordapp.net/external/0QLygAtLnAXxLi8QwAKKaITlwScoj9FSmeptfnZPr90/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/309427040908476416/d9a7ba1ae138602aa47262dbb3023b83.png?width=632&height=632"
      />
      <ChannelLink
        name="John Doe"
        customStatus="Hello World!"
        closeable
        to="/app/@me/32423423423423423423"
        isAvatar
        icon="https://images-ext-1.discordapp.net/external/0QLygAtLnAXxLi8QwAKKaITlwScoj9FSmeptfnZPr90/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/309427040908476416/d9a7ba1ae138602aa47262dbb3023b83.png?width=632&height=632"
      />
    </div>
  ) : (
    <div className="channel-list">
      <p>yes</p>
    </div>
  );
};
export default ChannelSidebar;
