import ApolloClient, {ApolloClientOptions} from 'apollo-client';
import ApolloLinkNetworkStatus from './ApolloLinkNetworkStatus';
import Dispatcher from './Dispatcher';

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

function cloneApolloClient(
  client: ApolloClient<any>,
  options: ApolloClientOptions<any>
): ApolloClient<any> {
  const clone = new ApolloClient({
    // copy from existing
    cache: client.cache,
    queryDeduplication: client.queryDeduplication,
    defaultOptions: client.defaultOptions,
    typeDefs: client.typeDefs,

    // Has different name on class than the config properties
    ssrMode: client.disableNetworkFetches,

    // needs to be added
    ssrForceFetchDelay: client.ssrForceFetchDelay,
    connectToDevTools: client.connectToDevTools,
    queryManager: client.queryManager,

    // not necessary as only forwarded to query manager:
    // assumeImmutableResults, name, version

    ...options
  });

  // Not available via constructor, but via setter
  clone.setResolvers(client.getResolvers());

  // new
  clone.setLocalStateFragmentMatcher(client.getLocalStateFragmentMatcher());

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

  const link = new ApolloLinkNetworkStatus({dispatcher, enableBubbling}).concat(
    client.link
  );

  return cloneApolloClient(client, {link});
}
