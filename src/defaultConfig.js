const isSubscriptionOperation = operation =>
  operation.query.definitions.some(
    definition =>
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
  );

export default {
  initialState: {numPendingRequests: 0, error: null},

  reducers: {
    onRequest: (state, {operation}) => {
      if (
        isSubscriptionOperation(operation) ||
        operation.getContext().useNetworkStatusNotifier === false
      ) {
        return state;
      }

      return {
        numPendingRequests: state.numPendingRequests + 1,
        error: null
      };
    },

    onSuccess: (state, {operation, result}) => {
      if (operation.getContext().useNetworkStatusNotifier === false) {
        return state;
      }

      return {
        numPendingRequests: isSubscriptionOperation(operation)
          ? state.numPendingRequests
          : state.numPendingRequests - 1,
        error: result.errors
          ? {
              graphQLErrors: result.errors,
              response: result,
              operation
            }
          : null
      };
    },

    onError: (state, {operation, networkError}) => {
      if (operation.getContext().useNetworkStatusNotifier === false) {
        return state;
      }

      return {
        numPendingRequests: isSubscriptionOperation(operation)
          ? state.numPendingRequests
          : state.numPendingRequests - 1,
        error: {
          graphQLErrors: networkError.result
            ? networkError.result.errors
            : undefined,
          networkError,
          operation
        }
      };
    },

    onCancel: (state, {operation}) => {
      if (
        isSubscriptionOperation(operation) ||
        operation.getContext().useNetworkStatusNotifier === false
      ) {
        return state;
      }

      return {
        numPendingRequests: state.numPendingRequests - 1
      };
    }
  },

  mapStateToProps: state => ({
    loading: state.numPendingRequests > 0,
    error: state.error
  })
};
