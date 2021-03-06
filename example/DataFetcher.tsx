import {useQuery} from '@apollo/client';
import gql from 'graphql-tag';
import React, {useState, useEffect} from 'react';

type Props = {
  isBroken?: boolean;
  initialSkip?: boolean;
  id?: string;
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

export default function DataFetcher({
  isBroken,
  initialSkip = true,
  id = '1'
}: Props) {
  const [skip, setSkip] = useState(initialSkip);
  const {data, loading, error, refetch} = useQuery<Data, Variables>(query, {
    context: {useApolloNetworkStatus: true},
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
    skip,
    variables: isBroken ? undefined : {id}
  });

  function onFetchClick() {
    setSkip(false);
  }

  function onRefetchClick() {
    refetch();
  }

  function onRetryClick() {
    refetch();
  }

  useEffect(() => {
    if (error) console.error(error);
  }, [error]);

  let content;
  if (skip) {
    content = (
      <>
        Local status: Idle{' '}
        <button onClick={onFetchClick}>
          {isBroken ? 'Broken fetch' : 'Fetch'}
        </button>
      </>
    );
  } else if (loading) {
    content = 'Local status: Loading …';
  } else if (error) {
    content = (
      <>
        Error <button onClick={onRetryClick}>Retry</button>{' '}
      </>
    );
  } else if (data && data.user) {
    content = (
      <>
        User: {data.user.name}{' '}
        <button disabled={loading} onClick={onRefetchClick}>
          Refetch
        </button>
      </>
    );
  } else {
    throw new Error('Unexpected state');
  }

  return <p>{content}</p>;
}
