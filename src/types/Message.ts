import {User} from "@/types/User";

export type Message = {
  content: string;
  createdAt: Date;
  updatedAt: Date | null;
  author: Partial<User>;
  id: string;
  state: "SENDING" | "SENT" | "FAILED";
  type: "DEFAULT" | "USER_JOIN" | "USER_LEAVE";
  channelId?: string;
};
