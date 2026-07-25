'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Coins,
  MessageSquare,
  Send,
  Loader2,
  Sparkles,
  Calendar,
  AlertCircle,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  XCircle,
  Flame,
  Zap,
  Plus,
} from 'lucide-react';
import { CommentItem } from './CommentItem';
import ImageLightbox from './ImageLightbox';

const GET_PROJECT_BY_ID_QUERY = gql`
  query GetProjectById($id: ID!) {
    getProjectById(id: $id) {
      id
      title
      description
      images
      status
      totalCoinsCollected
      createdAt
    }
  }
`;

const GET_PROJECT_COMMENTS_QUERY = gql`
  query GetProjectComments($projectId: ID!) {
    getProjectComments(projectId: $projectId) {
      id
      projectId
      authorId
      content
      createdAt
      updatedAt
    }
  }
`;

const STAKE_COINS_MUTATION = gql`
  mutation StakeCoins($projectId: ID!, $amount: Int!) {
    stakeCoins(projectId: $projectId, amount: $amount) {
      success
      message
    }
  }
`;

const ADD_COMMENT_MUTATION = gql`
  mutation AddComment($input: CommentInput!) {
    addComment(input: $input) {
      id
      content
      createdAt
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

interface Project {
  id: string;
  title: string;
  description: string;
  images: string[] | string;
  status: string;
  totalCoinsCollected: number;
  createdAt: string;
}

const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; colors: string }
> = {
  PENDING: {
    label: 'Pending Review',
    icon: Clock,
    colors: 'bg-[#E85D3A]/20 text-[#E85D3A] border-[#E85D3A]/30',
  },
  APPROVED: {
    label: 'Approved',
    icon: CheckCircle2,
    colors: 'bg-[#E85D3A]/15 text-[#E85D3A] border-[#E85D3A]/30',
  },
  REJECTED: {
    label: 'Rejected',
    icon: XCircle,
    colors: 'bg-[#E85D3A]/10 text-[#EAE2D5]/80 border-[#E85D3A]/20',
  },
  FUNDED: {
    label: 'Funded',
    icon: Flame,
    colors: 'bg-[#E85D3A]/20 text-[#EAE2D5] border-[#E85D3A]/40',
  },
};

export default function ProjectDetail({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [stakeAmount, setStakeAmount] = useState(10);
  const [commentText, setCommentText] = useState('');
  const [stakeError, setStakeError] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const {
    loading: projectLoading,
    error: projectError,
    data: projectData,
    refetch: refetchProject,
  } = useQuery<{ getProjectById: Project | null }>(GET_PROJECT_BY_ID_QUERY, {
    variables: { id: projectId },
    fetchPolicy: 'network-only',
  });

  const { data: commentsData, refetch: refetchComments } = useQuery<{
    getProjectComments: Comment[];
  }>(GET_PROJECT_COMMENTS_QUERY, {
    variables: { projectId },
    fetchPolicy: 'network-only',
  });

  const [stakeCoins, { loading: stakingLoading }] = useMutation(
    STAKE_COINS_MUTATION,
    {
      refetchQueries: ['GetUserById'],
      onCompleted: (data) => {
        const response = (data as any)?.stakeCoins;
        if (response?.success) {
          setStakeError(null);
          refetchProject();
        } else setStakeError(response?.message || 'Transaction failed.');
      },
      onError: (err) => setStakeError(err.message),
    },
  );

  const [addComment, { loading: commentLoading }] = useMutation(
    ADD_COMMENT_MUTATION,
    {
      onCompleted: () => {
        setCommentText('');
        refetchComments();
      },
    },
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const timestamp = Number(dateStr);
    const date = isNaN(timestamp) ? new Date(dateStr) : new Date(timestamp);
    return isNaN(date.getTime())
      ? dateStr
      : date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
  };

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(Number(dateStr) || dateStr);
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const handleStake = async () => {
    if (stakeAmount <= 0) return;
    setStakeError(null);
    try {
      await stakeCoins({
        variables: {
          projectId: String(projectId),
          amount: Number(stakeAmount),
        },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment({
      variables: { input: { projectId, content: commentText.trim() } },
    });
  };

  const quickAmounts = [10, 25, 50, 100];

  if (projectLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-[#E85D3A]/10 rounded-xl w-24" />
        <div className="h-[380px] bg-[#E85D3A]/10 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-[#E85D3A]/10 rounded-xl w-2/3" />
            <div className="h-32 bg-[#E85D3A]/10 rounded-2xl" />
          </div>
          <div className="h-64 bg-[#E85D3A]/10 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/15 text-red-400 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm font-medium">{projectError.message}</p>
      </div>
    );
  }

  const project = projectData?.getProjectById;
  const comments = commentsData?.getProjectComments || [];

  if (!project) {
    return (
      <div className="text-center py-16">
        <span className="text-4xl block mb-4">🔍</span>
        <p className="text-[#EAE2D5]/80 font-medium mb-4">Project not found</p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2 rounded-full bg-[#E85D3A]/10 text-[#E85D3A] hover:bg-[#E85D3A]/20 text-sm font-semibold transition"
        >
          Go back
        </button>
      </div>
    );
  }

  let parsedImages: string[] = [];
  if (Array.isArray(project.images)) parsedImages = project.images;
  else if (typeof project.images === 'string') {
    try {
      parsedImages = JSON.parse(project.images);
    } catch {
      parsedImages = [];
    }
  }

  const mainImage = parsedImages[0];
  const status = statusConfig[project.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#EAE2D5]/80 hover:text-[#EAE2D5] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to projects
      </button>

      <div className="relative h-[380px] rounded-3xl overflow-hidden bg-[#2D323E] border border-[#E85D3A]/20 group">
        {mainImage ? (
          <button
            onClick={() => parsedImages.length > 0 && setLightboxIndex(0)}
            className="w-full h-full cursor-pointer"
          >
            <img
              src={mainImage}
              alt={project.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </button>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#E85D3A]/10 flex items-center justify-center mb-3">
              <ImageIcon className="w-7 h-7 text-[#EAE2D5]/80/30" />
            </div>
            <p className="text-[#EAE2D5]/80/30 text-sm font-medium">
              No image available
            </p>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#242831] via-transparent to-transparent" />

        <div className="absolute top-5 left-5 right-5 flex items-start justify-between">
          <div
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold border backdrop-blur-md flex items-center gap-1.5 ${status.colors}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {status.label}
          </div>
          <div className="px-3 py-1.5 rounded-full bg-[#2D323E]/80 backdrop-blur-md border border-[#E85D3A]/20 flex items-center gap-2">
            <Coins className="w-3.5 h-3.5 text-[#E85D3A]" />
            <span className="text-xs font-bold text-[#EAE2D5]">
              {project.totalCoinsCollected}
            </span>
            <span className="text-[9px] text-[#EAE2D5]/80 font-medium">
              coins
            </span>
          </div>
        </div>

        <div className="absolute bottom-5 left-5 right-5">
          <h1 className="text-2xl md:text-3xl font-bold text-[#EAE2D5] tracking-tight">
            {project.title}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-[#EAE2D5]/80">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(project.createdAt)}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#242831]/30" />
            <span>{timeAgo(project.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-6 rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 space-y-4">
            <h3 className="text-xs font-bold text-[#E85D3A] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              About this project
            </h3>
            <p className="text-sm text-[#EAE2D5]/80 leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 space-y-5">
            <h3 className="text-xs font-bold text-[#EAE2D5] uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#E85D3A]" />
              Comments ({comments.length})
            </h3>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 text-[#EAE2D5] text-sm placeholder-[#242831] focus:outline-none focus:border-[#E85D3A]/40 transition"
              />
              <button
                type="submit"
                disabled={commentLoading || !commentText.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#E85D3A]/15 text-[#E85D3A] font-semibold hover:bg-[#E85D3A]/25 transition disabled:opacity-30 flex items-center gap-2 shrink-0 cursor-pointer text-sm"
              >
                {commentLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>

            <div className="space-y-2">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    projectId={projectId}
                    refetchComments={refetchComments}
                  />
                ))
              ) : (
                <p className="text-xs text-[#EAE2D5]/80 text-center py-6">
                  No comments yet. Be the first!
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-6 space-y-4">
          <div className="p-6 rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#E85D3A]/15 border border-[#E85D3A]/20 mb-3">
                <Coins className="w-6 h-6 text-[#E85D3A]" />
              </div>
              <p className="text-[10px] font-bold text-[#EAE2D5]/80 uppercase tracking-wider mb-1">
                Total Support
              </p>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-4xl font-extrabold text-[#EAE2D5]">
                  {project.totalCoinsCollected || 0}
                </span>
                <span className="text-xs font-semibold text-[#E85D3A]">
                  COINS
                </span>
              </div>
            </div>

            {stakeError && (
              <div className="p-3 rounded-xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 text-[#EAE2D5]/80 text-xs">
                {stakeError}
              </div>
            )}

            {project.status === 'APPROVED' && (
              <div className="space-y-4 pt-2 border-t border-[#E85D3A]/20">
                <p className="text-[10px] font-semibold text-[#EAE2D5]/80 uppercase tracking-wider">
                  Support this project
                </p>

                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setStakeAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        stakeAmount === amt && !customAmount
                          ? 'bg-[#E85D3A]/15 text-[#E85D3A] border-[#E85D3A]/30'
                          : 'bg-[#E85D3A]/10 text-[#EAE2D5]/80 border-[#E85D3A]/20 hover:bg-[#E85D3A]/20 hover:text-[#E85D3A]'
                      }`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    placeholder="Custom amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setStakeAmount(Number(e.target.value) || 0);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 text-[#EAE2D5] text-sm font-bold text-center focus:outline-none focus:border-[#E85D3A]/40 transition placeholder-[#242831] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#EAE2D5]/80" />
                </div>

                <button
                  onClick={handleStake}
                  disabled={stakingLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#E85D3A] text-white font-bold text-sm shadow-lg shadow-[#E85D3A]/20 hover:bg-[#D14C2A] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {stakingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Support with Coins</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {project.status === 'PENDING' && (
              <div className="pt-3 border-t border-[#E85D3A]/20">
                <p className="text-xs text-[#EAE2D5]/80 text-center py-3">
                  ⏳ Pending review — support will open once approved
                </p>
              </div>
            )}

            {project.status === 'REJECTED' && (
              <div className="pt-3 border-t border-[#E85D3A]/20">
                <p className="text-xs text-[#EAE2D5]/80 text-center py-3">
                  This project was not approved
                </p>
              </div>
            )}

            {project.status === 'FUNDED' && (
              <div className="pt-3 border-t border-[#E85D3A]/20">
                <p className="text-xs text-[#E85D3A]/60 text-center py-3">
                  🎉 This project has been funded!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={parsedImages}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(i) => setLightboxIndex(i)}
        />
      )}
    </div>
  );
}
