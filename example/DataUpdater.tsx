import React, {FormEvent} from 'react';
import gql from 'graphql-tag';
import {Mutation} from 'react-apollo';
import usePendingPromise from './usePendingPromise';

const mutation = gql`
  mutation updateUser($id: ID!, $user: UserInput!) {
    updateUser(id: $id, user: $user) {
      id
      name
    }
  }
`;

interface Data {
  upderUser: {
    id: string;
    name: string;
  };
}

interface Variables {
  id: string;
  user: {
    name: string;
  };
}

export default function DataUpdater() {
  const [submissionPromise, setSubmissionPromise] = usePendingPromise<any>();

  return (
    <Mutation<Data, Variables> mutation={mutation}>
      {updateUser => {
        function onSubmit(e: FormEvent) {
          e.preventDefault();

          const nameInput = e.currentTarget.children[0];
          if (!(nameInput instanceof HTMLInputElement)) {
            throw new Error('`name` input not found');
          }

          const result = updateUser({
            variables: {id: '1', user: {name: nameInput.value}}
          });
          setSubmissionPromise(result);
        }

        return (
          <form onSubmit={onSubmit}>
            <input name="name" placeholder="Update user name" type="text" />{' '}
            <input disabled={submissionPromise != null} type="submit" />
          </form>
        );
      }}
    </Mutation>
  );
}
