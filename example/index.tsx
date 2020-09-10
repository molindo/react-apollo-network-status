import {ApolloProvider} from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom';
import DataFetcher from './DataFetcher';
import DataUpdater from './DataUpdater';
import NetworkStatusReporter from './NetworkStatusReporter';
import LazyRender from './LazyRender';
import createClient from './createClient';

const element = (
  <div style={{padding: 10}}>
    <ApolloProvider client={createClient()}>
      <fieldset>
        <legend>Reporters</legend>
        <NetworkStatusReporter />
        <div style={{height: 10}} />
        <NetworkStatusReporter />
      </fieldset>
      <div style={{height: 10}} />
      <fieldset>
        <legend>Fetchers</legend>
        <LazyRender>
          <DataFetcher initialSkip={false} />
        </LazyRender>
        <DataFetcher />
        <DataFetcher isBroken />
        <DataUpdater />
      </fieldset>
    </ApolloProvider>
  </div>
);

ReactDOM.render(element, document.getElementById('root'));
