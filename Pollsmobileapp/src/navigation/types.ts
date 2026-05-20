export type PublicStackParamList = {
  Home: undefined;
  Login: undefined;
  PublicPolls: undefined;
  PublicVote: { pollId: string };
};

export type AppTabParamList = {
  Dashboard: undefined;
  Polls: undefined;
  Assigned: undefined;
  Reports: undefined;
  Users: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  PublicPolls: undefined;
  PublicVote: { pollId: string };
  PollForm: { pollId?: string } | undefined;
  Analytics: { pollId: string };
  AssignedVote: { pollId: string };
};