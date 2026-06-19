import gql from 'graphql-tag';

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      message
    }
  }
`;

export const GET_USER = gql`
  query GetUsers {
    getUsers {
      id
      name
      email
      password
      xp
      level
    }
  }
`;

export const GET_CURRENT_USER = gql`
  mutation UpdateUserProgress($id: ID!, $xp: Int!, $level: Int!) {
    updateUser(id: $id, input: { xp: $xp, level: $level }) {
      id
      xp
      level
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUsers {
    getUsers {
      id
      name
      email
      xp
      level
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
    }
  }
`;
