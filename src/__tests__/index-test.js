import React from 'react';
import {mount} from 'enzyme';
import gql from 'graphql-tag';
import {ApolloLink, execute, Observable} from 'apollo-link';
import {createNetworkStatusNotifier} from '../index';
import defaultConfig from '../defaultConfig';

it('brings information about the network status into react', done => {
  const {
    link: networkStatusLink,
    NetworkStatusNotifier
  } = createNetworkStatusNotifier({
    initialState: {numPendingRequests: 0},
    reducers: {
      onRequest: state => ({
        numPendingRequests: state.numPendingRequests + 1
      }),
      onSuccess: state => ({
        numPendingRequests: state.numPendingRequests - 1
      }),
      onError: state => ({
        numPendingRequests: state.numPendingRequests - 1
      })
    },
    mapStateToProps: state => ({
      loading: state.numPendingRequests > 0
    })
  });

  expect(networkStatusLink).toBeTruthy();
  expect(NetworkStatusNotifier).toBeTruthy();

  const tree = mount(
    <NetworkStatusNotifier
      render={({loading}) => (loading ? 'loading' : 'not loading')}
    />
  );

  const mockLink = new ApolloLink(
    () =>
      new Observable(observer => {
        setTimeout(() => {
          observer.next({data: {foo: true}});
        });
      })
  );
  const link = networkStatusLink.concat(mockLink);
  const query = gql`
    {
      foo
    }
  `;

  execute(link, {query}).subscribe(result => {
    expect(result).toEqual({data: {foo: true}});
    expect(tree.text()).toBe('not loading');
    done();
  });

  expect(tree.text()).toBe('loading');
  jest.runAllTimers();
});

it('throws for incomplete config', () => {
  const config = {...defaultConfig, reducers: undefined};
  const fn = () => createNetworkStatusNotifier(config);
  expect(fn).toThrow('`reducers` are mandatory.');
});
