import type { ClassValue } from "clsx";
import type React from "react";
import type { HTMLInputTypeAttribute } from "react";
import type {
	FieldError,
	FieldValues,
	Path,
	UseFormRegister,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FaExclamationCircle } from "react-icons/fa";
import cn from "@/utils/cn";

type Props = {
	value?: string;
	type?: HTMLInputTypeAttribute;
	placeholder?: string;
	id?: string;
	label?: string;
	labelStyle?: React.CSSProperties;
	style?: React.CSSProperties;
	containerClass?: ClassValue;
	icon?: string;
	className?: string;
	onKeyDown?: (e: React.KeyboardEvent) => void;
	name?: string;
	autoFocus?: boolean;
	maxLength?: number;
} & (
	| {
			textarea: true;
			onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
			innerRef?: React.RefObject<HTMLTextAreaElement | null>;
	  }
	| {
			textarea?: false;
			onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
			innerRef?: React.RefObject<HTMLInputElement | null>;
	  }
);

type FormInputProps<T extends FieldValues> = Props & {
	register: UseFormRegister<T>;
	name: Path<T>;
	error?: FieldError;
	translatedError?: { error: FieldError; params?: { [key: string]: any } };
};

const inputStyles = (className?: string) =>
	cn(
		"border-[1px] border-[#D0D5DD] rounded-[8px] py-[12px] px-[10px] font-[16px] outline-none transition-all duration-[.2s] font-[Inter, sans-serif] resize-none overflow-hidden",
		"focus:border-[1px] focus:border-[#dbddd0] focus:shadow-input",
		"dark:bg-[#393830] dark:border-[#464540] dark:focus:border-[#363531] dark:text-white dark:placeholder-white dark:focus:shadow-input-dark",
		"dim:bg-[#181815] dim:border-[#302F2A] dim:focus:border-[#3d3c36] dim:text-white dim:placeholder-white dim:focus:shadow-input-dim",
		className,
	);

const Input: React.FC<React.PropsWithChildren<Props>> = (props: Props) => {
	if (!props.id && props.label)
		console.warn(
			"An input with a label and without an id is deprecated and will be throwing an error in the future.",
		);
	if (props.textarea) {
		return (
			<div className={cn("flex flex-col", props.containerClass)}>
				{props.label && (
					<label
						htmlFor={props.name ?? props.id}
						style={props.labelStyle}
						className="text-[#344054] dark:text-white dim:text-white text-[14px] font-medium mb-[10px]"
					>
						{props.label}
					</label>
				)}
				<textarea
					className={cn(
						inputStyles(props.className),
						"resize-none overflow-hidden min-h-[2em]",
					)}
					value={props.value}
					onChange={(e) => {
						if (props.onChange) props.onChange(e);
						const textarea = e.target;
						textarea.style.height = "auto";
						textarea.style.height = `${textarea.scrollHeight}px`;
					}}
					placeholder={props.placeholder}
					style={props.style}
					ref={(ref) => {
						if (ref && props.innerRef && "current" in props.innerRef) {
							props.innerRef.current = ref;
							setTimeout(() => {
								ref.style.height = "auto";
								ref.style.height = `${ref.scrollHeight}px`;
							}, 0);
						}
					}}
					id={props.id}
					name={props.name}
					onKeyDown={props.onKeyDown}
					rows={1}
					maxLength={props.maxLength}
				/>
			</div>
		);
		// return (
		//     <div className={`input-flex ${props.containerClass}`}>
		//       {props.label && (
		//           <label htmlFor={props.name ?? props.id} style={props.labelStyle}>
		//             {props.label}
		//           </label>
		//       )}
		//       <textarea
		//           className={`input${props.className ? ` ${props.className}` : ""}`}
		//           value={props.value}
		//           onChange={props.onChange}
		//           placeholder={props.placeholder}
		//           style={props.style}
		//           ref={props.innerRef as React.RefObject<HTMLTextAreaElement>}
		//           id={props.id}
		//           name={props.name}
		//           onKeyDown={props.onKeyDown}
		//       />
		//     </div>
		// );
	}
	// return (
	//   <div
	//     className={clsx(
	//         "input-flex",
	//         {
	//           containerClass: props.containerClass
	//         }
	//     )}
	//   >
	//     {props.label && (
	//       <label
	//         htmlFor={props.id}
	//         className="placeholder"
	//         style={props.labelStyle}
	//       >
	//         {props.label}
	//       </label>
	//     )}
	//     <input
	//         className={clsx("input", props.className)}
	//         type={props.type}
	//         value={props.value}
	//         onChange={props.onChange}
	//         placeholder={props.placeholder}
	//         style={props.style}
	//         ref={props.innerRef as React.RefObject<HTMLInputElement>}
	//         id={props.id}
	//         onKeyDown={props.onKeyDown}
	//     />
	//   </div>
	// );

	return (
		<div className={cn("flex flex-col", props.containerClass)}>
			{props.label && (
				<label
					htmlFor={props.name ?? props.id}
					style={props.labelStyle}
					className="text-[#344054] dark:text-white dim:text-white text-[14px] font-medium mb-[10px] w-fit"
				>
					{props.label}
				</label>
			)}
			<input
				className={inputStyles(props.className)}
				type={props.type}
				value={props.value}
				onChange={props.onChange}
				placeholder={props.placeholder}
				style={props.style}
				ref={props.innerRef as React.RefObject<HTMLInputElement>}
				id={props.id}
				name={props.name}
				onKeyDown={props.onKeyDown}
				maxLength={props.maxLength}
			/>
		</div>
	);
};

export function FormInput<T extends FieldValues>(props: FormInputProps<T>) {
	const { t } = useTranslation();
	return (
		<div className={cn("flex flex-col", props.containerClass)}>
			{props.label && (
				<label
					htmlFor={props.id}
					className="text-[#344054] dark:text-white dim:text-white text-[14px] font-medium mb-[10px]"
					style={props.labelStyle}
				>
					{props.label}
				</label>
			)}
			<input
				className={inputStyles(props.className)}
				type={props.type}
				value={props.value}
				placeholder={props.placeholder}
				style={props.style}
				id={props.id}
				onKeyDown={props.onKeyDown}
				autoComplete="one-time-code"
				{...props.register(props.name)}
			/>
			{props.error && (
				<div className="flex flex-row items-center mt-[6px] gap-[4px]">
					<FaExclamationCircle color="#EF4444" size="18px" />
					<small className="m-0 text-[#EF4444]">{props.error.message}</small>
				</div>
			)}
			{props.translatedError?.error && (
				<div className="flex flex-row items-center mt-[6px] gap-[4px]">
					<FaExclamationCircle color="#EF4444" size="18px" />
					<small className="m-0 text-[#EF4444]">
						{/* @ts-expect-error */}
						{t(
							props.translatedError.error.message as string,
							props.translatedError.params as any,
						)}
					</small>
				</div>
			)}
		</div>
	);
}

export default Input;
