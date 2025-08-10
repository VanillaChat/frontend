import React, {useCallback, useEffect, useRef, useState} from "react";
import Input from "@/components/UI/Input";
import Message from "@/components/UI/Message";
import MessageSkeleton from "@/components/UI/MessageSkeleton";
import {useTranslation} from "react-i18next";
import {useEditCache, useMessages} from "@/store/messages";
import {useLoaderData, useParams} from "react-router-dom";
import {useSession} from "@/store/session";
import {useChannels} from "@/store/servers";
import {useAppStore} from "@/store/app";
import {PulseLoader} from "react-spinners";
import {useTheme} from "@/context/ThemeProvider";
import { throttle } from 'lodash';

export const ChatPaneStub: React.FC = () => {
  const isDM = location.pathname.includes("@me");

  return (
      <div className="w-full h-full flex flex-col dark:bg-[#262622] dim:bg-[#141413]">
        <div className="bg-[#FBFBFB] dark:bg-[#36362E] dim:bg-[#171717] dark:border-b-[#36362E] dim:border-b-[#171717] h-[52px] p-[20px_25px] flex flex-row border-b-[1px] border-b-[#e0e0e0] items-center gap-[5px]">
          <h1 className="text-[24px] font-normal m-0">{isDM ? "@" : "#"}</h1>
          <p className="text-[16px] font-medium">{isDM ? "Unknown User" : "Unknown Channel"}</p>
        </div>
        <Input
            placeholder="Message #Unknown Channel"
            containerClass="flex mb-[30px] w-[98%] h-[45px] text-center justify-self-center self-center mt-auto [&>input]:resize-none [&>input]:shadow-none"
            className="resize-none shadow-none border-[1px] border-[#D3D2C8] bg-[#fffefa]"
            textarea
            id="text-input"
        />
      </div>
  )
}

