import type { Dispatch, ReactNode, SetStateAction } from "react";
import cn from "@/utils/cn";

export type TabsProps = {
	activeTab: string;
	setActiveTab: Dispatch<SetStateAction<any>>;
	data: {
		name: string;
		id: string;
		contents: ReactNode;
	}[];
};

export default function Tabs(props: TabsProps) {
	return (
		<>
			<div className="flex flex-row gap-[4px] w-fit rounded-[12px] p-[6px_4px] bg-[#f3f4f6] border-[1px] border-transparent dark:bg-[#393830] dim:bg-[#181815] dim:border-[#302F2A] dark:border-[#464540]">
				{props.data.map((tab) => (
					<button
						className={cn(
							"font-medium text-[14px] gap-[12px] p-[8px_16px] rounded-[8px] border-[1px] border-transparent cursor-pointer bg-[#f3f4f6] dim:bg-transparent dark:bg-transparent hover:bg-white hover:border-[#e0e0e0] dim:hover:bg-[#302F2A] dim:hover:border-[#38362f] dark:hover:bg-[#464540] dark:hover:border-[#4f4d47] transition-all duration-[.2s] ease-in-out",
							{
								"bg-white border-[#e0e0e0] dim:bg-[#302F2A] dim:border-[#38362f] dark:bg-[#464540] dark:border-[#4f4d47]":
									props.activeTab === tab.id,
							},
						)}
						key={tab.id}
						onClick={() => props.setActiveTab(tab.id)}
						type="button"
					>
						{tab.name}
					</button>
				))}
			</div>
			<div className="rounded-[8px]">
				{props.data.find((tab) => tab.id === props.activeTab)?.contents}
			</div>
		</>
	);
}
