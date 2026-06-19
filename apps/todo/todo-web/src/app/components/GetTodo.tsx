'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { GET_TODOS, COMPLETE_TODO, DELETE_TODO } from '../graphql/todo';
import { GET_USER_BY_ID } from '../graphql/user';
import { useAuth } from '../../context/AuthContext';
import { Task } from './Task';

interface Todo {
  id: string;
  title: string;
  description?: string;
  xpReward: number;
  isCompleted: boolean;
}

interface GetTodosData {
  getTodos: Todo[];
}

export const GetTodos = () => {
  const { currentUser } = useAuth();

  const { data, loading, error } = useQuery<GetTodosData>(GET_TODOS, {
    variables: { userId: currentUser?.id },
    skip: !currentUser,
  });

  const [completeTodo] = useMutation(COMPLETE_TODO, {
    refetchQueries: [
      { query: GET_TODOS, variables: { userId: currentUser?.id } },
      { query: GET_USER_BY_ID },
    ],
  });

  const [deleteTodo] = useMutation(DELETE_TODO, {
    refetchQueries: [
      { query: GET_TODOS, variables: { userId: currentUser?.id } },
    ],
  });

  if (loading) {
    return (
      <div className="text-xs font-mono font-bold tracking-[0.2em] text-neutral-500 animate-pulse uppercase p-6">
        ⚡ Syncing operational dataset...
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-red-500/30 bg-red-500/5 p-5 text-xs font-mono font-bold tracking-wide text-red-400 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.05)]">
        Database Link Error: {error.message}
      </div>
    );
  }

  const handleCheckTodo = async (id: string) => {
    try {
      await completeTodo({ variables: { todoId: id } });
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo({ variables: { id: id } });
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  };

  const activeTodos = data?.getTodos || [];

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center w-full border-b-2 border-neutral-900 pb-4">
        <span className="text-xs font-black text-neutral-400 tracking-[0.25em] uppercase">
          Workspace Log Feed
        </span>
        <span className="text-[11px] font-mono font-black text-emerald-400 bg-emerald-500/5 border-2 border-emerald-500/20 px-3 py-1 rounded-md tracking-wider">
          {activeTodos.length} ACTIVE CORES
        </span>
      </div>

      {activeTodos.length === 0 ? (
        <div className="border-2 border-dashed border-neutral-800 bg-neutral-950/20 p-20 rounded-2xl text-center">
          <p className="text-xs font-medium text-neutral-500 tracking-wider uppercase">
            // No outstanding objectives recorded in this queue.
          </p>
        </div>
      ) : (
        <Task
          userId={currentUser?.id || ''}
          todos={activeTodos}
          onCheckTodo={handleCheckTodo}
          onDeleteTodo={handleDeleteTodo}
        />
      )}
    </div>
  );
};
