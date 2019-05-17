import {Operation} from 'apollo-link';
import {OperationTypeNode, ExecutionResult, GraphQLError} from 'graphql';
import {ServerError, ServerParseError} from 'apollo-link-http-common';
import ActionTypes from './ActionTypes';
import {NetworkStatusAction} from './NetworkStatusAction';
import useApolloNetworkStatusReducer from './useApolloNetworkStatusReducer';

/**
 * Applies reasonable defaults to `useApolloNetworkStatusReducer`.
 */

function isOperationType(operation: Operation, type: OperationTypeNode) {
  return operation.query.definitions.some(
    definition =>
      definition.kind === 'OperationDefinition' && definition.operation === type
  );
}

function pendingOperations(type: OperationTypeNode) {
  return function pendingOperationsByType(
    state: number = 0,
    action: NetworkStatusAction
  ) {
    if (!action.payload || !isOperationType(action.payload.operation, type)) {
      return state;
    }

    switch (action.type) {
      case ActionTypes.REQUEST:
        return state + 1;

      case ActionTypes.ERROR:
      case ActionTypes.SUCCESS:
      case ActionTypes.CANCEL:
        // Just to be safe. See also useApolloNetworkStatusReducer:27.
        return Math.max(state - 1, 0);
    }

    return state;
  };
}

type OperationError = {
  networkError?: Error | ServerError | ServerParseError;
  operation?: Operation;
  response?: ExecutionResult;
  graphQLErrors?: ReadonlyArray<GraphQLError>;
};

function latestOperationError(type: OperationTypeNode) {
  return function latestOperationErrorByType(
    state: OperationError | undefined,
    action: NetworkStatusAction
  ): OperationError | undefined {
    if (!action.payload || !isOperationType(action.payload.operation, type)) {
      return state;
    }

    switch (action.type) {
      case ActionTypes.REQUEST:
        return undefined;

      case ActionTypes.ERROR: {
        const {networkError, result, operation} = action.payload;
        return {networkError, operation, response: result};
      }

      case ActionTypes.SUCCESS: {
        const {result, operation} = action.payload;

        if (result && result.errors) {
          return {graphQLErrors: result.errors, response: result, operation};
        } else {
          return state;
        }
      }
    }

    return state;
  };
}

function isOptOut(action: NetworkStatusAction) {
  return (
    action.payload &&
    action.payload.operation.getContext().useApolloNetworkStatus === false
  );
}

const pendingQueries = pendingOperations('query');
const pendingMutations = pendingOperations('mutation');

const queryError = latestOperationError('query');
const mutationError = latestOperationError('mutation');

type NetworkStatus = {
  numPendingQueries: number;
  numPendingMutations: number;
  queryError?: OperationError;
  mutationError?: OperationError;
};

function reducer(
  state: NetworkStatus,
  action: NetworkStatusAction
): NetworkStatus {
  const isSubscription =
    action.payload && isOperationType(action.payload.operation, 'subscription');

  if (isOptOut(action) || isSubscription) {
    return state;
  }

  const updatedState = {...state};

  // Pending operations
  updatedState.numPendingQueries = pendingQueries(
    updatedState.numPendingQueries,
    action
  );
  updatedState.numPendingMutations = pendingMutations(
    updatedState.numPendingMutations,
    action
  );

  // Latest errors
  updatedState.queryError = queryError(updatedState.queryError, action);
  updatedState.mutationError = mutationError(
    updatedState.mutationError,
    action
  );

  // The identity of the state should be kept if possible to avoid unnecessary re-renders.
  const haveValuesChanged = Object.keys(state).some(
    key => (updatedState as any)[key] !== (state as any)[key]
  );
  return haveValuesChanged ? updatedState : state;
}

const initialState: NetworkStatus = {
  numPendingQueries: 0,
  numPendingMutations: 0
};

export default function useApolloNetworkStatus() {
  return useApolloNetworkStatusReducer(reducer, initialState);
}
