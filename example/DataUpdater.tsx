import React, {FormEvent, useState} from 'react';
import gql from 'graphql-tag';
import {useMutation} from '@apollo/react-hooks';
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
  const [name, setName] = useState('');
  const [updateUser] = useMutation<Data, Variables>(mutation);
  const [submissionPromise, setSubmissionPromise] = usePendingPromise<any>();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = updateUser({
      variables: {
        id: '1',
        user: {name}
      }
    });

    setSubmissionPromise(result);
  }

  function onNameInputChange(event: FormEvent<HTMLInputElement>) {
    setName(event.currentTarget.value);
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        onChange={onNameInputChange}
        placeholder="Update user name"
        type="text"
        value={name}
      />{' '}
      <input disabled={submissionPromise != null} type="submit" />
    </form>
  );
}
