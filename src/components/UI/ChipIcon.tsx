import type { ReactNode } from "react";

type ChipIconProps = {
	icon: ReactNode;
};
export default function ChipIcon({ icon }: ChipIconProps) {
	return (
		<div className="py-[10px] px-[10px] border-[8px] border-[#FBF8E9] dark:bg-[#39372B] dark:border-[#877F4B] dim:border-[#9b8f4d] dim:bg-[#1D1D1D] dark:border-[2px] dark:p-[18px_12px] dim:border-[2px] dim:p-[18px_12px] bg-[#F7F2D3] rounded-full flex justify-center items-center">
			{icon}
		</div>
	);
}
