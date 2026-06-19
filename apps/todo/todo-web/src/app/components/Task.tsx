'use client';

import { CheckCircle2, Circle, X } from 'lucide-react';

type TodoItem = {
  id: string;
  title: string;
  description?: string;
  xpReward: number;
  isCompleted: boolean;
};

type TaskProps = {
  userId: string;
  todos: TodoItem[];
  onCheckTodo?: (id: string) => void;
  onDeleteTodo?: (id: string) => void;
};

export const Task = ({ todos, onCheckTodo, onDeleteTodo }: TaskProps) => {
  return (
    <div className="divide-y divide-neutral-900 border-b border-neutral-900">
      {todos.map((el: TodoItem) => (
        <div
          key={el.id}
          className={`flex items-start justify-between py-4 transition-all bg-transparent group/item ${
            el.isCompleted ? 'opacity-40 select-none' : ''
          }`}
        >
          <div className="flex items-start gap-4 flex-1 pr-4">
            <button
              onClick={() => onCheckTodo && onCheckTodo(el.id)}
              className="mt-0.5 text-neutral-600 hover:text-white transition-colors cursor-pointer focus:outline-none"
            >
              {el.isCompleted ? (
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
              ) : (
                <Circle className="h-4.5 w-4.5 text-neutral-800 group-hover/item:text-neutral-500" />
              )}
            </button>

            <div className="space-y-1 flex-1">
              <h4
                onClick={() => onCheckTodo && onCheckTodo(el.id)}
                className={`text-sm font-normal cursor-pointer text-neutral-200 transition-colors group-hover/item:text-white ${
                  el.isCompleted
                    ? 'line-through text-neutral-500 group-hover/item:text-neutral-500'
                    : ''
                }`}
              >
                {el.title}
              </h4>
              {el.description && (
                <p className="text-xs text-neutral-500 font-light leading-normal">
                  {el.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5 h-6">
            <span
              className={`text-xs font-mono ${el.isCompleted ? 'text-neutral-600' : 'text-neutral-400'}`}
            >
              +{el.xpReward} XP
            </span>

            <button
              onClick={() => onDeleteTodo && onDeleteTodo(el.id)}
              className="opacity-0 group-hover/item:opacity-100 text-neutral-600 hover:text-red-400 p-1 transition-all rounded-md focus:outline-none"
              title="Delete Objective"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
