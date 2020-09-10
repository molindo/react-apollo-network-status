import {Operation, ServerError, ServerParseError} from '@apollo/client';
import {OperationTypeNode, ExecutionResult, GraphQLError} from 'graphql';
import {useMemo} from 'react';
import Dispatcher from './Dispatcher';
import ActionTypes from './ActionTypes';
import NetworkStatusAction from './NetworkStatusAction';
import useApolloNetworkStatusReducer from './useApolloNetworkStatusReducer';
import useEventCallback from './useEventCallback';

/**
 * Applies reasonable defaults to `useApolloNetworkStatusReducer`.
 */

export type OperationError = {
  networkError?: Error | ServerError | ServerParseError;
  operation: Operation;
  response?: ExecutionResult;
  graphQLErrors?: ReadonlyArray<GraphQLError>;
};

export type NetworkStatus = {
  numPendingQueries: number;
  numPendingMutations: number;
  queryError?: OperationError;
  mutationError?: OperationError;
};

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
    if (!isOperationType(action.payload.operation, type)) {
      return state;
    }

    switch (action.type) {
      case ActionTypes.REQUEST:
        return state + 1;

      case ActionTypes.ERROR:
      case ActionTypes.SUCCESS:
      case ActionTypes.CANCEL:
        // Just to be safe. See also the comment about `useEffect`
        // in `./useApolloNetworkStatusReducer.js`
        return Math.max(state - 1, 0);
    }

    return state;
  };
}

function latestOperationError(type: OperationTypeNode) {
  return function latestOperationErrorByType(
    state: OperationError | undefined,
    action: NetworkStatusAction
  ): OperationError | undefined {
    if (!isOperationType(action.payload.operation, type)) {
      return state;
    }

    switch (action.type) {
      case ActionTypes.REQUEST:
        return undefined;

      case ActionTypes.ERROR: {
        const {networkError, operation} = action.payload;
        return {networkError, operation};
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

const pendingQueries = pendingOperations('query');
const pendingMutations = pendingOperations('mutation');

const queryError = latestOperationError('query');
const mutationError = latestOperationError('mutation');

function reducer(
  state: NetworkStatus,
  action: NetworkStatusAction
): NetworkStatus {
  if (isOperationType(action.payload.operation, 'subscription')) {
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
  numPendingMutations: 0,
  queryError: undefined,
  mutationError: undefined
};

function defaultShouldHandleOperation(operation: Operation) {
  // Enable opt-out per operation
  return operation.getContext().useApolloNetworkStatus !== false;
}

export type UseApolloNetworkStatusOptions = {
  shouldHandleOperation?: (operation: Operation) => boolean;
};

export default function useApolloNetworkStatus(
  dispatcher: Dispatcher,
  options?: UseApolloNetworkStatusOptions
) {
  if (!options) options = {};
  const shouldHandleOperation =
    options.shouldHandleOperation || defaultShouldHandleOperation;

  // Performance optimization to allow changing this option
  // via props without causing the reducer to change.
  const shouldHandleOperationEventCallback = useEventCallback(
    shouldHandleOperation
  );

  const configuredReducer = useMemo(
    () => (state: NetworkStatus, action: NetworkStatusAction) => {
      if (!shouldHandleOperationEventCallback(action.payload.operation)) {
        return state;
      }

      return reducer(state, action);
    },
    [shouldHandleOperationEventCallback]
  );

  return useApolloNetworkStatusReducer(
    dispatcher,
    configuredReducer,
    initialState
  );
}
