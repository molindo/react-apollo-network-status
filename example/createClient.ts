import {ApolloClient, InMemoryCache} from '@apollo/client';
import {SchemaLink} from '@apollo/client/link/schema';
import schema from './schema';
import {link as networkStatusNotifierLink} from './NetworkStatusNotifier';

export default function createClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: networkStatusNotifierLink.concat(new SchemaLink({schema}))
  });
}
