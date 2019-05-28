import {useEffect, useRef, useMemo} from 'react';
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
    if (!isOperationType(action.payload.operation, type)) {
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
    if (!isOperationType(action.payload.operation, type)) {
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

export default function useApolloNetworkStatus(options?: {
  shouldHandleOperation?: (operation: Operation) => boolean;
}) {
  if (!options) options = {};
  const shouldHandleOperation =
    options.shouldHandleOperation || defaultShouldHandleOperation;

  // Assigning this to a separate ref is a performance optimization to allow
  // changing this option via props without causing the reducer to change.
  const shouldHandleOperationRef = useRef(shouldHandleOperation);

  useEffect(() => {
    if (shouldHandleOperation !== shouldHandleOperationRef.current) {
      shouldHandleOperationRef.current = shouldHandleOperation;
    }
  }, [options, shouldHandleOperation]);

  const configuredReducer = useMemo(
    () => (state: NetworkStatus, action: NetworkStatusAction) => {
      if (!shouldHandleOperationRef.current(action.payload.operation)) {
        return state;
      }

      return reducer(state, action);
    },
    []
  );

  return useApolloNetworkStatusReducer(configuredReducer, initialState);
}
