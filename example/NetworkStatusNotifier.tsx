import {createNetworkStatusNotifier} from '../src';

const networkStatusNotifier = createNetworkStatusNotifier();

export const link = networkStatusNotifier.link;
export const useApolloNetworkStatus =
  networkStatusNotifier.useApolloNetworkStatus;
