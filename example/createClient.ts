import {ApolloClient} from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {SchemaLink} from 'apollo-link-schema';
import schema from './schema';
import {link as networkStatusNotifierLink} from './NetworkStatusNotifier';

export default function createClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: networkStatusNotifierLink.concat(new SchemaLink({schema}))
  });
}
