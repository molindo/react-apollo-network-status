import {ApolloClient} from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {SchemaLink} from 'apollo-link-schema';
import schema from './schema';

export default () =>
  new ApolloClient({
    cache: new InMemoryCache(),
    link: new SchemaLink({schema})
  });
