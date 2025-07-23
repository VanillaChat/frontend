import React from "react";
import cn from "@/utils/cn";

type MessageSkeletonProps = {
  isCompact?: boolean;
};

export default function MessageSkeleton({ isCompact = false }: MessageSkeletonProps) {
  const contentWidth = Math.floor(Math.random() * 60) + 20;
  const secondLineWidth = Math.floor(Math.random() * 40) + 10;
  const hasSecondLine = Math.random() > 0.5;

  return (
    <li className={cn(
      "w-[100%] p-[0_16px] mt-[12px] opacity-70 flex rounded-r-[8px] text-[16px] justify-between",
      { "px-[74px] mt-1": isCompact }
    )}>
      <div className="flex flex-row items-start gap-[8px] w-[100%]">
        {!isCompact && (
          <div 
            className="w-[42px] h-[42px] mr-[8px] rounded-full shrink-0 bg-gray-200 dark:bg-[#36362E] dim:bg-[#1E1E1E] animate-pulse"
          />
        )}
        <div className="flex flex-col justify-center items-start max-w-[100%] w-[100%]">
          {!isCompact && (
            <div className="flex items-center mb-1">
              <div 
                className="h-[14px] rounded-md bg-gray-200 dark:bg-[#36362E] dim:bg-[#1E1E1E] animate-pulse"
                style={{ width: `${Math.floor(Math.random() * 20) + 10}%` }}
              />
              <div 
                className="h-[10px] ml-[5px] rounded-md bg-gray-200 dark:bg-[#36362E] dim:bg-[#1E1E1E] animate-pulse"
                style={{ width: '40px' }}
              />
            </div>
          )}
          <div 
            className="h-[14px] rounded-md bg-gray-200 dark:bg-[#36362E] dim:bg-[#1E1E1E] animate-pulse"
            style={{ width: `${contentWidth}%` }}
          />
          {hasSecondLine && (
            <div 
              className="h-[14px] mt-1 rounded-md bg-gray-200 dark:bg-[#36362E] dim:bg-[#1E1E1E] animate-pulse"
              style={{ width: `${secondLineWidth}%` }}
            />
          )}
        </div>
      </div>
    </li>
  );
}