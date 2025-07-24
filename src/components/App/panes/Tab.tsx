import React, {ReactNode} from "react";
import cn from "@/utils/cn";

type TabProps = {
    children: ReactNode;
    active: boolean;
    onClick: () => void;
}

export const Tab = (props: TabProps) => {
    return <div
        onClick={props.onClick}
        className={cn(
            "no-underline text-black cursor-pointer dark:text-white dim:text-white justify-between bg-transparent border-[1px] border-transparent p-[6px_13px] flex rounded-[8px] text-[16px] ease-in-out items-center group",
            {
                "hover:bg-white hover:border-[1px] hover:border-[#e0e0e0] dark:hover:bg-[#4D4A3D] dark:hover:border-[#4D4A3D] dim:hover:bg-[#171717] dim:hover:border-[#1C1C1C]": !props.active,
                "bg-white border-[1px] border-[#e0e0e0] dark:bg-[#4D4A3D] dark:border-[#4D4A3D] dim:bg-[#171717] dim:border-[#1C1C1C] active": props.active
            }
        )}
    >
        {props.children}
    </div>
}