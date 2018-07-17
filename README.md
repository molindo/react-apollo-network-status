# react-apollo-network-status

> Brings information about the global network status from Apollo into React.

This library helps to implement global loading indicators like progress bars or adding global error handling, so you don't have to respond to every error in a component that invokes an operation.

## Usage

```js
import React, {Fragment} from 'react';
import ReactDOM from 'react-dom';
import {ApolloClient} from 'apollo-client';
import {createNetworkStatusNotifier} from 'react-apollo-network-status';
import {createHttpLink} from 'apollo-link-http';

const {
  NetworkStatusNotifier,
  link: networkStatusNotifierLink
} = createNetworkStatusNotifier();

const client = new ApolloClient({
  link: networkStatusNotifierLink.concat(createHttpLink())
});

// Render the notifier along with the app. The `NetworkStatusNotifier`
// can be placed anywhere (also outside of ApolloProvider).
const element = (
  <ApolloProvider client={client}>
    <NetworkStatusNotifier render={({loading, error}) => (
      <div>
        {loading && <p>Loading …</p>}
        {error && <p>Error: {JSON.stringify(error)}</p>}
      </div>
    )} />
    <App />
  </ApolloProvider>
);
const node = document.getElementById('root');
ReactDOM.render(element, node);
```

The `NetworkStatusNotifier` provides a [render prop](https://cdb.reacttraining.com/use-a-render-prop-50de598f11ce#cf12) which exposes the following properties:
 - `loading`: `boolean`
 - `error`:
   - `operation`: [`Operation`](https://github.com/apollographql/apollo-link/blob/8ceba7322b533a26ea1e886aba5faa6af1937232/packages/apollo-link/src/types.ts#L12)
   - `response?`: [`ExecutionResult`](https://github.com/graphql/graphql-js/blob/358df97ac00f6abf7591277853e0e828a13a28bb/src/execution/execute.js#L108)
   - `graphQLErrors?`: [`GraphQLError[]`](https://github.com/graphql/graphql-js/blob/358df97ac00f6abf7591277853e0e828a13a28bb/src/error/GraphQLError.js#L22)
   - `networkError?`: [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)

The `loading` property will be `true` when there is at least one pending query or mutation. Note that subscriptions don't affect this property, however they can potentially set the `error` property.

The `error` object has the same structure, as the one provided by [apollo-link-error](https://github.com/apollographql/apollo-link/tree/master/packages/apollo-link-error).

By default the `error` will be set to `null` when a new operation is started.

Useful applications are for example integrating with [NProgress.js](http://ricostacruz.com/nprogress/) or showing errors with [snackbars from Material UI](http://www.material-ui.com/#/components/snackbar).

## Advanced usage

### Configuration

There are a few properties which can be configured:

```js
createNetworkStatusNotifier({
  initialState: {numPendingRequests: 0},

  // These are pure functions that map the state to the next
  // state depending on the current operation and its result.
  reducers: {
    onRequest: (state, {operation}) => ({
      numPendingRequests: state.numPendingRequests + 1
    }),
    onSuccess: (state, {operation, result}) => ({
      numPendingRequests: state.numPendingRequests - 1
    }),
    onError: (state, {operation, networkError}) => ({
      numPendingRequests: state.numPendingRequests - 1
    }),
    onCancel: (state, {operation, networkError}) => ({
      numPendingRequests: state.numPendingRequests - 1
    })
  },

  // Takes the state and maps it to a different data structure
  // that will be provided by the render prop (optional).
  mapStateToProps: state => ({
    loading: state.numPendingRequests > 0
  })
});
```

### Opt-out for operations

The default configuration allows ignoring particular operations by setting a context variable:

```js
// Somewhere in a React component
mutate({context: {useNetworkStatusNotifier: false}});
```

You can also choose to only consider particular operation types like mutations if you handle query errors in the components themselves. For this to work, you can provide a custom configuration that contains code like this:

```js
reducers: {
  // ... other reducers

  onError: (state, {operation}) => {
    const isMutation = operation.query.definitions.some(definition =>
      definition.kind === 'OperationDefinition'
      && definition.operation === 'mutation'
    );

    // Returning the previous state means no update necessary.
    if (!isMutation) return state;

    // ...
  }
}
```
