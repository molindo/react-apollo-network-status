# Changelog

## 3.0

### New features

 - Support for `@apollo/react-*` packages.
 - Export `NetworkStatus` and `OperationError` types for TypeScript users.

### Breaking changes

 - Raised required peer dependency version of `apollo-client` to `^2.6.0`.
 - You need to depend on a React integration from one of the `@apollo/react-*` packages. See [upgrade guide](https://www.apollographql.com/docs/react/migrating/hooks-migration/).

## 2.0

### New features

 - Use hooks for reading the network status.
 - Simplified API, so you no longer have to setup the link manually.
 - TypeScript support.
 - The reported network status is now more granular, allowing for more flexible usage.
 - You can now scope the reporting of the network status to a subtree instead of being forced to handle all operations globally.
 - You can nest the new `<ApolloNetworkStatusProvider />` in order to have multiple boundaries where network status will be reported (with optional bubbling configurable with the `enableBubbling` prop).

### Breaking changes

 - Updated peer dependencies. Please make sure you fulfill them.
 - The network status can only be read within the `<ApolloProvider />`.
 - Queries now only reset the new `queryError` property if it was present before (same for mutations). Previously there was only a single `error` property which was affected by both types of operations.
 - The opt-out property `context: {useNetworkStatusNotifier: false}` was renamed to `useApolloNetworkStatus`.
 - If you provide a custom reducer, there's now a new signature where you only provide one function which handles action types instead of separate functions. This pattern composes better since you usually have to cover all network events to implement a given feature.

## 1.0

Initial stable release
