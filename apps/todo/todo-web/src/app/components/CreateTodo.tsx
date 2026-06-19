'use client';

import { Input, Button } from '@erkhes-monorepo/shadcn';
import { ChangeEvent, useState } from 'react';
import { CREATE_TODO, GET_TODOS } from '../graphql/todo';
import { useMutation } from '@apollo/client/react';
import { useAuth } from '../../context/AuthContext';
import { Plus } from 'lucide-react';

export const CreateTodo = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    xpReward: 10,
  });

  const [createTodo, { loading, error }] = useMutation(CREATE_TODO, {
    refetchQueries: [
      { query: GET_TODOS, variables: { userId: currentUser?.id } },
    ],
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'xpReward' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async () => {
    if (!currentUser || !formData.title.trim()) return;
    try {
      await createTodo({
        variables: {
          userId: currentUser.id,
          input: {
            title: formData.title,
            description: formData.description,
            xpReward: formData.xpReward,
          },
        },
      });
      setFormData({ title: '', description: '', xpReward: 10 });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <span className="text-xs font-black text-neutral-400 font-mono tracking-[0.2em] block uppercase">
        Create Objective
      </span>

      <div className="space-y-4">
        <div>
          <Input
            name="title"
            placeholder="Objective title"
            value={formData.title}
            onChange={handleChange}
            className="bg-neutral-900 border-2 border-neutral-800 rounded-xl text-white font-medium placeholder:text-neutral-600 focus:border-neutral-500 focus:ring-0 h-12 text-sm transition-all"
          />
        </div>

        <div>
          <Input
            name="description"
            placeholder="Scope details (Optional)"
            value={formData.description}
            onChange={handleChange}
            className="bg-neutral-900 border-2 border-neutral-800 rounded-xl text-white font-medium placeholder:text-neutral-600 focus:border-neutral-500 focus:ring-0 h-12 text-xs transition-all"
          />
        </div>

        <div className="flex items-center justify-between border-2 border-neutral-800 rounded-xl p-4 bg-neutral-950/60 focus-within:border-emerald-500 transition-colors duration-300">
          <span className="text-xs font-mono font-black text-neutral-400 uppercase tracking-wider">
            Value allocation:
          </span>
          <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 px-3 py-1 rounded-md">
            <Input
              name="xpReward"
              type="number"
              value={formData.xpReward}
              onChange={handleChange}
              className="bg-transparent border-none text-emerald-400 focus:ring-0 p-0 h-6 text-sm font-mono font-black text-right w-12"
            />
            <span className="text-[11px] font-mono font-black text-emerald-500">
              XP
            </span>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs font-mono font-bold text-red-400 bg-red-500/5 border-2 border-red-500/20 p-3 rounded-xl">
          [SYS_ERR]: {error.message}
        </p>
      )}

      <Button
        className="w-full bg-white text-black font-black hover:bg-neutral-200 rounded-xl h-12 text-xs tracking-[0.15em] uppercase transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(255,255,255,0.35)] active:scale-[0.98]"
        onClick={handleSubmit}
        disabled={loading || !currentUser}
      >
        <Plus className="h-4 w-4 stroke-[3]" />
        <span>{loading ? 'Creating entry...' : 'Deploy Objective'}</span>
      </Button>
    </div>
  );
};
