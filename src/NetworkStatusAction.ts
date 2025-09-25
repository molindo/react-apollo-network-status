import {ServerError, ServerParseError, ApolloLink} from '@apollo/client';
import {FormattedExecutionResult} from 'graphql';
import ActionTypes from './ActionTypes';

interface Action {
  type: ActionTypes;
}

interface NetworkStatusActionRequest extends Action {
  type: typeof ActionTypes.REQUEST;
  payload: {
    operation: ApolloLink.Operation;
  };
}

interface NetworkStatusActionError extends Action {
  type: typeof ActionTypes.ERROR;
  payload: {
    operation: ApolloLink.Operation;
    networkError: Error | ServerError | ServerParseError;
  };
}

interface NetworkStatusActionSuccess extends Action {
  type: typeof ActionTypes.SUCCESS;
  payload: {
    operation: ApolloLink.Operation;
    result: FormattedExecutionResult;
  };
}

interface NetworkStatusActionCancel extends Action {
  type: typeof ActionTypes.CANCEL;
  payload: {
    operation: ApolloLink.Operation;
  };
}

type NetworkStatusAction =
  | NetworkStatusActionRequest
  | NetworkStatusActionError
  | NetworkStatusActionSuccess
  | NetworkStatusActionCancel;

export default NetworkStatusAction;
