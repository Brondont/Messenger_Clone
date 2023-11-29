import React from "react";
import "./Input.css";

export type ErrorServerResponse = {
  type: string;
  value: string;
  msg: string;
  path: string;
  location: string;
};

type InputProps = {
  valid: boolean;
  required: boolean;
  value?: string;
  label?: string;
  placeholder?: string;
  errorMessage?: ErrorServerResponse[];
  className?: string;
  type: string;
  name: string;
  onChange: (value: string, name: string) => void;
};

const Input: React.FC<InputProps> = ({
  valid,
  required,
  value,
  placeholder,
  type,
  name,
  className,
  label,
  errorMessage,
  onChange,
}) => {
  let invalidMessage;
  if (errorMessage) {
    // reversing the array to get the newest added error
    const error = errorMessage.reverse().find((err) => {
      return err.path === name;
    });
    if (error) {
      invalidMessage = error.msg;
    }
  }
  return (
    <div className="input">
      {label && <label htmlFor={name}>{label}</label>}
      {!valid && errorMessage && (
        <span className="error">
          {invalidMessage ? invalidMessage : "Invalid input."}
        </span>
      )}
      <input
        className={className && className + (valid ? " valid" : " invalid")}
        placeholder={placeholder}
        name={name}
        type={type}
        value={value}
        onChange={(e: React.FormEvent<HTMLInputElement>) => {
          onChange(e.currentTarget.value, name);
        }}
      />
    </div>
  );
};

export default Input;
