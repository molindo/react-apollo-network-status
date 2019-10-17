import gql from 'graphql-tag';
import {useQuery} from '@apollo/react-hooks';
import React, {useState, useEffect} from 'react';

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
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
    skip,
    variables: isBroken ? undefined : {id: '1'}
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
        <button disabled={loading} onClick={onRefetchClick}>
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
