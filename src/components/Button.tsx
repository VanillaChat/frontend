import React from "react";
import "../styles/Button.css";
import { Link } from "react-router-dom";

type Props = {
  children: React.ReactNode;
  icon?: string;
  onClick?: () => void;
  disabled?: boolean;
  filled?: boolean;
  style?: React.CSSProperties;
  to?: string;
};

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
        className={`button${props.filled ? " filled " : ""}${
          props.disabled ? " disabled" : ""
        }`}
        style={{ textDecoration: "none", ...props.style }}
      >
        {props.icon && <img src={props.icon} alt="icon" />}
        {props.children}
      </Link>
    );
  return (
    <button
      style={props.style}
      onClick={props.disabled ? () => void 0 : props.onClick}
      className={`button${props.disabled ? " disabled " : ""}${
        props.filled ? " filled" : ""
      }`}
      disabled={props.disabled}
    >
      {props.icon && <img src={props.icon} alt="icon" />}
      {props.children}
    </button>
  );
};
export default Button;
