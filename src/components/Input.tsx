import React, { HTMLInputTypeAttribute } from "react";
import "../styles/Input.css";

type Props = {
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  textarea?: boolean;
  id?: string;
  label?: string;
  labelStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  containerClass?: string;
  icon?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
};

const Input: React.FC<React.PropsWithChildren<Props>> = (props: Props) => {
  if (!props.id && props.label)
    console.warn(
      "An input with a label and without an id is deprecated and will be throwing an error in the future."
    );
  if (props.textarea) {
    return (
      <div className={`input-flex ${props.containerClass}`}>
        {props.label && (
          <label htmlFor={props.id} style={props.labelStyle}>
            {props.label}
          </label>
        )}
        <textarea
          className={`input${props.className ? ` ${props.className}` : ""}`}
          value={props.value}
          onChange={props.onChange}
          placeholder={props.placeholder}
          style={props.style}
          id={props.id}
          onKeyDown={props.onKeyDown}
        />
      </div>
    );
  }
  return (
    <div
      className={`input-flex${
        props.containerClass ? ` ${props.containerClass}` : ""
      }`}
    >
      {props.label && (
        <label
          htmlFor={props.id}
          className="placeholder"
          style={props.labelStyle}
        >
          {props.label}
        </label>
      )}
      <input
        className={`input${props.className ? ` ${props.className}` : ""}`}
        type={props.type}
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        style={props.style}
        id={props.id}
        onKeyDown={props.onKeyDown}
      />
    </div>
  );
};
export default Input;
