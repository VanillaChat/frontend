import React from "react";
import cn from "@/utils/cn";
import {User} from "@/types/User";
import {useMessages} from "@/store/messages";
import {FaExclamationCircle} from "react-icons/fa";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isTomorrow from "dayjs/plugin/isTomorrow";
import isYesterday from "dayjs/plugin/isYesterday";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";

dayjs.extend(localizedFormat);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(isYesterday);
dayjs.extend(utc);

type MessageProps = {
  content: string;
  author: Partial<User>;
  createdAt: Date;
  state: 'SENT' | 'SENDING' | 'FAILED';
  channelId: string;
  index: number;
};

export function formatDate(input: Date | string) {
  const date = dayjs(input).utc().local();

  if (date.isToday()) {
    return `Today at ${date.format("HH:mm")}`;
  } else if (date.isYesterday()) {
    return `Yesterday at ${date.format("HH:mm")}`;
  } else if (date.isTomorrow()) {
    return `Tomorrow at ${date.format("HH:mm")}`;
  }

  return date.format("DD.MM.YYYY HH:mm");
}

export default function Message(props: MessageProps) {
  const messages = useMessages();
  const previous = messages.data[props.channelId]?.[props.index - 1];
  // const today = new Date();
  // const yesterday = new Date();
  // const tomorrow = new Date();
  // yesterday.setDate(today.getDate() - 1);
  // tomorrow.setDate(today.getDate() + 1);
  // const isToday = props.createdAt.toDateString() === today.toDateString();
  // const isYesterday =
  //   props.createdAt.toDateString() === yesterday.toDateString();
  // const isTomorrow = props.createdAt.toDateString() === tomorrow.toDateString();

  const isCompact = (
      previous &&
          previous.author.id === props.author.id &&
          props.createdAt.getTime() - new Date(previous.createdAt).getTime() < 300_000
  ) || false;

  return (
    <li className={cn(
        "p-[0_16px] mt-[12px] opacity-100 flex rounded-r-[8px] text-[16px] w-[100%] justify-between hover:bg-[#d0d0d0] dark:hover:bg-[#49473f] dim:hover:bg-[#282828] group",
        {
          "opacity-[.5]": props.state === "SENDING",
          "px-[74px] mt-1": isCompact
        }
    )}>
      <div className="flex flex-row items-start gap-[8px] w-[100%]">
        {!isCompact && <img
          width="42px"
          height="42px"
          src="https://cdn.discordapp.com/avatars/309427040908476416/f04949f40541d7036f687933d482a8dc.webp?size=1024"
          alt="channel icon"
          className="mr-[8px] rounded-full shrink-0"
        />}
        <div className="flex flex-col justify-center items-start max-w-[100%]">
          <div>
            {!isCompact &&
                <>
                  <span className="font-medium">{(props.author.nickname ?? props.author.username) || "Unknown User"}</span>
                  <span className="text-[12px] ml-[5px] dark:text-[#C2C2C2] dim:text-[#C2C2C2]">
                    {formatDate(props.createdAt)}
                  </span>
                </>
          }
          </div>
          <p className={cn(
              "text-[14px] !select-text m-0 whitespace-pre-line wrap-break-word max-w-[100%] break-all dark:text-[#C2C2C2] dim:text-[#C2C2C2]",
              {
                "text-[#EF4444] dark:text-[#EF4444] dim:text-[#EF4444]": props.state === "FAILED"
              }
          )}>{props.content}</p>
          {props.state === 'FAILED' && (
              <div className="flex flex-row gap-[6px] mt-[6px] items-center">
                <FaExclamationCircle color="#EF4444" size="14px" />
                <p className="text-[#EF4444] text-[14px]">Failed to send this message.</p>
              </div>
          )}
        </div>
      </div>
      {/*<div className="hidden flex-row h-fit p-[8px_12px] bg-[#fff] border-[1px] border-[#e0e0e0] rounded-[8px] shadow-message translate-x-[22px] translate-y-[-32px] group-hover:flex">*/}
      {/*  <p style={{ margin: 0 }}>action</p>*/}
      {/*</div>*/}
    </li>
  );
}