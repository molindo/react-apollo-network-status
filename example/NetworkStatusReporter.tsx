import React from 'react';
import {useApolloNetworkStatus} from '../src';

export default function NetworkStatusReporter() {
  const status = useApolloNetworkStatus();

  let statusMessage;
  if (status.numPendingQueries > 0 || status.numPendingMutations > 0) {
    statusMessage = 'Loading …';
  } else if (status.queryError || status.mutationError) {
    statusMessage = 'Error';
  } else {
    statusMessage = 'Idle';
  }

  return <p>Network status: {statusMessage}</p>;
}
