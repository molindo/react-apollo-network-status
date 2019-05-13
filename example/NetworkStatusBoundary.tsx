import React, {ReactNode} from 'react';
import {ApolloNetworkStatusProvider} from '../src';
import NetworkStatusReporter from './NetworkStatusReporter';

type Props = {
  children: ReactNode;
};

export default function NetworkStatusBoundary({children}: Props) {
  return (
    // @ts-ignore False positive which asks for `client` property. This
    // prop is injected via a HOC and not needed here.
    <ApolloNetworkStatusProvider>
      <div style={{backgroundColor: '#2368841a'}}>
        <div style={{backgroundColor: 'rgba(0,0,0,0.1)', padding: '5px 20px'}}>
          <NetworkStatusReporter />
        </div>
        <div style={{padding: '5px 20px'}}>{children}</div>
      </div>
    </ApolloNetworkStatusProvider>
  );
}
