'use client';

import { Button, Input } from '@erkhes-monorepo/shadcn';
import { ChangeEvent, useState } from 'react';
import { CREATE_USER } from '../graphql/user';
import { useMutation } from '@apollo/client/react';
import { UserPlus } from 'lucide-react';

export const CreateUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [createUser, { loading, error }] = useMutation(CREATE_USER);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await createUser({
        variables: {
          input: {
            name: formData.name,
            email: formData.email,
            password: formData.password,
          },
        },
      });
      window.location.reload();
    } catch (err) {
      console.error('Error creating user:', err);
    }
  };

  return (
    <div className="relative rounded-2xl border-2 border-neutral-800/80 bg-neutral-950/40 p-6 md:p-8 space-y-8 shadow-2xl backdrop-blur-xl group hover:border-indigo-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(99,102,241,0.1)]">
      <div className="absolute inset-x-0 -top-[2px] h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />

      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-white group-hover:drop-shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all">
          Initialize Account
        </h2>
        <p className="text-xs font-medium text-neutral-500 tracking-wide">
          Create a unique cryptographic identity node.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          name="name"
          type="text"
          placeholder="Identity Name"
          value={formData.name}
          onChange={handleChange}
          className="bg-neutral-900 border-2 border-neutral-800 text-white font-medium placeholder:text-neutral-600 focus:border-indigo-500 focus:ring-0 rounded-xl h-12 text-xs tracking-wider transition-all duration-300"
        />
        <Input
          name="email"
          type="email"
          placeholder="Secure Email Address"
          value={formData.email}
          onChange={handleChange}
          className="bg-neutral-900 border-2 border-neutral-800 text-white font-medium placeholder:text-neutral-600 focus:border-indigo-500 focus:ring-0 rounded-xl h-12 text-xs tracking-wider transition-all duration-300"
        />
        <Input
          name="password"
          type="password"
          placeholder="Access PassKey"
          value={formData.password}
          onChange={handleChange}
          className="bg-neutral-900 border-2 border-neutral-800 text-white font-medium placeholder:text-neutral-600 focus:border-indigo-500 focus:ring-0 rounded-xl h-12 text-xs tracking-wider transition-all duration-300"
        />
      </div>

      {error && (
        <div className="relative overflow-hidden rounded-xl border-2 border-red-500/30 bg-red-500/5 p-4 font-mono text-[11px] font-bold leading-relaxed text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
          <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <div className="flex gap-2">
            <span className="text-red-500 select-none">🚨 [SYS_ERR]:</span>
            <span className="flex-1 tracking-wide">
              {error.message.includes('auth')
                ? 'Access denied. Please check your security credentials.'
                : error.message}
            </span>
          </div>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-white text-black font-black hover:bg-neutral-200 rounded-xl h-12 text-xs tracking-[0.15em] uppercase transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] active:scale-[0.98]"
      >
        <UserPlus className="h-4 w-4 stroke-[2.5]" />
        <span>{loading ? 'Registering Node...' : 'Generate Profile'}</span>
      </Button>
    </div>
  );
};
