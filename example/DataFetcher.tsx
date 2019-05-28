import React, {useState} from 'react';
import gql from 'graphql-tag';
import {Query} from 'react-apollo';
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
  const [queryPromise, setQueryPromise] = usePendingPromise();

  function onFetch() {
    setSkip(false);
  }

  return (
    <p>
      <Query<Data, Variables>
        context={{useApolloNetworkStatus: true}}
        fetchPolicy="network-only"
        onError={error => {
          // eslint-disable-next-line no-console
          console.error(error);
        }}
        query={query}
        skip={skip}
        variables={isBroken ? undefined : {id: '1'}}
      >
        {({data, loading, error, refetch}) => {
          function onRefetchClick() {
            const result = refetch();
            setQueryPromise(result);
          }

          function onRetryClick() {
            refetch();
          }

          if (skip) {
            return (
              <span>
                Idle{' '}
                <button onClick={onFetch}>
                  {isBroken ? 'Broken fetch' : 'Fetch'}
                </button>
              </span>
            );
          }

          return (
            <span>
              {data && data.user ? (
                <span>
                  User: {data.user.name}{' '}
                  <button
                    disabled={queryPromise != null}
                    onClick={onRefetchClick}
                  >
                    Refetch
                  </button>
                </span>
              ) : loading ? (
                'Loading …'
              ) : error ? (
                <>
                  Error <button onClick={onRetryClick}>Retry</button>
                </>
              ) : null}
            </span>
          );
        }}
      </Query>
    </p>
  );
}
