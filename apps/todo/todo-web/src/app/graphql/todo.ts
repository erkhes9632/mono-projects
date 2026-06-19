import gql from 'graphql-tag';

export const CREATE_TODO = gql`
  mutation CreateTodo($userId: ID!, $input: TodoInput!) {
    createTodo(userId: $userId, input: $input) {
      message
    }
  }
`;

export const GET_TODOS = gql`
  query GetTodos($userId: ID!) {
    getTodos(userId: $userId) {
      id
      title
      description
      xpReward
      isCompleted
    }
  }
`;

export const COMPLETE_TODO = gql`
  mutation CompleteTodo($todoId: ID!) {
    completeTodo(todoId: $todoId) {
      success
      message
    }
  }
`;

export const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id) {
      message
    }
  }
`;
