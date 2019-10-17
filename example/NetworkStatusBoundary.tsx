import React, {ReactNode, useState, SyntheticEvent} from 'react';
import {ApolloNetworkStatusProvider} from '../src';
import NetworkStatusReporter from './NetworkStatusReporter';

type Props = {
  children: ReactNode;
};

export default function NetworkStatusBoundary({children}: Props) {
  const [enableBubbling, setEnableBubbling] = useState(false);
  const [optIn, setOptIn] = useState(false);

  function onBubblingCheckboxChange(event: SyntheticEvent<HTMLInputElement>) {
    setEnableBubbling(event.currentTarget.checked);
  }

  function onOptInCheckboxChange(event: SyntheticEvent<HTMLInputElement>) {
    setOptIn(event.currentTarget.checked);
  }

  return (
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
          <NetworkStatusReporter optIn={optIn} />
          <div>
            <label>
              <input
                checked={enableBubbling}
                onChange={onBubblingCheckboxChange}
                type="checkbox"
              />
              Bubbling
            </label>
            <label style={{marginLeft: 10}}>
              <input
                checked={optIn}
                onChange={onOptInCheckboxChange}
                type="checkbox"
              />
              Ignore mutation loading state
            </label>
          </div>
        </div>
        <div style={{padding: '5px 20px'}}>{children}</div>
      </div>
    </ApolloNetworkStatusProvider>
  );
}
