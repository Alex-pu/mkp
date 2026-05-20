import AsyncStorage from '@react-native-async-storage/async-storage';

const PUBLIC_VOTER_TOKEN_KEY = 'poll-master-public-voter-token';

const createPublicVoterToken = () => `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

export const getPublicVoterToken = async () => {
  const existingToken = await AsyncStorage.getItem(PUBLIC_VOTER_TOKEN_KEY);

  if (existingToken) {
    return existingToken;
  }

  const nextToken = createPublicVoterToken();
  await AsyncStorage.setItem(PUBLIC_VOTER_TOKEN_KEY, nextToken);
  return nextToken;
};