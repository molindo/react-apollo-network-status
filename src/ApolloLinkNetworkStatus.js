import {ApolloLink, Observable} from 'apollo-link';

export default class ApolloLinkNetworkStatus extends ApolloLink {
  store;

  constructor({store}) {
    super();
    this.store = store;
  }

  request(operation, forward) {
    this.store.onRequest({operation});
    const subscriber = forward(operation);

    return new Observable(observer => {
      const subscription = subscriber.subscribe({
        next: result => {
          this.store.onSuccess({operation, result});
          observer.next(result);
        },
        error: networkError => {
          this.store.onError({operation, networkError});
          observer.error(networkError);
        },
        complete: observer.complete.bind(observer)
      });

      return () => {
        if (subscription) subscription.unsubscribe();
      };
    });
  }
}
