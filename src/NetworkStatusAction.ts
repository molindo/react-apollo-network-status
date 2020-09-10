import {Operation, ServerError, ServerParseError} from '@apollo/client';
import {ExecutionResult} from 'graphql';
import ActionTypes from './ActionTypes';

interface Action {
  type: ActionTypes;
}

interface NetworkStatusActionRequest extends Action {
  type: typeof ActionTypes.REQUEST;
  payload: {
    operation: Operation;
  };
}

interface NetworkStatusActionError extends Action {
  type: typeof ActionTypes.ERROR;
  payload: {
    operation: Operation;
    networkError: Error | ServerError | ServerParseError;
  };
}

interface NetworkStatusActionSuccess extends Action {
  type: typeof ActionTypes.SUCCESS;
  payload: {
    operation: Operation;
    result: ExecutionResult;
  };
}

interface NetworkStatusActionCancel extends Action {
  type: typeof ActionTypes.CANCEL;
  payload: {
    operation: Operation;
  };
}

type NetworkStatusAction =
  | NetworkStatusActionRequest
  | NetworkStatusActionError
  | NetworkStatusActionSuccess
  | NetworkStatusActionCancel;

export default NetworkStatusAction;
