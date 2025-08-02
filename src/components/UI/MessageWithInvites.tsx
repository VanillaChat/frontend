import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { processMessageContent } from "@/utils/inviteUtils";
import { useInvites, InviteData } from "@/store/invites";
import { useServers } from "@/store/servers";
import InviteEmbed from "@/components/UI/InviteEmbed";
import { MarkdownRenderer } from "@/components/UI/MarkdownRenderer";
import { FaExclamationCircle } from "react-icons/fa";

interface MessageWithInvitesProps {
  content: string;
}

const MessageWithInvites: React.FC<MessageWithInvitesProps> = ({ content }) => {
  const [processedContent, setProcessedContent] = useState(content);
  const [inviteCodes, setInviteCodes] = useState<string[]>([]);
  const [inviteData, setInviteData] = useState<Record<string, InviteData>>({});
  const [memberStatus, setMemberStatus] = useState<Record<string, boolean>>({});
  const [fetchErrors, setFetchErrors] = useState<Record<string, boolean>>({});
  const invites = useInvites();
  const servers = useServers();
  const navigate = useNavigate();

  useEffect(() => {
    const { processedContent, inviteCodes } = processMessageContent(content);
    setProcessedContent(processedContent);
    setInviteCodes(inviteCodes);
  }, [content]);

  // Check if user is already a member of a server by checking if the guild ID is in the servers store
  const checkMembershipStatus = (guildId: string): boolean => {
    // Check if the guild ID exists in the servers store
    return servers.data.some(server => server.id === guildId);
  };

  useEffect(() => {
    const fetchInvites = async () => {
      const inviteDataMap: Record<string, InviteData> = {};
      const fetchErrorsMap: Record<string, boolean> = {};
      const memberStatusMap: Record<string, boolean> = {};
      
      for (const code of inviteCodes) {
        if (invites.hasFetchError(code)) {
          fetchErrorsMap[code] = true;
          continue;
        }

        // First check if we have cached membership status
        if (invites.hasMembershipStatus(code)) {
          memberStatusMap[code] = invites.getMembershipStatus(code) || false;
        }

        // Then get or fetch the invite data
        let inviteData: InviteData | null = null;
        
        if (invites.hasInvite(code)) {
          inviteData = invites.getInvite(code)!;
          if (inviteData) {
            inviteDataMap[code] = inviteData;
          }
        } else {
          inviteData = await invites.fetchInvite(code);
          if (inviteData) {
            inviteDataMap[code] = inviteData;
          } else if (invites.hasFetchError(code)) {
            fetchErrorsMap[code] = true;
            continue;
          }
        }
        
        // If we have invite data but no cached membership status, check it
        if (inviteData && !invites.hasMembershipStatus(code)) {
          const isMember = checkMembershipStatus(inviteData.guildId);
          memberStatusMap[code] = isMember;
          invites.setMembershipStatus(code, isMember);
        }
      }
      
      setInviteData(inviteDataMap);
      setFetchErrors(fetchErrorsMap);
      setMemberStatus(memberStatusMap);
    };
    
    if (inviteCodes.length > 0) {
      fetchInvites();
    }
  }, [inviteCodes, invites]);
  
  // Separate effect to update membership status when servers data changes
  useEffect(() => {
    // Only run if we have invite data and servers data
    if (Object.keys(inviteData).length > 0 && servers.data.length > 0) {
      const updatedMemberStatus = { ...memberStatus };
      let hasChanges = false;
      
      // Check membership status for each invite
      for (const code in inviteData) {
        const invite = inviteData[code];
        const isMember = checkMembershipStatus(invite.guildId);
        
        // If membership status has changed, update it
        if (memberStatus[code] !== isMember) {
          updatedMemberStatus[code] = isMember;
          invites.setMembershipStatus(code, isMember);
          hasChanges = true;
        }
      }
      
      // Only update state if there are changes
      if (hasChanges) {
        setMemberStatus(updatedMemberStatus);
      }
    }
  }, [servers.data, inviteData]);

  const handleJoinServer = async (code: string) => {
    const invite = inviteData[code];
    if (!invite) return;

    // First check if we have cached membership status
    if (invites.hasMembershipStatus(code)) {
      const isMember = invites.getMembershipStatus(code);

      if (isMember) {
        navigate(`/channels/${invite.guildId}/${invite.channel.id}`);
        return;
      }
    }

    // If no cached status or not a member, check current status
    const isMember = checkMembershipStatus(invite.guildId);
    
    if (isMember) {
      // User is already a member, update cache and navigate
      invites.setMembershipStatus(code, true);
      setMemberStatus(prev => ({...prev, [code]: true}));
      navigate(`/channels/${invite.guildId}/${invite.channel.id}`);
      return;
    }

    // User is not a member, try to join
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/invites/${code}`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Successfully joined
        const data = await response.json();
        invites.setMembershipStatus(code, true);
        setMemberStatus(prev => ({...prev, [code]: true}));
        navigate(`/channels/${data.guild.id}/${data.guild.channels[0].id}`);
      } else if (response.status === 409) {
        // Already a member (this shouldn't happen since we checked above, but handle it anyway)
        const data = await response.json();
        if (data.code === 'ALREADY_A_MEMBER') {
          invites.setMembershipStatus(code, true);
          setMemberStatus(prev => ({...prev, [code]: true}));
          navigate(`/channels/${invite.guildId}/${invite.channel.id}`);
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

  const InviteErrorEmbed: React.FC<{ code: string }> = () => {
    return (
      <div className="flex flex-col border rounded-md p-3 my-2 max-w-[400px] bg-[#f0f0e8] dark:bg-[#49473f] dim:bg-[#282828] border-[#D3D2C8] dark:border-[#464540] dim:border-[#302F2A]">
        <div className="flex items-center gap-2 text-red-500">
          <FaExclamationCircle size={16} />
          <span className="font-medium">Failed to load invite</span>
        </div>
        <p className="text-sm mt-1 text-gray-600 dark:text-gray-300 dim:text-gray-400">
          The invite information could not be loaded. The invite may be invalid or expired.
        </p>
      </div>
    );
  };

  return (
    <div>
      <MarkdownRenderer>{processedContent}</MarkdownRenderer>
      
      {inviteCodes.map((code) => {
        if (fetchErrors[code]) {
          return <InviteErrorEmbed key={`invite-error-${code}`} code={code} />;
        }

        const invite = inviteData[code];
        if (invite) {
          return (
            <InviteEmbed 
              key={`invite-${code}`} 
              invite={invite} 
              isMember={memberStatus[code] || false}
              onClick={() => handleJoinServer(code)}
            />
          );
        }

        return null;
      })}
    </div>
  );
};

export default MessageWithInvites;