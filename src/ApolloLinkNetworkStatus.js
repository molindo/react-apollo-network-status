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
      let isPending = true;

      const subscription = subscriber.subscribe({
        next: result => {
          isPending = false;
          this.store.onSuccess({operation, result});
          observer.next(result);
        },
        error: networkError => {
          isPending = false;
          this.store.onError({operation, networkError});
          observer.error(networkError);
        },
        complete: observer.complete.bind(observer)
      });

      return () => {
        if (isPending) this.store.onCancel({operation});
        if (subscription) subscription.unsubscribe();
      };
    });
  }
}
