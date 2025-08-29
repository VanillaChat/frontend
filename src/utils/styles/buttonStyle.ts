import type { ButtonProps } from "@/components/UI/Button";
import cn from "@/utils/cn";

export const buttonStyles = (props: Partial<ButtonProps>) =>
	cn(
		"border-solid border-[#DBDDD0] border-[1px] bg-none rounded-[8px] not-disabled:cursor-pointer text-[16px] flex justify-center items-center font-medium py-[10px] px-[25px] text-[#344054] transition-all duration-[.2s]",
		" hover:not-disabled:scale-[1.05] active:not-disabled:scale-[0.97]",
		"disabled:cursor-not-allowed disabled:border-[1px] disabled:shadow-none disabled:opacity-[.7]",
		{
			// light
			"hover:not-disabled:not-dark:not-dim:bg-[#f6f6f6] active:not-disabled:not-dark:not-dim:bg-[#f6f6f6]":
				!props.filled,
			// dark
			"dark:border-[#464540] dark:bg-[#393830] dark:not-disabled:hover:bg-[#47463c] dark:not-disabled:active:bg-[#33322b] dark:text-white dark:not-disabled:hover:border-[#5e5c52] dark:not-disabled:active:border-[#44433c]":
				!props.filled,
			// dim
			"dim:border-[#302F2A] dim:bg-[#181815] dim:not-disabled:hover:bg-[#282823] dim:not-disabled:active:bg-[#141411] dim:text-white dim:not-disabled:hover:border-[#44433b] dim:not-disabled:active:border-[#282723]":
				!props.filled,
			// filled
			"bg-[#f7e26c] border-[#f7e26c] text-black not-disabled:hover:bg-[#dcc857] not-disabled:active:bg-[#dcc857] not-disabled:hover:border-[#dcc857] not-disabled:active:border-[#dcc857]":
				props.filled,
			// destructive
			"!bg-[#EF4444] !border-[#EF4444] !text-white not-disabled:hover:!bg-[#DC2626] not-disabled:active:!bg-[#DC2626] not-disabled:hover:!border-[#DC2626] not-disabled:active:!border-[#DC2626]":
				props.destructive,
		},
	);
