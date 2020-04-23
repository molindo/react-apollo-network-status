import {
  ApolloLink,
  Observable,
  Operation,
  NextLink,
  FetchResult
} from 'apollo-link';
import Dispatcher from './Dispatcher';
import ActionTypes from './ActionTypes';

export default class ApolloLinkNetworkStatus extends ApolloLink {
  dispatcher: Dispatcher;

  constructor(dispatcher: Dispatcher) {
    super();
    this.dispatcher = dispatcher;
  }

  request(operation: Operation, forward: NextLink): Observable<FetchResult> {
    this.dispatcher.dispatch({
      type: ActionTypes.REQUEST,
      payload: {operation}
    });

    const subscriber = forward(operation);

    return new Observable(observer => {
      let isPending = true;

      const subscription = subscriber.subscribe({
        next: result => {
          isPending = false;

          this.dispatcher.dispatch({
            type: ActionTypes.SUCCESS,
            payload: {operation, result}
          });

          observer.next(result);
        },

        error: networkError => {
          isPending = false;

          this.dispatcher.dispatch({
            type: ActionTypes.ERROR,
            payload: {operation, networkError}
          });

          observer.error(networkError);
        },

        complete: observer.complete.bind(observer)
      });

      return () => {
        if (isPending) {
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
