import flow from 'lodash.flow';
import defaultConfig from '../defaultConfig';

it('exposes `numPendingRequests` as a `loading` property', () => {
  const props = defaultConfig.mapStateToProps({
    numPendingRequests: 2,
    error: null
  });

  expect(props).toEqual({
    loading: true,
    error: null
  });
});

describe('reducers', () => {
  const {
    initialState,
    reducers: {onRequest, onSuccess, onError}
  } = defaultConfig;
  const operation = {getContext: () => ({})};
  const request = state => onRequest(state, {operation});
  const networkError = state =>
    onError(state, {
      operation,
      networkError: new Error('Client is offline')
    });
  const graphqlError = state =>
    onSuccess(state, {
      operation,
      result: {
        errors: [{message: 'Resolver blew up.'}]
      }
    });
  const success = state =>
    onSuccess(state, {
      operation,
      result: {
        data: {foo: true}
      }
    });

  it('detects network errors', () => {
    const state = flow(request, networkError)(initialState);

    expect(state).toEqual({
      numPendingRequests: 0,
      error: {
        networkError: new Error('Client is offline'),
        operation
      }
    });
  });

  it('detects GraphQL errors', () => {
    const state = flow(request, graphqlError)(initialState);

    expect(state).toEqual({
      numPendingRequests: 0,
      error: {
        graphQLErrors: [{message: 'Resolver blew up.'}],
        operation,
        response: {errors: [{message: 'Resolver blew up.'}]}
      }
    });
  });

  it('keeps track of how many requests are in flight', () => {
    let state = request(initialState);
    expect(state.numPendingRequests).toBe(1);

    state = request(state);
    expect(state.numPendingRequests).toBe(2);

    state = networkError(state);
    expect(state.numPendingRequests).toBe(1);

    state = success(state);
    expect(state.numPendingRequests).toBe(0);

    state = flow(request, request)(state);
    expect(state.numPendingRequests).toBe(2);

    state = graphqlError(state);
    expect(state.numPendingRequests).toBe(1);
  });

  it('recovers from errors', () => {
    let state = flow(request, graphqlError, request)(initialState);
    expect(state.error).toBe(null);

    state = flow(request, networkError, request)(initialState);
    expect(state.error).toBe(null);
  });

  it('ignores operations with `useNetworkStatusNotifier` set to false', () => {
    const ignoredRequest = state =>
      onRequest(state, {
        operation: {getContext: () => ({useNetworkStatusNotifier: false})}
      });
    const ignoredNetworkError = state =>
      onError(state, {
        operation: {getContext: () => ({useNetworkStatusNotifier: false})}
      });
    const ignoredGraphqlError = state =>
      onSuccess(state, {
        operation: {getContext: () => ({useNetworkStatusNotifier: false})}
      });
    const ignoredSuccess = state =>
      onSuccess(state, {
        operation: {getContext: () => ({useNetworkStatusNotifier: false})}
      });

    const state = {};
    const nextState = flow(
      ignoredRequest,
      ignoredNetworkError,
      ignoredGraphqlError,
      ignoredSuccess
    )(state);
    expect(state).toBe(nextState);
  });
});
