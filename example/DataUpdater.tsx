import gql from 'graphql-tag';
import {useMutation} from '@apollo/react-hooks';
import React, {FormEvent, useState, useEffect} from 'react';

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
  const [updateUser, result] = useMutation<Data, Variables>(mutation);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateUser({variables: {id: '1', user: {name}}});
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
      <input disabled={result.loading} type="submit" />
    </form>
  );
}
