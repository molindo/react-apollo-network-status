import React, {ReactNode, useState, SyntheticEvent} from 'react';
import {ApolloNetworkStatusProvider} from '../src';
import NetworkStatusReporter from './NetworkStatusReporter';

type Props = {
  children: ReactNode;
};

export default function NetworkStatusBoundary({children}: Props) {
  const [enableBubbling, setEnableBubbling] = useState(false);
  const [optIn, setHandleOnlyQueries] = useState(false);

  function onBubblingCheckboxChange(e: SyntheticEvent<HTMLInputElement>) {
    setEnableBubbling(e.currentTarget.checked);
  }

  function onOptInCheckboxChange(e: SyntheticEvent<HTMLInputElement>) {
    setHandleOnlyQueries(e.currentTarget.checked);
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
              Ignore mutation
            </label>
          </div>
        </div>
        <div style={{padding: '5px 20px'}}>{children}</div>
      </div>
    </ApolloNetworkStatusProvider>
  );
}
