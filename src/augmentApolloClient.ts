import ApolloClient, {
  WatchQueryOptions,
  QueryOptions,
  ObservableQuery,
  NetworkStatus
} from 'apollo-client';
import {Operation, getOperationName, createOperation} from 'apollo-link';
import Dispatcher from './Dispatcher';
import ActionTypes from './ActionTypes';

/**
 * Maintainer notice: The goal here is to create a new Apollo Client instance
 * which has the network status link added. Instantiating a new client doesn't
 * work, as otherwise it would have a separate cache – this would lead to
 * mutation results not being incorporated everywhere. Providing the cache
 * during initialization isn't enough, probably due to separate internal
 * `QueryManager` instances (they have a list of queries to notify after a
 * mutation result).
 *
 * The approach here is to copy the instance along with all its configuration
 * and to patch the link on the new instance.
 */

function cloneInstance<T>(original: T): T {
  const prototype = Object.getPrototypeOf(original);
  return Object.assign(Object.create(prototype), original);
}

function wrapSubscribe({
  operation,
  dispatcher,
  observableQuery
}: {
  operation: Operation;
  dispatcher: Dispatcher;
  observableQuery: ObservableQuery;
}) {
  return (
    observerOrNext: ((value: any) => void) | ZenObservable.Observer<any>,
    error?: (error: any) => void,
    complete?: () => void
  ): ZenObservable.Subscription => {
    console.log('subscribe');
    const shouldDispatch = true;
    let isPending = true;

    let observer: ZenObservable.Observer<any>;
    if (typeof observerOrNext === 'function') {
      observer = {
        next: observerOrNext,
        error,
        complete
      };
    } else {
      observer = observerOrNext;
    }

    dispatcher.dispatch({
      type: ActionTypes.REQUEST,
      payload: {operation}
    });

    const subscription = observableQuery.subscribe({
      next(result) {
        isPending = false;

        if (shouldDispatch && result.networkStatus === NetworkStatus.ready) {
          dispatcher.dispatch({
            type: ActionTypes.SUCCESS,
            payload: {operation, result}
          });
        }

        if (observer.next) {
          observer.next(result);
        }
      },

      error(networkError) {
        isPending = false;

        if (shouldDispatch) {
          dispatcher.dispatch({
            type: ActionTypes.ERROR,
            payload: {operation, networkError}
          });
        }

        if (observer.error) {
          observer.error(networkError);
        }
      },

      complete() {
        if (observer.complete) {
          observer.complete();
        }
      }
    });

    return {
      ...subscription,
      unsubscribe() {
        if (shouldDispatch && isPending) {
          dispatcher.dispatch({
            type: ActionTypes.CANCEL,
            payload: {operation}
          });
        }

        subscription.unsubscribe();
      }
    };
  };
}

export default function augmentApolloClient({
  client,
  dispatcher,
  enableBubbling
}: {
  client: ApolloClient<any>;
  dispatcher: Dispatcher;
  enableBubbling?: boolean;
}): ApolloClient<any> {
  const augmentedClient = cloneInstance(client);

  augmentedClient.watchQuery = (options: WatchQueryOptions<any>) => {
    const observableQuery = client.watchQuery(options);

    const operation = createOperation(options.context, {
      query: options.query,
      context: options.context,
      operationName: getOperationName(options.query) || 'query',
      variables: options.variables
    });

    // client.queryManager;

    const augmentedObservableQuery = cloneInstance(observableQuery);
    const augmentedQueryManager = cloneInstance(client.queryManager);

    augmentedObservableQuery.queryManager = augmentedQueryManager;

    augmentedObservableQuery.setOptions = options => {
      console.log('set options', {options});
      // Only the request needs to be dispatched, the success
      // and error state is handled by the subscription.
      dispatcher.dispatch({
        type: ActionTypes.REQUEST,
        payload: {operation}
      });

      return observableQuery.setOptions(options);
    };

    augmentedObservableQuery.refetch = variables => {
      console.log('refetch');

      // Only the request needs to be dispatched, the success
      // and error state is handled by the subscription.
      dispatcher.dispatch({
        type: ActionTypes.REQUEST,
        payload: {operation}
      });

      return observableQuery.refetch(variables);
    };

    augmentedObservableQuery.subscribe = wrapSubscribe({
      operation,
      dispatcher,
      observableQuery
    });

    return augmentedObservableQuery;
  };

  return augmentedClient;
}
