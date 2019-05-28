import {ApolloLink, Observable, Operation, NextLink} from 'apollo-link';
import Dispatcher from './Dispatcher';
import ActionTypes from './ActionTypes';

export default class ApolloLinkNetworkStatus extends ApolloLink {
  dispatcher: Dispatcher;
  enableBubbling: boolean;

  constructor({
    dispatcher,
    enableBubbling
  }: {
    dispatcher: Dispatcher;
    enableBubbling?: boolean;
  }) {
    super();
    this.dispatcher = dispatcher;
    this.enableBubbling = enableBubbling === true;
  }

  request(operation: Operation, forward: NextLink) {
    const context = operation.getContext();

    let shouldDispatch = true;
    if (context.isNetworkStatusHandled !== true && !this.enableBubbling) {
      operation.setContext({isNetworkStatusHandled: true});
    } else {
      shouldDispatch = context.isNetworkStatusHandled !== true;
    }

    if (shouldDispatch) {
      this.dispatcher.dispatch({
        type: ActionTypes.REQUEST,
        payload: {operation}
      });
    }

    const subscriber = forward(operation);

    return new Observable(observer => {
      let isPending = true;

      const subscription = subscriber.subscribe({
        next: result => {
          isPending = false;

          if (shouldDispatch) {
            this.dispatcher.dispatch({
              type: ActionTypes.SUCCESS,
              payload: {operation, result}
            });
          }

          observer.next(result);
        },

        error: networkError => {
          isPending = false;

          if (shouldDispatch) {
            this.dispatcher.dispatch({
              type: ActionTypes.ERROR,
              payload: {operation, networkError}
            });
          }

          observer.error(networkError);
        },

        complete: observer.complete.bind(observer)
      });

      return () => {
        if (shouldDispatch && isPending) {
          this.dispatcher.dispatch({
            type: ActionTypes.CANCEL,
            payload: {operation}
          });
        }

        if (subscription) {
          subscription.unsubscribe();
        }
      };
    });
  }
}
