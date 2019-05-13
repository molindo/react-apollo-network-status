import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import augmentApolloClient from '../augmentApolloClient';
import Dispatcher from '../Dispatcher';
import createClient from '../__testUtils__/createClient';

const query = gql`
  query($id: ID!) {
    user(id: $id) {
      id
      name
    }
  }
`;

const mutation = gql`
  mutation updateUser($id: ID!, $user: UserInput!) {
    updateUser(id: $id, user: $user) {
      id
      name
    }
  }
`;

let augmentedClient: ApolloClient<any>;
let onDispatch: jest.Mock;
let dispatcher: Dispatcher;

beforeEach(() => {
  dispatcher = new Dispatcher();
  onDispatch = jest.fn();
  dispatcher.addListener(onDispatch);
  augmentedClient = augmentApolloClient({client: createClient(), dispatcher});
});

afterEach(() => {
  dispatcher.removeListener(onDispatch);
});

it('should be able to query', done => {
  augmentedClient.query({query, variables: {id: '1'}}).then(result => {
    expect(result.data.user).toEqual({
      __typename: 'User',
      id: '1',
      name: 'Jane'
    });

    expect(onDispatch.mock.calls).toEqual([
      [expect.objectContaining({type: 'REQUEST'})],
      [expect.objectContaining({type: 'SUCCESS'})]
    ]);

    done();
  });

  jest.runAllTimers();
});

it('should be able to watch a query', done => {
  const observable = augmentedClient.watchQuery({query, variables: {id: '1'}});

  const subscription = observable.subscribe(result => {
    expect(result.data.user).toEqual({
      __typename: 'User',
      id: '1',
      name: 'Jane'
    });
    expect(onDispatch.mock.calls).toEqual([
      [expect.objectContaining({type: 'REQUEST'})],
      [expect.objectContaining({type: 'SUCCESS'})]
    ]);

    subscription.unsubscribe();
    done();
  });

  jest.runAllTimers();
});

it('should be able to mutate', done => {
  augmentedClient
    .mutate({
      mutation,
      variables: {id: '1', user: {name: 'John'}}
    })
    .then(result => {
      expect(result.data.updateUser).toEqual({
        __typename: 'User',
        id: '1',
        name: 'John'
      });
      expect(onDispatch.mock.calls).toEqual([
        [expect.objectContaining({type: 'REQUEST'})],
        [expect.objectContaining({type: 'SUCCESS'})]
      ]);

      done();
    });

  jest.runAllTimers();
});
