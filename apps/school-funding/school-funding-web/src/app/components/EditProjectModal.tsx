'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { X, Loader2, Save } from 'lucide-react';
import { gql } from '@apollo/client';

const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($id: ID!, $input: ProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      title
      description
      images
    }
  }
`;

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  status?: string;
  images?: string[];
  createdAt?: string;
}

interface EditProjectModalProps {
  project: ProjectData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditProjectModal({
  project,
  isOpen,
  onClose,
  onUpdated,
}: EditProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setTitle(project.title || '');
      setDescription(project.description || '');
    }
  }, [project]);

  const [updateProject, { loading }] = useMutation(UPDATE_PROJECT_MUTATION, {
    onCompleted: () => {
      onUpdated();
      onClose();
    },
    onError: (err) => setError(err.message),
  });

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setError(null);
    await updateProject({
      variables: {
        id: project.id,
        input: {
          title: title.trim(),
          description: description.trim(),
          images: project.images || [],
          creatorId: '',
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-[#E85D3A]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#2D323E] border border-[#E85D3A]/20 w-full max-w-lg rounded-3xl p-6 space-y-6 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#EAE2D5]">Edit Project</h2>
          <button
            onClick={onClose}
            className="p-2 text-[#EAE2D5]/50 hover:text-[#EAE2D5] rounded-full bg-[#E85D3A]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-[#E85D3A]/10 border border-[#E85D3A]/20 text-[#EAE2D5]/80 text-xs rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#EAE2D5]/80 mb-2">
              Project Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 text-[#EAE2D5] focus:outline-none focus:border-[#E85D3A]/50 text-sm transition"
              placeholder="Enter project title..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#EAE2D5]/80 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-2xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 text-[#EAE2D5] focus:outline-none focus:border-[#E85D3A]/50 text-sm resize-none transition"
              placeholder="Enter project description..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-[#E85D3A]/10 text-[#EAE2D5]/80 hover:bg-[#E85D3A]/20 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-full bg-[#E85D3A] text-white hover:bg-[#D14C2A] text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
