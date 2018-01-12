import React from 'react';
import ApolloLinkNetworkStatus from './ApolloLinkNetworkStatus';
import NetworkStatusNotifier from './NetworkStatusNotifier';
import NetworkStatusStore from './NetworkStatusStore';
import defaultConfig from './defaultConfig';

export function createNetworkStatusNotifier(config = defaultConfig) {
  if (!config.reducers) {
    throw new Error('`reducers` are mandatory.');
  }

  if (!config.mapStateToProps) {
    config = {...config, mapStateToProps: state => state};
  }

  const store = new NetworkStatusStore(config);

  const ConfiguredNetworkStatusNotifier = props => (
    <NetworkStatusNotifier
      {...props}
      initialNetworkStatus={config.initialState}
      mapStateToProps={config.mapStateToProps}
      store={store}
    />
  );

  return {
    link: new ApolloLinkNetworkStatus({store}),
    NetworkStatusNotifier: ConfiguredNetworkStatusNotifier
  };
}
