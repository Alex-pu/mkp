const PUBLIC_VOTER_TOKEN_KEY = 'poll-master-public-voter-token';

const createPublicVoterToken = () => `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

export const getPublicVoterToken = () => {
  if (typeof window === 'undefined') {
    return createPublicVoterToken();
  }

  const existingToken = window.localStorage.getItem(PUBLIC_VOTER_TOKEN_KEY);

  if (existingToken) {
    return existingToken;
  }

  const nextToken = createPublicVoterToken();
  window.localStorage.setItem(PUBLIC_VOTER_TOKEN_KEY, nextToken);
  return nextToken;
};