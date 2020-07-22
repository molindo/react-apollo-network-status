import {ApolloProvider, ApolloClient, InMemoryCache} from '@apollo/client';
import {SchemaLink} from '@apollo/client/link/schema';
import {render, waitFor, fireEvent} from '@testing-library/react';
import React from 'react';
import 'regenerator-runtime/runtime.js';
import DataFetcher from '../../example/DataFetcher';
import LazyRender from '../../example/LazyRender';
import NetworkStatusReporter from '../../example/NetworkStatusReporter';
import DataUpdater from '../../example/DataUpdater';
import schema from '../../example/schema';
import {createNetworkStatusNotifier} from '..';

let ConfiguredApolloProvider: any;
let ConfiguredNetworkStatusReporter: any;
beforeEach(() => {
  const networkStatusNotifier = createNetworkStatusNotifier();

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: networkStatusNotifier.link.concat(new SchemaLink({schema}))
  });

  ConfiguredApolloProvider = ({children}: any) => (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );
  ConfiguredNetworkStatusReporter = ({initialOptIn}: any) => (
    <NetworkStatusReporter
      initialOptIn={initialOptIn}
      useApolloNetworkStatus={networkStatusNotifier.useApolloNetworkStatus}
    />
  );
});

it('recognizes loading states when fetching lazily', async () => {
  const {getByText} = render(
    <ConfiguredApolloProvider>
      <ConfiguredNetworkStatusReporter />
      <DataFetcher />
    </ConfiguredApolloProvider>
  );

  getByText('Local status: Idle');
  getByText('Network status: Idle');
  fireEvent.click(getByText('Fetch'));
  await waitFor(() => getByText('Local status: Loading …'));
  await waitFor(() => getByText('Network status: Loading …'));
  await waitFor(() => getByText('User: Jane'));
  await waitFor(() => getByText('Network status: Idle'));
});

it('recognizes loading states once a subscription is set up and the component fetches immediately', async () => {
  const {getByText} = render(
    <ConfiguredApolloProvider>
      <ConfiguredNetworkStatusReporter />
      <LazyRender>
        <DataFetcher initialSkip={false} />
      </LazyRender>
    </ConfiguredApolloProvider>
  );

  await waitFor(() => getByText('Local status: Loading …'));
  await waitFor(() => getByText('Network status: Loading …'));
  await waitFor(() => getByText('User: Jane'));
  await waitFor(() => getByText('Network status: Idle'));
});

it('recognizes loading states when refetching', async () => {
  const {getByText} = render(
    <ConfiguredApolloProvider>
      <ConfiguredNetworkStatusReporter />
      <DataFetcher initialSkip={false} />
    </ConfiguredApolloProvider>
  );

  await waitFor(() => getByText('User: Jane'));
  fireEvent.click(getByText('Refetch'));
  await waitFor(() => getByText('Local status: Loading …'));
  await waitFor(() => getByText('Network status: Loading …'));

  await waitFor(() => getByText('User: Jane'));
  await waitFor(() => getByText('Network status: Idle'));
});

it('recognizes loading states when variables change', async () => {
  function Component({id}: {id?: string}) {
    return (
      <ConfiguredApolloProvider>
        <ConfiguredNetworkStatusReporter />
        <DataFetcher id={id} initialSkip={false} />
      </ConfiguredApolloProvider>
    );
  }

  const {getByText, rerender} = render(<Component />);

  await waitFor(() => getByText('Local status: Loading …'));
  await waitFor(() => getByText('User: Jane'));

  rerender(<Component id="2" />);
  await waitFor(() => getByText('Local status: Loading …'));
  await waitFor(() => getByText('Network status: Loading …'));

  await waitFor(() => getByText('User: Jane'));
  await waitFor(() => getByText('Network status: Idle'));
});

it('recognizes mutation loading states', async () => {
  const {getByText} = render(
    <ConfiguredApolloProvider>
      <ConfiguredNetworkStatusReporter />
      <DataUpdater />
    </ConfiguredApolloProvider>
  );

  fireEvent.click(getByText('Submit'));
  await waitFor(() => getByText('Network status: Loading …'));
  await waitFor(() => getByText('Network status: Idle'));
});

it('incorporates mutation results into the store', async () => {
  const {getByText, getByLabelText} = render(
    <ConfiguredApolloProvider>
      <ConfiguredNetworkStatusReporter />
      <DataFetcher initialSkip={false} />
      <DataUpdater />
    </ConfiguredApolloProvider>
  );

  await waitFor(() => getByText('Refetch'));
  fireEvent.change(getByLabelText('Update user name:'), {
    target: {value: 'Hans'}
  });
  fireEvent.click(getByText('Submit'));
  await waitFor(() => getByText('User: Hans'));
});

it('can configure which operations to handle on a case-by-case basis', async () => {
  const {getByText, queryAllByText} = render(
    <ConfiguredApolloProvider>
      <ConfiguredNetworkStatusReporter initialOptIn />
      <ConfiguredNetworkStatusReporter />
      <DataFetcher initialSkip={false} />
      <DataUpdater />
    </ConfiguredApolloProvider>
  );

  fireEvent.click(getByText('Submit'));
  await waitFor(() => getByText('Network status: Idle'));
  getByText('Network status: Loading …');
  await waitFor(() => {
    expect(queryAllByText('Network status: Idle').length).toBe(2);
  });
});

it('can detect errors', async () => {
  const {getByText} = render(
    <ConfiguredApolloProvider>
      <ConfiguredNetworkStatusReporter />
      <DataFetcher isBroken />
    </ConfiguredApolloProvider>
  );

  fireEvent.click(getByText('Broken fetch'));
  await waitFor(() => getByText('Error'));
  getByText('Network status: Error');
});
