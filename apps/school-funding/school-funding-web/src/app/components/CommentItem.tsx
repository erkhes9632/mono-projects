import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useUser } from '@clerk/nextjs';
import { Edit2, Trash2, Check, X, Loader2, User } from 'lucide-react';
import { gql } from '@apollo/client';

// --- QUERIES & MUTATIONS ---
const GET_USER_BY_ID = gql`
  query GetUserById($id: ID) {
    getUserById(id: $id) {
      id
      userName
      avatarUrl
      role
    }
  }
`;

const UPDATE_COMMENT_MUTATION = gql`
  mutation UpdateComment($id: ID!, $content: String!) {
    updateComment(id: $id, content: $content) {
      id
      content
      updatedAt
    }
  }
`;

const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id) {
      success
      message
    }
  }
`;

interface Comment {
  id: string;
  projectId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function CommentItem({
  comment,
  refetchComments,
}: {
  comment: Comment;
  projectId: string;
  refetchComments: () => void;
}) {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const isOwner = user?.id === comment.authorId;

  const { data: authorData } = useQuery<{
    getUserById: {
      id: string;
      userName: string;
      avatarUrl?: string | null;
      role: string;
    } | null;
  }>(GET_USER_BY_ID, {
    variables: { id: comment.authorId },
    fetchPolicy: 'network-only',
  });

  const author = authorData?.getUserById;
  const authorName = author?.userName || 'Unknown User';
  const authorRole = author?.role || '';
  const authorAvatar = author?.avatarUrl;

  const [updateComment, { loading: updating }] = useMutation(
    UPDATE_COMMENT_MUTATION,
    {
      onCompleted: () => {
        setIsEditing(false);
        refetchComments();
      },
    },
  );

  const [deleteComment, { loading: deleting }] = useMutation(
    DELETE_COMMENT_MUTATION,
    {
      onCompleted: () => {
        refetchComments();
      },
    },
  );

  const handleUpdate = async () => {
    if (!editText.trim()) return;
    await updateComment({
      variables: {
        id: comment.id,
        content: editText.trim(),
      },
    });
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this comment?')) {
      await deleteComment({
        variables: { id: comment.id },
      });
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const timestamp = Number(dateStr);
    const date = isNaN(timestamp) ? new Date(dateStr) : new Date(timestamp);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-4 rounded-2xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 space-y-2.5 hover:bg-[#E85D3A]/15 transition-colors">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#E85D3A]/15 border border-[#E85D3A]/20 shrink-0">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-[#EAE2D5]/80" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-[#EAE2D5] truncate block leading-tight">
              {authorName}
            </span>
            <span className="text-[9px] text-[#EAE2D5]/80/60 uppercase tracking-wider">
              {authorRole === 'TEACHER' ? 'Teacher' : 'Student'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-[#EAE2D5]/80/50">
            {formatDate(comment.createdAt)}
          </span>
          {isOwner && !isEditing && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded-lg text-[#EAE2D5]/80/60 hover:text-[#E85D3A] hover:bg-[#E85D3A]/15 transition-all"
                title="Edit"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-1 rounded-lg text-[#EAE2D5]/80/60 hover:text-red-400 hover:bg-[#E85D3A]/15 transition-all"
                title="Delete"
              >
                {deleting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-xl bg-[#2D323E] border border-[#E85D3A]/50 text-[#EAE2D5] text-sm focus:outline-none focus:border-[#E85D3A] transition"
            autoFocus
          />
          <button
            onClick={handleUpdate}
            disabled={updating}
            className="p-1.5 rounded-lg bg-[#E85D3A] text-white hover:bg-[#D14C2A] transition-all disabled:opacity-50"
          >
            {updating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setEditText(comment.content);
            }}
            className="p-1.5 rounded-lg bg-[#E85D3A]/10 text-[#EAE2D5]/80 hover:bg-[#E85D3A]/20 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <p className="text-sm text-[#EAE2D5]/80 leading-relaxed">
          {comment.content}
        </p>
      )}
    </div>
  );
}
