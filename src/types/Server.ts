export type Server = {
  id: string;
  name: string;
  brief: string;
  icon: string | null
  ownerId: string;
  // members: any[];
  createdAt: string;
};

export type Channel = {
  id: string;
  name: string;
  createdAt: string;
  guildId: string;
}