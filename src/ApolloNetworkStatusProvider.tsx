import React, {useMemo, ReactNode} from 'react';
import {withApollo, ApolloProvider} from 'react-apollo';
import ApolloClient from 'apollo-client';
import Dispatcher from './Dispatcher';
import ApolloNetworkStatusDispatcherContext from './ApolloNetworkStatusDispatcherContext';
import augmentApolloClient from './augmentApolloClient';

type Props = {
  client: ApolloClient<any>;
  children: ReactNode;
};

function ApolloNetworkStatusProvider({client, children}: Props) {
  const dispatcher = useMemo(() => new Dispatcher(), []);

  const augmentedClient = useMemo(
    () => augmentApolloClient({client, dispatcher}),
    [client, dispatcher]
  );

  return (
    <ApolloProvider client={augmentedClient}>
      <ApolloNetworkStatusDispatcherContext.Provider value={dispatcher}>
        {children}
      </ApolloNetworkStatusDispatcherContext.Provider>
    </ApolloProvider>
  );
}

export default withApollo(ApolloNetworkStatusProvider);
