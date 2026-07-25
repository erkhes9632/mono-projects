'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { X, Loader2, UserCheck } from 'lucide-react';

const UPDATE_ME_MUTATION = gql`
  mutation UpdateMe($input: UserInput!) {
    updateMe(input: $input) { id userName email avatarUrl }
  }
`;

interface EditProfileModalProps {
  initialName: string;
  initialAvatarUrl?: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditProfileModal({
  initialName, initialAvatarUrl, isOpen, onClose, onUpdated,
}: EditProfileModalProps) {
  const [userName, setUserName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUserName(initialName);
    setAvatarUrl(initialAvatarUrl || '');
  }, [initialName, initialAvatarUrl]);

  const [updateMe, { loading }] = useMutation(UPDATE_ME_MUTATION, {
    onCompleted: () => { onUpdated(); onClose(); },
    onError: (err) => setError(err.message),
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    setError(null);
    await updateMe({
      variables: { input: { userName: userName.trim(), avatarUrl: avatarUrl.trim() || null } },
    });
  };

  return (
    <div className="fixed inset-0 bg-[#E85D3A]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#2D323E] border border-[#E85D3A]/20 w-full max-w-md rounded-2xl p-6 space-y-6 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#EAE2D5]">Edit Profile</h2>
          <button onClick={onClose} className="p-2 text-[#EAE2D5]/80 hover:text-[#E85D3A] rounded-full bg-[#E85D3A]/10 hover:bg-[#E85D3A]/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-[#E85D3A]/10 border border-[#E85D3A]/20 text-[#EAE2D5]/80 text-xs rounded-xl">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#EAE2D5]/80 mb-2">Username</label>
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 text-[#EAE2D5] focus:outline-none focus:border-[#E85D3A]/40 text-sm" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#EAE2D5]/80 mb-2">Avatar URL</label>
            <input type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 text-[#EAE2D5] focus:outline-none focus:border-[#E85D3A]/40 text-sm"
              placeholder="https://example.com/avatar.jpg" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#E85D3A]/10 text-[#EAE2D5]/80 hover:bg-[#E85D3A]/20 text-xs font-semibold transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#E85D3A] text-white hover:bg-[#D14C2A] text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
              <span>Update</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
