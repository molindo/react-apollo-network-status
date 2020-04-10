# Changelog

## 5.0

### Breaking changes

- The library now supports [the new `@apollo/client@3`](https://www.apollographql.com/docs/react/v3.0-beta/migrating/apollo-client-3-migration/). Older versions are no longer supported.

## 4.0

### Improvements

- Improved types for `NetworkStatusAction`.
- A more reliable integration with the Apollo cache. This fixes [#22](https://github.com/molindo/react-apollo-network-status/issues/22) and [#28](https://github.com/molindo/react-apollo-network-status/issues/28).

### Breaking changes

- The usage of the library has changed from using a provider to configuring a link that needs to be passed to the `ApolloClient` constructor (see [README](https://github.com/molindo/react-apollo-network-status/tree/compatibility-apollo-3)).
- Scoping network status handling to a subtree was removed along with the `enableBubbling` option. The network status handling is scoped to the usage of the `ApolloClient` instance.

## 3.0

### New features

 - Support for `@apollo/react-*` packages.
 - Export `NetworkStatus` and `OperationError` types for TypeScript users.

### Breaking changes

 - Raised required peer dependency version of `apollo-client` to `^2.6.0`.
 - You need to depend on a React integration from one of the `@apollo/react-*` packages. See [upgrade guide](https://www.apollographql.com/docs/react/migrating/hooks-migration/).

Special thanks to [Matth10](https://github.com/Matth10), [rcohen-unext](https://github.com/rcohen-unext) and [MasterKale](https://github.com/MasterKale) for beta testing this release in their apps and code review.

## 2.0

Compatible with `react-apollo@^2`. See [usage instructions](https://github.com/molindo/react-apollo-network-status/tree/e08e7b43e2e3447ec0d9399262d17b162162805e#react-apollo-network-status).

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

## 1.1

Subscription operations no longer affect the loading property, but they can potentially set the error property (@shurik239 in [#9](https://github.com/molindo/react-apollo-network-status/pull/9)).

## 1.0

Compatible with `react-apollo@<=2`. See [usage instructions](https://github.com/molindo/react-apollo-network-status/tree/583a00f6344e05edcfee90bee0823a7736f56021#react-apollo-network-status).

Initial stable release.
