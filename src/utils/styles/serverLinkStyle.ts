import cn from "@/utils/cn";

export const serverLinkStyle = ({
	isActive,
	className,
}: {
	isActive: boolean;
	className?: string;
}) =>
	cn(
		"bg-white border-[1px] border-[#dcdcdc] flex flex-col items-center justify-center w-[48px] h-[48px] no-underline text-[#303742] rounded-[14px] ease-in-out transition-all duration-[.2s] mb-[10px] cursor-pointer hover:bg-[#f7e26b] hover:border-[1px] hover:border-[#f7e26b] dark:border-[#877F4B] dark:bg-[#39372B] dark:text-[#F7E26B] dark:hover:bg-[#39372B] dim:bg-[#1D1D1D] dim:border-[#9b8f4d] dim:text-[#9b8f4d] dim:hover:bg-[#1D1D1D]",
		{
			"bg-[#f7e26b] border-[1px] border-[#f7e26b] dark:bg-[#F7E26B] dark:hover:bg-[#F7E26B] dark:text-black dim:text-black dim:bg-[#f7e26b] dim:hover:bg-[#f7e26b]":
				isActive,
		},
		className,
	);
