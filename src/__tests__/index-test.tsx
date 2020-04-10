import {useQuery, ApolloProvider} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import React, {useState, useEffect} from 'react';
import {render, waitFor, fireEvent} from '@testing-library/react';
import 'regenerator-runtime/runtime.js';
import createClient from '../__testUtils__/createClient';
import NetworkStatusBoundary from '../../example/NetworkStatusBoundary';
import DataFetcher from '../../example/DataFetcher';
import {ApolloNetworkStatusProvider} from '..';

const testQuery = gql`
  query DataFetcher($id: ID!) {
    user(id: $id) {
      id
      name
    }
  }
`;

const Test = ({id}: {id: string}) => {
  const variables = {id};
  const result = useQuery(testQuery, {variables});

  let content;
  if (result.loading) {
    content = 'loading';
  } else if (result.error) {
    content = result.error.message;
  } else {
    content = result.data.user.id;
  }

  return <span>{content}</span>;
};

it('can handle queries in separate provider trees', async () => {
  const client = createClient();
  const {queryAllByText, container} = render(
    <ApolloProvider client={client}>
      <ApolloNetworkStatusProvider>
        <Test id="1" />
      </ApolloNetworkStatusProvider>
      <ApolloNetworkStatusProvider>
        <Test id="2" />
        <Test id="3" />
        <Test id="4" />
      </ApolloNetworkStatusProvider>
    </ApolloProvider>
  );

  await waitFor(() => {
    expect(queryAllByText('loading').length).toBe(0);
  });
  expect(container.textContent).toBe('1234');
});

fit('recognizes loading states when loading lazily', async () => {
  const client = createClient();
  const {getByText} = render(
    <ApolloProvider client={client}>
      <NetworkStatusBoundary>
        <DataFetcher />
      </NetworkStatusBoundary>
    </ApolloProvider>
  );

  getByText('Network status: Idle');
  fireEvent.click(getByText('Fetch'));
  getByText('Network status: Loading …');
  await waitFor(() => getByText('Network status: Idle'));
});

it('recognizes loading states when refetching', async () => {
  const client = createClient();
  const {getByText} = render(
    <ApolloProvider client={client}>
      <ApolloNetworkStatusProvider>
        <NetworkStatusBoundary>
          <DataFetcher />
        </NetworkStatusBoundary>
      </ApolloNetworkStatusProvider>
    </ApolloProvider>
  );

  getByText('Network status: Idle');
  fireEvent.click(getByText('Fetch'));
  await waitFor(() => getByText('Network status: Idle'));

  fireEvent.click(getByText('Refetch'));
  getByText('Network status: Loading …');
  await waitFor(() => getByText('Network status: Idle'));
});

it('recognizes loading states once a subscription is set up and the component fetches immediately', async () => {
  const client = createClient();

  function Component() {
    const [isChildVisible, setIsChildVisible] = useState(false);

    useEffect(() => {
      setIsChildVisible(true);
    }, []);

    return (
      <ApolloProvider client={client}>
        <ApolloNetworkStatusProvider>
          <NetworkStatusBoundary>
            {isChildVisible && <DataFetcher initialSkip={false} />}
          </NetworkStatusBoundary>
        </ApolloNetworkStatusProvider>
      </ApolloProvider>
    );
  }

  const {getByText} = render(<Component />);

  getByText('Network status: Loading …');
  await waitFor(() => getByText('Network status: Idle'));
});

it('recognizes loading states when variables change', async () => {
  const client = createClient();

  function Component({id}: {id?: string}) {
    return (
      <ApolloProvider client={client}>
        <ApolloNetworkStatusProvider>
          <NetworkStatusBoundary>
            <DataFetcher id={id} initialSkip={false} />
          </NetworkStatusBoundary>
        </ApolloNetworkStatusProvider>
      </ApolloProvider>
    );
  }

  const {getByText, rerender} = render(<Component />);

  getByText('Local status: Loading …');
  await waitFor(() => getByText('User: Jane'));

  rerender(<Component id="2" />);
  getByText('Local status: Loading …');
  getByText('Network status: Loading …');

  await waitFor(() => getByText('User: Jane'));
  getByText('Network status: Idle');
});

// fetchMore
// updateQuery
// startPolling
// stopPolling
// setOptions
// mutations
// what happens e.g. when variables change and there's a cache-first fetch policy? maybe it's ok if the observable gets another result immediately?
