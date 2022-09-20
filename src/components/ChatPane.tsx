import React from "react";
import Input from "./Input";

const ChatPane: React.FC = () => {
  const [, setMessage] = React.useState("");
  return (
    <div className="chat-pane">
      <div className="channel-info">
        <h1 className="icon">#</h1>
        <p className="channel-name">general</p>
      </div>
      <Input
        placeholder="Message #general"
        containerClass="chat-input"
        textarea
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            setMessage((event.target as HTMLTextAreaElement).value.trim());
          }
        }}
      />
    </div>
  );
};
export default ChatPane;
