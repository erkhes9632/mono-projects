'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { CREATE_GOAL } from '../graphql/documents';

interface CreateGoalModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateGoalModal({
  open,
  onClose,
  onCreated,
}: CreateGoalModalProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-violet-600/20 to-pink-600/10 border border-violet-500/20">
              <svg className="h-4 w-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-zinc-100">
              Create Goal
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <GoalForm onClose={onClose} onCreated={onCreated} />
      </div>
    </div>
  );
}

function GoalForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated?: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createGoal, { loading }] = useMutation(CREATE_GOAL);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setError(null);
    setSuccess(false);
    try {
      const result = await createGoal({
        variables: { input: { title, description } },
        refetchQueries: ['GetMyGoalsFull'],
      });
      if (result.error) {
        setError(result.error.message);
        return;
      }
      setSuccess(true);
      setTitle('');
      setDescription('');
      setTimeout(() => {
        onClose();
        onCreated?.();
      }, 400);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create goal',
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
      {success && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          Goal created! n8n will decompose it into objectives.
        </p>
      )}
      <FormInputs
        title={title}
        description={description}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
      />
      <FormActions onClose={onClose} loading={loading} title={title} />

    </form>
  );
}

interface FormInputsProps {
  title: string;
  description: string;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
}

function FormInputs({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: FormInputsProps) {
  return (
    <>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-400">Goal title</label>
        <input
          type="text"
          placeholder="e.g. IELTS 7.0 in 3 months"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
          className="input-modern"
        />
      </div>
      <div className="space-y-1.5 mt-3">
        <label className="text-xs font-medium text-zinc-400">Description (optional)</label>
        <textarea
          placeholder="Add context to help AI decompose your goal..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
          className="input-modern resize-none"
        />
      </div>
    </>
  );
}

function FormActions({
  onClose,
  loading,
  title,
}: {
  onClose: () => void;
  loading: boolean;
  title: string;
}) {
  return (
    <div className="flex items-center justify-end gap-2.5 mt-5 pt-1">
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg px-4 py-2 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="btn-glow rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Creating...
          </span>
        ) : (
          'Create Goal'
        )}
      </button>
    </div>
  );
}
