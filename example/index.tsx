import {ApolloProvider} from '@apollo/react-common';
import React from 'react';
import ReactDOM from 'react-dom';
import createClient from '../src/__testUtils__/createClient';
import DataFetcher from './DataFetcher';
import DataUpdater from './DataUpdater';
import NetworkStatusBoundary from './NetworkStatusBoundary';

const client = createClient();

const element = (
  <div style={{padding: 10}}>
    <ApolloProvider client={client}>
      <DataFetcher />
      <DataUpdater />
      <NetworkStatusBoundary>
        <DataFetcher />
        <DataUpdater />
        <NetworkStatusBoundary>
          <DataFetcher />
          <DataFetcher isBroken />
          <DataUpdater />
          <NetworkStatusBoundary>
            <DataFetcher />
            <DataUpdater />
          </NetworkStatusBoundary>
        </NetworkStatusBoundary>
      </NetworkStatusBoundary>
    </ApolloProvider>
  </div>
);

ReactDOM.render(element, document.getElementById('root'));
