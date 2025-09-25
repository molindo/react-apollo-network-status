# react-apollo-network-status

> Brings information about the global network status from Apollo into React.

[<img src="https://img.shields.io/npm/dw/react-apollo-network-status.svg" />](https://www.npmjs.com/package/react-apollo-network-status)

This library helps with implementing global loading indicators like progress bars or adding global error handling, so you don't have to respond to every error in a component that invokes an operation.

## Apollo Client version compatibility

| react-apollo-network-status | Apollo Client |
| ----------------------------|---------------|
| 6                           | 4             |
| 5                           | 3             |
| 4, 3, 2                     | 2             |
| 1                           | 1             |

## Usage

```js
import React from 'react';
import ReactDOM from 'react-dom';
import {ApolloClient, InMemoryCache, HttpLink} from '@apollo/client';
import {ApolloProvider} from '@apollo/client/react';
import {createNetworkStatusNotifier} from 'react-apollo-network-status';

const {link, useApolloNetworkStatus} = createNetworkStatusNotifier();

function GlobalLoadingIndicator() {
  const status = useApolloNetworkStatus();

  if (status.numPendingQueries > 0) {
    return <p>Loading …</p>;
  } else {
    return null;
  }
}

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: link.concat(createHttpLink())
});

const element = (
  <ApolloProvider client={client}>
    <GlobalLoadingIndicator />
    <App />
  </ApolloProvider>
);
ReactDOM.render(element, document.getElementById('root'));
```

## Returned data

The hook `useApolloNetworkStatus` provides an object with the following properties:

```tsx
type NetworkStatus = {
  // The number of queries which are currently in flight.
  numPendingQueries: number;
  
  // The number of mutations which are currently in flight.
  numPendingMutations: number;

  // The latest query error that has occured. This will be reset once the next query starts.
  queryError?: OperationError;

  // The latest mutation error that has occured. This will be reset once the next mutation starts.
  mutationError?: OperationError;
};

export type OperationError = {
  networkError?: Error | ServerError | ServerParseError;
  operation: ApolloLink.Operation;
  response?: FormattedExecutionResult;
  graphQLErrors?: ReadonlyArray<GraphQLFormattedError>;
};
```

Subscriptions currently don't affect the status returned by `useApolloNetworkStatus`.

Useful applications are for example integrating with [NProgress.js](http://ricostacruz.com/nprogress/) or showing errors with [snackbars from Material UI](http://www.material-ui.com/#/components/snackbar).

## Advanced usage

### Limit handling to specific operations

The default configuration enables an **opt-out** behaviour per operation by setting a context variable:

```js
// Somewhere in a React component
mutate({context: {useApolloNetworkStatus: false}});
```

You can configure an **opt-in** behaviour by specifying an operation whitelist like this:

```js
// Inside the component handling the network events
useApolloNetworkStatus({
  shouldHandleOperation: (operation: Operation) =>
    operation.getContext().useApolloNetworkStatus === true
});

// Somewhere in a React component
mutate({context: {useApolloNetworkStatus: true}});
```

### Custom state

You can fully control how operations are mapped to state by providing a custom reducer to a separate low-level hook.

```tsx
const {link, useApolloNetworkStatusReducer} = createNetworkStatusNotifier();

const initialState = 0;

function reducer(state: number, action: NetworkStatusAction) {
  switch (action.type) {
    case ActionTypes.REQUEST:
      return state + 1;

    case ActionTypes.ERROR:
    case ActionTypes.SUCCESS:
    case ActionTypes.CANCEL:
      return state - 1;
  }
}

function GlobalLoadingIndicator() {
  const numPendingQueries = useApolloNetworkStatusReducer(reducer, initialState);
  return <p>Pending queries: {numPendingQueries}</p>;
}
```
