import React from "react";
import {Link} from "react-router-dom";
import cn from "@/utils/cn";
import {buttonStyles} from "@/utils/styles/buttonStyle";

export type ButtonProps = {
  children: React.ReactNode;
  icon?: string;
  iconClass?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean;
  filled?: boolean;
  style?: React.CSSProperties;
  to?: string;
  submit?: boolean;
  className?: string;
  destructive?: boolean
};

const Button: React.FC<React.PropsWithChildren<ButtonProps>> = (props: ButtonProps) => {
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
        className={cn(buttonStyles(props), props.className)}
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
          className={cn(buttonStyles(props), props.className)}
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
        className={cn(buttonStyles(props), props.className)}
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
