import React from "react";
import { InviteData } from "@/store/invites";
import Avatar from "@/components/UI/Avatar";
import cn from "@/utils/cn";

interface InviteEmbedProps {
  invite: InviteData;
  onClick?: () => void;
  isMember?: boolean;
}

const InviteEmbed: React.FC<InviteEmbedProps> = ({ invite, onClick, isMember = false }) => {
  return (
    <div 
      className="flex flex-col border rounded-md p-3 my-2 max-w-[400px] cursor-pointer bg-[#f0f0e8] dark:bg-[#49473f] dim:bg-[#282828] dim:hover:bg-[#282828] border-[#D3D2C8] dark:border-[#595851] dim:border-[#302F2A]"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-2">
        {invite.guild.icon ? (
          <img 
            src={invite.guild.icon} 
            alt={invite.guild.name} 
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#e0e0e0] dark:bg-[#464540] dim:bg-[#302F2A] flex items-center justify-center text-lg font-medium">
            {invite.guild.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h3 className="font-medium text-base">{invite.guild.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 dim:text-gray-400">
            {invite.guild.brief || "Join this server"}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 dim:text-gray-400">
        {invite.inviter && (
          <div className="flex items-center gap-1">
            <span>Invited by</span>
            <div className="flex items-center gap-1">
              <Avatar 
                width="16px" 
                height="16px" 
                id={invite.inviter.id} 
                avatar={invite.inviter.avatar || null} 
                className="rounded-full"
              />
              <span className="font-medium">{invite.inviter.username}</span>
            </div>
          </div>
        )}
      </div>
      
      <button 
        className={cn(
          "mt-3 py-1.5 px-3 rounded-md text-sm font-medium cursor-pointer",
          "bg-[#f0f0e8] hover:bg-[#e0e0d8] dark:bg-[#49473f] dark:hover:bg-[#5a584f] dim:bg-[#282828] dim:hover:bg-[#383838]",
          "border border-[#D3D2C8] dark:border-[#464540] dim:border-[#302F2A]",
          isMember && "bg-[#e0e0d8] dark:bg-[#5a584f] dim:bg-[#383838]"
        )}
      >
        {isMember ? "Open Server" : "Join Server"}
      </button>
    </div>
  );
};

export default InviteEmbed;