const ChatPane: React.FC = () => {
  const messages = useMessages();
  const msgRef = useRef<HTMLUListElement>(null);
  const { channelId, guildId } = useParams();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();
  const session = useSession();
  const isDM = location.pathname.includes("@me");
  const { messages: loadedMessages } = useLoaderData();
  const channels = useChannels(state => state.data[isDM ? session.currentUser!.id : guildId!]);
  const appStore = useAppStore();
  const editCache = useEditCache();
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);
  const [prevScrollTop, setPrevScrollTop] = useState(0);
  const isInitialLoad = useRef(true);
  const isViewingOlderMessages = useRef(false);
  const { theme } = useTheme();
  const lastTypingTimeRef = useRef<{ [channelId: string]: number }>({});
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const sendTypingIndicator = useCallback(throttle(async (channelId: string) => {
    const now = Date.now();
    const lastTime = lastTypingTimeRef.current[channelId] || 0;
    
    if (now - lastTime > 9000 || !lastTypingTimeRef.current[channelId]) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/channels/${channelId}/typing`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          lastTypingTimeRef.current[channelId] = now;
        } else {
          console.error('Failed to send typing indicator:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error sending typing indicator:', error);
      }
    }
  }, 1000), []);
  
  const clearTypingIndicator = useCallback((channelId: string, userId?: string) => {
    delete lastTypingTimeRef.current[channelId];
  
    if (userId) {
      messages.removeTypingIndicator(channelId, userId);
    } else if (session.currentUser) {
      messages.removeTypingIndicator(channelId, session.currentUser.id);
    }
  }, [messages, session.currentUser]);

  const channel = channels?.find(ch => ch.id === channelId) || {name: 'test'};

  const handleScroll = useCallback(() => {
    if (!msgRef.current) return;

    if (isInitialLoad.current) {
      return;
    }

    if (msgRef.current.scrollTop < 100 && !messages.isLoadingMore && messages.hasMoreMessages[channelId!]) {
      isViewingOlderMessages.current = true;
      
      setPrevScrollHeight(msgRef.current.scrollHeight);
      messages.loadMoreMessages(channelId!);
    }

    const scrollBottom = msgRef.current.scrollHeight - msgRef.current.scrollTop - msgRef.current.clientHeight;

    if (scrollBottom < 200) {
      if (isViewingOlderMessages.current) {
        isViewingOlderMessages.current = false;
      }
    }
    
    if (scrollBottom < 100 && !messages.isLoadingNewer && messages.hasNewerMessages[channelId!]) {
      setPrevScrollTop(msgRef.current.scrollTop);
      messages.loadNewerMessages(channelId!);
    }
  }, [channelId, messages, msgRef, setPrevScrollHeight, setPrevScrollTop, isInitialLoad]);

  useEffect(() => {
    if (!channelId) return;
    
    const { savedContent, data, setContent, setMessages, setHasMoreMessages, setHasNewerMessages } = messages;
    
    if (typeof savedContent[channelId] === 'undefined') setContent(channelId, '');
    if (typeof data[channelId] === "undefined") {
      setMessages(channelId, loadedMessages.map((msg: any) => ({...msg, state: 'SENT'})));
      setHasMoreMessages(channelId, true);
      setHasNewerMessages(channelId, false);
    }
  }, [channelId, loadedMessages, messages]);

  useEffect(() => {
    const messageContainer = msgRef.current;
    if (messageContainer) {
      messageContainer.addEventListener('scroll', handleScroll);
      return () => messageContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    if (!messages.isLoadingMore && msgRef.current && prevScrollHeight > 0) {
      requestAnimationFrame(() => {
        const newScrollHeight = msgRef.current!.scrollHeight;
        const adjustment = newScrollHeight - prevScrollHeight;

        if (adjustment > 0) {
          msgRef.current!.scrollTop = newScrollHeight - prevScrollHeight;
        } else {
          setTimeout(() => {
            const delayedNewScrollHeight = msgRef.current!.scrollHeight;
            const delayedAdjustment = delayedNewScrollHeight - prevScrollHeight;
            
            if (delayedAdjustment > 0) {
              msgRef.current!.scrollTop = delayedNewScrollHeight - prevScrollHeight;
            }
          }, 100);
        }

        setTimeout(() => {
          setPrevScrollHeight(0);
        }, 200);
      });
    }
  }, [messages.isLoadingMore, messages.data[channelId!], prevScrollHeight, channelId]);

  useEffect(() => {
    if (!messages.isLoadingNewer && msgRef.current && prevScrollTop > 0) {
      msgRef.current.scrollTop = prevScrollTop;
      setPrevScrollTop(0);
    }
  }, [messages.isLoadingNewer, messages.data[channelId!]]);

  // Reset isInitialLoad when guildId changes to ensure scrolling works when switching servers
  useEffect(() => {
    isInitialLoad.current = true;
  }, [guildId]);

  useEffect(() => {
    if (msgRef.current && isInitialLoad.current) {
      setTimeout(() => {
        if (msgRef.current) {
          msgRef.current.scrollTop = msgRef.current.scrollHeight;
          isInitialLoad.current = false;
        }
      }, 100);
    }
  }, [channelId, messages.data[channelId!]]);

  useEffect(() => {
    if (msgRef.current && !messages.isLoadingMore && !prevScrollHeight && !isViewingOlderMessages.current && !isInitialLoad.current) {
      const isNearBottom = msgRef.current.scrollHeight - msgRef.current.scrollTop - msgRef.current.clientHeight < 200;
      if (isNearBottom) {
        msgRef.current.scrollTop = msgRef.current.scrollHeight;
      }
    }
  }, [messages.data, messages.isLoadingMore, prevScrollHeight]);
  const length = document.querySelector('#where-modals')?.children.length;
  const handleFocus = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      inputRef.current?.blur();
    }
    if (
        /[a-zA-Z0-9\u00C0-\u017F]/.test(event.key) &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        event.key !== "Shift" &&
        !["Escape", "CapsLock", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Meta", "Super"].includes(event.key) &&
        length === 0 &&
        !appStore.hasModal &&
        !editCache.cache.isEditing
    ) {
      inputRef.current?.focus();
    }
  }, [length, appStore.hasModal, editCache.cache.isEditing]);
  useEffect(() => {
    document.addEventListener("keydown", handleFocus);
    return () => document.removeEventListener("keydown", handleFocus);
  }, [length, editCache.cache.isEditing, appStore.hasModal]);

  const onPostMessage = useCallback(async (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey && !event.repeat) {
      event.preventDefault();
      if (messages.savedContent[channelId!].trim().length > 0) {
        clearTypingIndicator(channelId!, session.currentUser!.id);
        
        if (typeof messages.data[channelId!] === "undefined") messages.setMessages(channelId!, []);
        const nonce = messages.data[channelId!]?.at(-1)?.id ?? "0";
        const message = messages.pushOptimistic(channelId!, {
          content: messages.savedContent[channelId!],
          createdAt: new Date(Date.now()),
          updatedAt: null,
          author: {
            id: session.currentUser!.id,
            username: session.currentUser!.username,
            avatar: session.currentUser!.avatar
          },
          type: 'DEFAULT'
        });
        messages.setContent(channelId!, '');
        msgRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
        const res = await fetch(`${import.meta.env.VITE_API_URL}/channels/${channelId!}/messages`, {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({
            content: messages.savedContent[channelId!].trim(),
            nonce
          }),
        });
        const json = await res.json();
        if (res.status === 200) {
          message.edit({
            ...json,
            state: 'SENT'
          });
        } else {
          message.edit({
            state: 'FAILED'
          });
        }
      }
    }
  }, [messages.data, messages.savedContent, clearTypingIndicator, channelId]);

  return (
    <div className="w-full h-full flex flex-col dark:bg-[#262622] dim:bg-[#141413]">
      <div className="bg-[#FBFBFB] dark:bg-[#36362E] dim:bg-[#171717] dark:border-b-[#36362E] dim:border-b-[#171717] h-[52px] p-[20px_25px] flex flex-row border-b-[1px] border-b-[#e0e0e0] items-center gap-[5px]">
        <h1 className="text-[24px] font-normal m-0">{isDM ? "@" : "#"}</h1>
        <p className="text-[16px] font-medium">{isDM ? "John Doe" : channel?.name}</p>
      </div>
      <ul
          className="max-w-[100%] h-[calc(100vh-125px)] pl-0 p-[10px] m-0 flex flex-col justify-start items-start min-w-0 dark:bg-[#262622] dim:bg-[#141413] list-none"
          style={{
            overflow: isProfileOpen ? "hidden" : "auto"
          }}
          ref={msgRef}
      >
        {messages.isLoadingMore && (
          <>
            <MessageSkeleton />
            <MessageSkeleton isCompact={true} />
            <MessageSkeleton />
            <MessageSkeleton isCompact={true} />
            <MessageSkeleton />
          </>
        )}
        {messages.data[channelId!]?.length > 0 && (
          Array.from(messages.data[channelId!])
            .map((message, index) => (
              <Message
                author={message.author}
                content={message.content}
                createdAt={new Date(message.createdAt)}
                state={message.state}
                channelId={message.channelId!}
                updatedAt={message.updatedAt}
                key={index}
                index={index}
                id={message.id}
                isProfileOpen={isProfileOpen}
                setIsProfileOpen={setIsProfileOpen}
              />
            ))
        )}
        {(messages.data[channelId!]?.length ?? 0) === 0 && (
            <div className="font-medium text-center flex justify-center items-center flex-col h-[100%] dark:bg-[#262622] dim:bg-[#141413] w-[100%]">
              <svg
                  width="36"
                  height="36"
                  viewBox="0 0 20 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mb-[10px]"
              >
                <path
                    d="M7.5 6L12.5 11M12.5 6L7.5 11M5 16V18.3355C5 18.8684 5 19.1348 5.10923 19.2716C5.20422 19.3906 5.34827 19.4599 5.50054 19.4597C5.67563 19.4595 5.88367 19.2931 6.29976 18.9602L8.68521 17.0518C9.17252 16.662 9.41617 16.4671 9.68749 16.3285C9.9282 16.2055 10.1844 16.1156 10.4492 16.0613C10.7477 16 11.0597 16 11.6837 16H14.2C15.8802 16 16.7202 16 17.362 15.673C17.9265 15.3854 18.3854 14.9265 18.673 14.362C19 13.7202 19 12.8802 19 11.2V5.8C19 4.11984 19 3.27976 18.673 2.63803C18.3854 2.07354 17.9265 1.6146 17.362 1.32698C16.7202 1 15.8802 1 14.2 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V12C1 12.93 1 13.395 1.10222 13.7765C1.37962 14.8117 2.18827 15.6204 3.22354 15.8978C3.60504 16 4.07003 16 5 16Z"
                    strokeWidth="2"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
              </svg>

              <h1 className="text-[2rem] font-bold">{t("app.chat.noMessages")}</h1>
              <p className="text-[1rem]">{t("app.chat.noMessagesDescription")}</p>
            </div>
        )}
        {messages.isLoadingNewer && (
          <>
            <MessageSkeleton />
            <MessageSkeleton isCompact={true} />
            <MessageSkeleton />
            <MessageSkeleton isCompact={true} />
            <MessageSkeleton />
          </>
        )}
      </ul>
      {
        messages.typingIndicators[channelId!]?.length > 0 &&
          <div className="mb-2 items-center gap-2 rounded-[8px] py-[4px] px-[10px] transition-all duration-[.2s] focus:border-[#dbddd0] dark:bg-[#393830] dark:border-[#464540] dark:text-white dim:bg-[#181815] dim:border-[#302F2A] dim:text-white border-[1px] border-[#D3D2C8] bg-[#fffefa] w-[98%] flex self-center">
            <PulseLoader color={theme === 'light' ? 'black' : 'white'} size={6} speedMultiplier={.6} />
            <small className="text-[12px]">{t('app.chat.typing', {user1: messages.typingIndicators[channelId!][0]?.username, user2: messages.typingIndicators[channelId!][1]?.username, count: messages.typingIndicators[channelId!].length, remainingCount: Math.max(0, messages.typingIndicators[channelId!].length - 2)})}</small>
          </div>
      }
      {
        messages.hasNewerMessages[channelId!] && !messages.isLoadingNewer &&
          <div 
            className="mb-2 rounded-[8px] py-[8px] px-[10px] transition-all duration-[.2s] focus:border-[#dbddd0] dark:bg-[#393830] dark:border-[#464540] dark:text-white dim:bg-[#181815] dim:border-[#302F2A] dim:text-white border-[1px] border-[#D3D2C8] bg-[#fffefa] w-[98%] flex self-center justify-center cursor-pointer hover:bg-[#f0f0e8] dark:hover:bg-[#49473f] dim:hover:bg-[#282828]"
            onClick={() => {
              if (msgRef.current) {
                msgRef.current.scrollTop = msgRef.current.scrollHeight;
                messages.loadNewerMessages(channelId!);
              }
            }}
          >
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M12 19L19 12M12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[14px] font-medium">New messages</span>
            </div>
          </div>
      }
      <Input
        placeholder={`Message #${channel?.name}`}
        containerClass="flex w-[98%] text-center justify-self-center self-center mt-auto mb-[15px] [&>input]:shadow-none z-[999]"
        className="resize-none shadow-none border-[1px] border-[#D3D2C8] bg-[#fffefa]"
        textarea
        innerRef={inputRef}
        id="text-input"
        value={messages.savedContent[channelId!] ?? ''}
        onChange={(e) => {
          messages.setContent(channelId!, e.target.value);
          if (e.target.value.trim().length > 0) {
            sendTypingIndicator(channelId!);
          }
        }}
        onKeyDown={onPostMessage}
      />
    </div>
  );
};
export default ChatPane;
