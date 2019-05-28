import React from 'react';
import {Operation} from 'apollo-link';
import {useApolloNetworkStatus} from '../src';

type Props = {
  optIn?: boolean;
};

export default function NetworkStatusReporter({optIn}: Props) {
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

  return <p>Network status: {statusMessage}</p>;
}
