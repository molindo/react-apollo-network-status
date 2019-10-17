import ApolloClient from 'apollo-client';
import { DedupLink } from 'apollo-link-dedup';
import ApolloLinkNetworkStatus from './ApolloLinkNetworkStatus';
import Dispatcher from './Dispatcher';
import { Mutable } from './types';
/**
 * Maintainer notice: The goal here is to create a new Apollo Client instance
 * which has the network status link added. Instantiating a new client doesn't
 * work, as otherwise it would have a separate cache – this would lead to
 * mutation results not being incorporated everywhere. Providing the cache
 * during initialization isn't enough, probably due to separate internal QueryManager
 * instances (they have a list of queries to notify after a mutation result).
 *
 * The approach here is to copy the instance along with all its configuration
 * and to patch the link on the new instance.
 */

function cloneInstance<T>(original: T): T {
  const prototype = Object.getPrototypeOf(original);
  const clone = Object.assign(Object.create(prototype), original);

  // Apollo Client binds methods in the constructur via `.bind`. Therefore just
  // copying the methods to the new instance isn't enough, but these ones need to
  // be bound to the clone manually.
  Object.keys(prototype).forEach(key => {
    if (typeof prototype[key] === 'function') {
      clone[key] = prototype[key].bind(clone);
    }
  });

  return clone;
}

export default function augmentApolloClient({
  client,
  dispatcher,
  enableBubbling
}: {
  client: ApolloClient<any>;
  dispatcher: Dispatcher;
  enableBubbling?: boolean;
}): ApolloClient<any> {
  // Apollo Client <= 2.5.1 initializes the query manager lazily, however this
  // behaviour is removed in later versions. Ensure that it has been constructed.
  if (!client.queryManager && client.initQueryManager) {
    client.initQueryManager();
  }

  const link = new ApolloLinkNetworkStatus({
    dispatcher,
    enableBubbling
  }).concat(client.link);

  // Clone the client
  const augmentedClient = cloneInstance(client);
  augmentedClient.link = link;

  // Clone the query manager
  (augmentedClient as Mutable<ApolloClient<any>>).queryManager = cloneInstance(
    augmentedClient.queryManager
  );

  if (augmentedClient.queryManager) {
    augmentedClient.queryManager.link = link;
    // @ts-ignore: This property could otherwise only be set during instantiation.
    augmentedClient.queryManager.deduplicator = new DedupLink().concat(link);
  }

  return augmentedClient;
}
