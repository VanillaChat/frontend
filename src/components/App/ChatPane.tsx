import React, {useCallback, useEffect, useRef} from "react";
import Input from "@/components/UI/Input";
import Message from "@/components/UI/Message";
import {useTranslation} from "react-i18next";
import {useMessages} from "@/store/messages";
import {useLoaderData, useParams} from "react-router-dom";
import {useSession} from "@/store/session";
import {useChannels} from "@/store/servers";
import {useAppStore} from "@/store/app";

export const ChatPaneStub: React.FC = () => {
  const isDM = location.pathname.includes("@me");

  return (
      <div className="w-[100vw] flex flex-col dark:bg-[#262622] dim:bg-[#141413]">
        <div className="bg-[#FBFBFB] dark:bg-[#36362E] dim:bg-[#171717] dark:border-b-[#36362E] dim:border-b-[#171717] h-[52px] p-[20px_25px] flex flex-row border-b-[1px] border-b-[#e0e0e0] items-center gap-[5px]">
          <h1 className="text-[24px] font-normal m-0">{isDM ? "@" : "#"}</h1>
          <p className="text-[16px] font-medium">{isDM ? "Unknown User" : "Unknown Channel"}</p>
        </div>
        <Input
            placeholder="Message #Unknown Channel"
            containerClass="flex mb-[10px] w-[98%] h-[45px] text-center justify-self-center self-center mt-auto [&>input]:resize-none [&>input>:shadow-none"
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

  const channel = channels?.find(ch => ch.id === channelId) || {name: 'test'};

  useEffect(() => {
    if (typeof messages.savedContent[channelId!] === 'undefined') messages.setContent(channelId!, '');
    if (typeof messages.data[channelId!] === "undefined") messages.setMessages(channelId!, loadedMessages.map((msg: any) => ({...msg, state: 'SENT'})));
  }, [messages.savedContent]);

  useEffect(() => {
    if (msgRef.current) {
      msgRef.current.scrollTop = msgRef.current.scrollHeight;
    }
  }, [messages.data]);
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
        !["Escape", "CapsLock", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key) &&
        length === 0 &&
        !appStore.hasModal
    ) {
      inputRef.current?.focus();
    }
  }, [length, appStore.hasModal]);
  useEffect(() => {
    document.addEventListener("keydown", handleFocus);
    return () => document.removeEventListener("keydown", handleFocus);
  }, [length]);

  const onPostMessage = useCallback(async (event: React.KeyboardEvent) => {
    const date = new Date(Date.now());
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (messages.savedContent[channelId!].trim().length > 0) {
        if (typeof messages.data[channelId!] === "undefined") messages.setMessages(channelId!, []);
        const nonce = messages.data[channelId!]?.at(-1)?.id ?? "0";
        const message = messages.pushOptimistic(channelId!, {
          content: messages.savedContent[channelId!],
          createdAt: date,
          author: {
            id: session.currentUser!.id,
            username: session.currentUser!.username
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
  }, [messages.data, messages.savedContent]);

  return (
    <div className="w-[100vw] flex flex-col dark:bg-[#262622] dim:bg-[#141413]">
      <div className="bg-[#FBFBFB] dark:bg-[#36362E] dim:bg-[#171717] dark:border-b-[#36362E] dim:border-b-[#171717] h-[52px] p-[20px_25px] flex flex-row border-b-[1px] border-b-[#e0e0e0] items-center gap-[5px]">
        <h1 className="text-[24px] font-normal m-0">{isDM ? "@" : "#"}</h1>
        <p className="text-[16px] font-medium">{isDM ? "John Doe" : channel?.name}</p>
      </div>
      {messages.data[channelId!]?.length > 0 && (
          <ul className="max-w-[100%] h-[88vh] pl-0 p-[10px] m-0 flex flex-col justify-start items-start overflow-auto min-w-0 dark:bg-[#262622] dim:bg-[#141413]" ref={msgRef}>
            <div>fetching messages...</div>
            {Array.from(messages.data[channelId!])
                .map((message, index) => (
                    <Message
                        author={message.author}
                        content={message.content}
                        createdAt={new Date(message.createdAt)}
                        state={message.state}
                        channelId={message.channelId!}
                        key={index}
                        index={index}
                    />
                ))}
          </ul>
      )}
      {(messages.data[channelId!]?.length ?? 0) === 0 && (
        <div className="font-medium text-center flex justify-center items-center flex-col h-[100%] dark:bg-[#262622] dim:bg-[#141413]">
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
      <Input
        placeholder={`Message #${channel?.name}`}
        containerClass="flex mb-[10px] w-[98%] h-[45px] text-center justify-self-center self-center mt-auto [&>input]:resize-none [&>input>:shadow-none"
        className="resize-none shadow-none border-[1px] border-[#D3D2C8] bg-[#fffefa]"
        textarea
        innerRef={inputRef}
        id="text-input"
        value={messages.savedContent[channelId!] ?? ''}
        onChange={(e) => messages.setContent(channelId!, e.target.value)}
        onKeyDown={onPostMessage}
      />
    </div>
  );
};
export default ChatPane;
