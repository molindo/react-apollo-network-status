import React, {ReactNode, useState} from 'react';
import {ApolloNetworkStatusProvider} from '../src';
import NetworkStatusReporter from './NetworkStatusReporter';

type Props = {
  children: ReactNode;
};

export default function NetworkStatusBoundary({children}: Props) {
  const [enableBubbling, setEnableBubbling] = useState(false);

  function onToggleBubbling() {
    setEnableBubbling(!enableBubbling);
  }

  return (
    // @ts-ignore False positive which asks for `client` property. This
    // prop is injected via a HOC and not needed here.
    <ApolloNetworkStatusProvider enableBubbling={enableBubbling}>
      <div style={{backgroundColor: '#2368841a'}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(0,0,0,0.1)',
            padding: '5px 20px'
          }}
        >
          <NetworkStatusReporter />
          <div>
            <pre style={{display: 'inline-block'}}>
              enableBubbling: {String(enableBubbling)}{' '}
            </pre>
            <button onClick={onToggleBubbling}>Toggle </button>
          </div>
        </div>
        <div style={{padding: '5px 20px'}}>{children}</div>
      </div>
    </ApolloNetworkStatusProvider>
  );
}
