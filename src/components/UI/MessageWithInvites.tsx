import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {processMessageContent} from "@/utils/inviteUtils";
import {InviteData, useInvites} from "@/store/invites";
import {useServers} from "@/store/servers";
import InviteEmbed from "@/components/UI/InviteEmbed";
import {MarkdownRenderer} from "@/components/UI/MarkdownRenderer";
import {FaExclamationCircle} from "react-icons/fa";

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

  const checkMembershipStatus = React.useCallback((guildId: string): boolean => {
    return servers.data.some(server => server.id === guildId);
  }, [servers.data]);

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

        if (invites.hasMembershipStatus(code)) {
          memberStatusMap[code] = invites.getMembershipStatus(code) || false;
        }

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
  }, [inviteCodes, checkMembershipStatus]);

  useEffect(() => {
    if (servers.data.length > 0) {
      invites.retryFailedInvites();

      if (Object.keys(inviteData).length > 0) {
        const updatedMemberStatus = { ...memberStatus };
        let hasChanges = false;

        for (const code in inviteData) {
          const invite = inviteData[code];
          const isMember = checkMembershipStatus(invite.guildId);

          if (memberStatus[code] !== isMember) {
            updatedMemberStatus[code] = isMember;
            invites.setMembershipStatus(code, isMember);
            hasChanges = true;
          }
        }

        if (hasChanges) {
          setMemberStatus(updatedMemberStatus);
        }
      }
    }
  }, [servers.data, checkMembershipStatus]);

  const handleJoinServer = async (code: string) => {
    const invite = inviteData[code];
    if (!invite) return;

    if (invites.hasMembershipStatus(code)) {
      const isMember = invites.getMembershipStatus(code);

      if (isMember) {
        navigate(`/channels/${invite.guildId}/${invite.channel.id}`);
        return;
      }
    }

    const isMember = checkMembershipStatus(invite.guildId);
    
    if (isMember) {
      invites.setMembershipStatus(code, true);
      setMemberStatus(prev => ({...prev, [code]: true}));
      navigate(`/channels/${invite.guildId}/${invite.channel.id}`);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/invites/${code}`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        invites.setMembershipStatus(code, true);
        setMemberStatus(prev => ({...prev, [code]: true}));
        navigate(`/channels/${data.guild.id}/${data.guild.channels[0].id}`);
      } else if (response.status === 409) {
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
    <>
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
    </>
  );
};

export default MessageWithInvites;