import React from "react";
import {Link} from "react-router-dom";
import cn from "@/utils/cn";

type Props = {
  children: React.ReactNode;
  icon?: string;
  iconClass?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean;
  filled?: boolean;
  style?: React.CSSProperties;
  to?: string;
  submit?: boolean;
};

export const buttonStyles = (props: Partial<Props>) => cn(
    "border-solid border-[#DBDDD0] border-[1px] bg-none rounded-[8px] not-disabled:cursor-pointer text-[16px] flex justify-center items-center font-medium py-[10px] px-[25px] text-[#344054] transition-all duration-[.2s]",
    " hover:not-disabled:scale-[1.05] active:not-disabled:scale-[0.97]",
    "disabled:cursor-not-allowed disabled:border-[1px] disabled:shadow-none disabled:opacity-[.7]",
    {
        // light
        "disabled:bg-white disabled:text-[#d0d5dd] disabled:border-[#eaecf0] hover:not-disabled:not-dark:not-dim:bg-[#f6f6f6] active:not-disabled:not-dark:not-dim:bg-[#f6f6f6]": !props.filled,
        // dark
        "dark:border-[#464540] dark:bg-[#393830] dark:hover:bg-[#47463c] dark:active:bg-[#33322b] dark:text-white dark:hover:border-[#5e5c52] dark:active:border-[#44433c]": !props.filled,
        // dim
        "dim:border-[#302F2A] dim:bg-[#181815] dim:hover:bg-[#282823] dim:active:bg-[#141411] dim:text-white dim:hover:border-[#44433b] dim:active:border-[#282723]": !props.filled,
        "bg-[#f7e26c] border-[#f7e26c] text-black not-disabled:hover:bg-[#dcc857] not-disabled:active:bg-[#dcc857] not-disabled:hover:border-[#dcc857] not-disabled:active:border-[#dcc857]": props.filled
    }
)

const Button: React.FC<React.PropsWithChildren<Props>> = (props: Props) => {
  if (props.to && props.onClick)
    return <p>Props cannot have to and onClick at the same time (Button)</p>;
  if (props.to)
    return props.disabled ? (
      <Button
        icon={props.icon}
        disabled
        filled={props.filled}
        style={props.style}
      >
        {props.children}
      </Button>
    ) : (
      <Link
        to={props.to}
        // className={clsx(
        //     "button",
        //     {
        //       disabled: props.disabled,
        //       filled: props.filled
        //     }
        // )}
        className={buttonStyles(props)}
        style={{ textDecoration: "none", ...props.style }}
      >
        {props.icon && <img src={props.icon} alt="icon" className={cn(
            "w-[20px] h-[20px] mr-[5px] pointer-events-none",
            props.iconClass
        )} />}
        {props.children}
      </Link>
    );
  if (props.submit) {
    return (
        <button
          type="submit"
          style={props.style}
          // className={clsx(
          //     "button",
          //     {
          //       disabled: props.disabled,
          //       filled: props.filled
          //     }
          // )}
          className={buttonStyles(props)}
          disabled={props.disabled}
        >
          {props.icon && <img src={props.icon} alt="icon" className={cn(
              "w-[20px] h-[20px] mr-[5px] pointer-events-none",
              props.iconClass
          )} />}
          {props.children}
        </button>
    )
  }
  return (
      <button
        style={props.style}
        onClick={props.disabled ? void(0) : props.onClick}
        className={buttonStyles(props)}
        disabled={props.disabled}
        type="button"
      >
        {props.icon && <img src={props.icon} alt="icon" className={cn(
            "mr-[5px] pointer-events-none",
            props.iconClass
        )} />}
        {props.children}
      </button>
  );
};
export default Button;
