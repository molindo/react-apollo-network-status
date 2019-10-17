import React, {useMemo, ReactNode, useContext} from 'react';
import {ApolloProvider, getApolloContext} from '@apollo/react-common';
import Dispatcher from './Dispatcher';
import ApolloNetworkStatusDispatcherContext from './ApolloNetworkStatusDispatcherContext';
import augmentApolloClient from './augmentApolloClient';

type Props = {
  children: ReactNode;
  enableBubbling?: boolean;
};

function ApolloNetworkStatusProvider({children, enableBubbling}: Props) {
  const {client} = useContext(getApolloContext());
  const dispatcher = useMemo(() => new Dispatcher(), []);

  if (!client) {
    throw new Error(
      '`ApolloNetworkStatusProvider` needs to be placed below `ApolloProvider`.'
    );
  }

  const augmentedClient = useMemo(
    () => augmentApolloClient({client, dispatcher, enableBubbling}),
    [client, dispatcher, enableBubbling]
  );

  return (
    <ApolloProvider client={augmentedClient}>
      <ApolloNetworkStatusDispatcherContext.Provider value={dispatcher}>
        {children}
      </ApolloNetworkStatusDispatcherContext.Provider>
    </ApolloProvider>
  );
}

export default ApolloNetworkStatusProvider;
