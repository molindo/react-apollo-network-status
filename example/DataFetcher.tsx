import React, {useState} from 'react';
import gql from 'graphql-tag';
import {useQuery} from '@apollo/react-hooks';
import usePendingPromise from './usePendingPromise';

type Props = {
  isBroken?: boolean;
};

const query = gql`
  query DataFetcher($id: ID!) {
    user(id: $id) {
      id
      name
    }
  }
`;

interface Data {
  user: {
    id: string;
    name: string;
  };
}

interface Variables {
  id: string;
}

export default function DataFetcher({isBroken}: Props) {
  const [skip, setSkip] = useState(true);
  const {data, loading, error, refetch} = useQuery<Data, Variables>(query, {
    context: {useApolloNetworkStatus: true},
    fetchPolicy: 'network-only',
    skip,
    variables: isBroken ? undefined : {id: '1'}
  });
  const [queryPromise, setQueryPromise] = usePendingPromise();

  function onFetchClick() {
    setSkip(false);
  }

  function onRefetchClick() {
    const result = refetch();
    setQueryPromise(result);
  }

  function onRetryClick() {
    refetch();
  }

  let content;
  if (skip) {
    content = (
      <>
        Idle{' '}
        <button onClick={onFetchClick}>
          {isBroken ? 'Broken fetch' : 'Fetch'}
        </button>
      </>
    );
  } else if (data && data.user) {
    content = (
      <>
        User: {data.user.name}{' '}
        <button disabled={queryPromise != null} onClick={onRefetchClick}>
          Refetch
        </button>
      </>
    );
  } else if (loading) {
    content = 'Loading …';
  } else if (error) {
    content = (
      <>
        Error <button onClick={onRetryClick}>Retry</button>{' '}
      </>
    );
  } else {
    throw new Error('Unexpected state');
  }

  return <p>{content}</p>;
}
