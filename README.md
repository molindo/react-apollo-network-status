# react-apollo-network-status

> Brings information about the global network status from Apollo into React.

This library helps with implementing global loading indicators like progress bars or adding global error handling, so you don't have to respond to every error in a component that invokes an operation.

## Usage

```js
import React from 'react';
import ReactDOM from 'react-dom';
import {ApolloClient} from 'apollo-client';
import {createHttpLink} from 'apollo-link-http';
import {ApolloProvider} from 'react-apollo';
import {ApolloNetworkStatusProvider, useApolloNetworkStatus} from 'react-apollo-network-status';

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
  link: createHttpLink()
});

const element = (
  <ApolloProvider client={client}>
    <ApolloNetworkStatusProvider>
      <GlobalLoadingIndicator />
      <App />
    </ApolloNetworkStatusProvider>
  </ApolloProvider>
);
ReactDOM.render(element, document.getElementById('root'));
```

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

type OperationError = {
  networkError?: Error | ServerError | ServerParseError;
  operation?: Operation;
  response?: ExecutionResult;
  graphQLErrors?: ReadonlyArray<GraphQLError>;
};
```

The error objects have the same structure as the one provided by [apollo-link-error](https://github.com/apollographql/apollo-link/tree/master/packages/apollo-link-error). Subscriptions currently don't affect the status returned by `useApolloNetworkStatus`.


Useful applications are for example integrating with [NProgress.js](http://ricostacruz.com/nprogress/) or showing errors with [snackbars from Material UI](http://www.material-ui.com/#/components/snackbar).

## Advanced usage

### Opt-out for operations

The default configuration allows ignoring particular operations by setting a context variable:

```js
// Somewhere in a React component
mutate({context: {useApolloNetworkStatus: false}});
```

### Bubbling

You can nest multiple `<ApolloNetworkStatusProvider />` inside each other. For example:

```jsx
<ApolloProvider client={client}>
  <ApolloNetworkStatusProvider>
    <SomeComponentWithAQuery />
    <LoadingIndicator />

    <ApolloNetworkStatusProvider>
      {/* When this query begins to load only the indicator below will be triggered. */}
      <AnotherComponentWithAQuery />
      <LoadingIndicator />
    </ApolloNetworkStatusProvider>

  </ApolloNetworkStatusProvider>
</ApolloProvider>
```

In this example `<LoadingIndicator />` calls `useApolloNetworkStatus`. By default, the operations fired from queries and mutations will only affect consumers of `useApolloNetworkStatus` below a given provider. You can enable bubbling in order to report network status to parents as well.

```jsx
<ApolloProvider client={client}>
  <ApolloNetworkStatusProvider>
    <SomeComponentWithAQuery />
    <LoadingIndicator />

    <ApolloNetworkStatusProvider enableBubbling>
      {/* When this query begins to load also the indicator above will be triggered. */}
      <AnotherComponentWithAQuery />
      <LoadingIndicator />
    </ApolloNetworkStatusProvider>

  </ApolloNetworkStatusProvider>
</ApolloProvider>
```

### Custom state

You can fully control how operations are mapped to state by providing a custom reducer to a separate low-level hook.

```tsx
import {ActionTypes, useApolloNetworkStatusReducer} from 'react-apollo-network-status';

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
