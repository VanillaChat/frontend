import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { processMessageContent } from "@/utils/inviteUtils";
import { useInvites, InviteData } from "@/store/invites";
import InviteEmbed from "@/components/UI/InviteEmbed";
import { MarkdownRenderer } from "@/components/UI/MarkdownRenderer";

interface MessageWithInvitesProps {
  content: string;
}

const MessageWithInvites: React.FC<MessageWithInvitesProps> = ({ content }) => {
  const [processedContent, setProcessedContent] = useState(content);
  const [inviteCodes, setInviteCodes] = useState<string[]>([]);
  const [inviteData, setInviteData] = useState<Record<string, InviteData>>({});
  const [memberStatus, setMemberStatus] = useState<Record<string, boolean>>({});
  const invites = useInvites();
  const navigate = useNavigate();

  useEffect(() => {
    const { processedContent, inviteCodes } = processMessageContent(content);
    setProcessedContent(processedContent);
    setInviteCodes(inviteCodes);
  }, [content]);

  const checkMembership = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/invites/${code}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 409) {
        const data = await response.json();
        return data.code === 'ALREADY_A_MEMBER';
      }
      
      return false;
    } catch (error) {
      console.error('Error checking membership:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchInvites = async () => {
      const inviteDataMap: Record<string, InviteData> = {};
      const memberStatusMap: Record<string, boolean> = {};
      
      for (const code of inviteCodes) {
        if (invites.hasInvite(code)) {
          const data = invites.getInvite(code);
          if (data) {
            inviteDataMap[code] = data;
            memberStatusMap[code] = await checkMembership(code);
          }
        } else {
          const data = await invites.fetchInvite(code);
          if (data) {
            inviteDataMap[code] = data;
            memberStatusMap[code] = await checkMembership(code);
          }
        }
      }
      
      setInviteData(inviteDataMap);
      setMemberStatus(memberStatusMap);
    };
    
    if (inviteCodes.length > 0) {
      fetchInvites();
    }
  }, [inviteCodes, invites]);

  const handleJoinServer = async (code: string) => {
    if (memberStatus[code]) {
      const invite = inviteData[code];
      if (invite) {
        navigate(`/channels/${invite.guildId}/${invite.channel.id}`);
        return;
      }
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/invites/${code}`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        navigate(`/channels/${data.guild.id}/${data.guild.channels[0].id}`);
      } else if (response.status === 409) {
        const data = await response.json();
        if (data.code === 'ALREADY_A_MEMBER' && inviteData[code]) {
          setMemberStatus(prev => ({...prev, [code]: true}));
          navigate(`/channels/${inviteData[code].guildId}/${inviteData[code].channel.id}`);
        } else {
          console.error('Failed to join server:', data);
        }
      } else {
        console.error('Failed to join server:', await response.json());
      }
    } catch (error) {
      console.error('Error joining server:', error);
    }
  };

  return (
    <div>
      <MarkdownRenderer>{processedContent}</MarkdownRenderer>
      
      {inviteCodes.map((code) => {
        const invite = inviteData[code];
        if (!invite) return null;
        
        return (
          <InviteEmbed 
            key={`invite-${code}`} 
            invite={invite} 
            isMember={memberStatus[code] || false}
            onClick={() => handleJoinServer(code)}
          />
        );
      })}
    </div>
  );
};

export default MessageWithInvites;