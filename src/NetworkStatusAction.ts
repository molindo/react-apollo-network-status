import {Operation, ExecutionResult} from 'apollo-link';
import {GraphQLError} from 'graphql';
import {ServerError, ServerParseError} from 'apollo-link-http-common';
import ActionTypes from './ActionTypes';

export type NetworkStatusAction = {
  type:
    | typeof ActionTypes.REQUEST
    | typeof ActionTypes.ERROR
    | typeof ActionTypes.SUCCESS
    | typeof ActionTypes.CANCEL;
  payload?: {
    operation: Operation;
    result?: ExecutionResult;
    graphqlErrors?: GraphQLError[];
    networkError?: Error | ServerError | ServerParseError;
  };
};
