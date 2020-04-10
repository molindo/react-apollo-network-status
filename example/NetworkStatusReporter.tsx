import {Operation} from 'apollo-link';
import React, {SyntheticEvent, useState} from 'react';
import {
  UseApolloNetworkStatusOptions,
  NetworkStatus
} from '../src/useApolloNetworkStatus';

type Props = {
  initialOptIn?: boolean;
  useApolloNetworkStatus?: (
    options?: UseApolloNetworkStatusOptions
  ) => NetworkStatus;
};

export default function NetworkStatusReporter({
  initialOptIn = false,
  useApolloNetworkStatus = require('./NetworkStatusNotifier')
    .useApolloNetworkStatus
}: Props) {
  const [optIn, setOptIn] = useState(initialOptIn);

  function onOptInCheckboxChange(event: SyntheticEvent<HTMLInputElement>) {
    setOptIn(event.currentTarget.checked);
  }

  const options = optIn
    ? {
        shouldHandleOperation: (operation: Operation) =>
          operation.getContext().useApolloNetworkStatus === true
      }
    : undefined;

  const status = useApolloNetworkStatus(options);

  let statusMessage;
  if (status.numPendingQueries > 0 || status.numPendingMutations > 0) {
    statusMessage = 'Loading …';
  } else if (status.queryError || status.mutationError) {
    statusMessage = 'Error';
  } else {
    statusMessage = 'Idle';
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        padding: '0 15px'
      }}
    >
      <p>Network status: {statusMessage}</p>
      <label>
        <input
          checked={optIn}
          onChange={onOptInCheckboxChange}
          type="checkbox"
        />
        Ignore mutation loading state
      </label>
    </div>
  );
}
