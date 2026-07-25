'use client';

import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Clock,
  Coins,
  MessageSquare,
  Send,
  Image as ImageIcon,
  Calendar,
  Sparkles,
  CheckCheck,
  User,
  ExternalLink,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Users,
} from 'lucide-react';
import { CommentItem } from '../../../components/CommentItem';
import ImageLightbox from '../../../components/ImageLightbox';

const GET_PROJECT_BY_ID_QUERY = gql`
  query GetProjectById($id: ID!) {
    getProjectById(id: $id) {
      id
      title
      description
      images
      status
      totalCoinsCollected
      creatorId
      reviewedById
      createdAt
      updatedAt
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

const GET_USER_BY_ID = gql`
  query GetUserById($id: ID) {
    getUserById(id: $id) {
      id
      userName
      email
      avatarUrl
      role
      coinBalance
    }
  }
`;

const REVIEW_PROJECT_MUTATION = gql`
  mutation ReviewProject(
    $projectId: ID!
    $reviewerId: ID!
    $status: ProjectStatus!
  ) {
    reviewProject(
      projectId: $projectId
      reviewerId: $reviewerId
      status: $status
    ) {
      id
      title
      status
      reviewedById
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
  creatorId: string;
  reviewedById?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  id: string;
  userName: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  coinBalance: number;
}

export default function TeacherProjectDetail({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const router = useRouter();
  const { user } = useUser();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  type MutationData = {
    reviewProject: {
      id: string;
      title: string;
      status: string;
      reviewedById?: string | null;
    };
  };

  // Resolve Next.js 15+ async params or legacy sync params
  React.useEffect(() => {
    const resolveParams = async () => {
      if (params instanceof Promise) {
        const p = await params;
        setProjectId(p.id);
      } else {
        setProjectId(params.id);
      }
    };
    resolveParams();
  }, [params]);

  const {
    loading: projectLoading,
    error: projectError,
    data: projectData,
    refetch: refetchProject,
  } = useQuery<{ getProjectById: Project | null }>(GET_PROJECT_BY_ID_QUERY, {
    variables: { id: projectId },
    skip: !projectId,
    fetchPolicy: 'network-only',
  });

  const { data: commentsData, refetch: refetchComments } = useQuery<{
    getProjectComments: Comment[];
  }>(GET_PROJECT_COMMENTS_QUERY, {
    variables: { projectId },
    skip: !projectId,
    fetchPolicy: 'network-only',
  });

  const project = projectData?.getProjectById;

  const { data: creatorData } = useQuery<{ getUserById: UserData | null }>(
    GET_USER_BY_ID,
    {
      variables: { id: project?.creatorId },
      skip: !project?.creatorId,
      fetchPolicy: 'network-only',
    },
  );

  const { data: reviewerData } = useQuery<{ getUserById: UserData | null }>(
    GET_USER_BY_ID,
    {
      variables: { id: project?.reviewedById },
      skip: !project?.reviewedById,
      fetchPolicy: 'network-only',
    },
  );

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [reviewProject, { loading: reviewing }] = useMutation<MutationData>(
    REVIEW_PROJECT_MUTATION,
    {
      onCompleted: (data) => {
        const status = data?.reviewProject?.status;
        setToastMessage({
          type: 'success',
          text:
            status === 'APPROVED'
              ? 'Project approved! 🎉'
              : 'Project rejected.',
        });
        setTimeout(() => setToastMessage(null), 3000);
        refetchProject();
      },
      onError: (err) => {
        setToastMessage({ type: 'error', text: `Error: ${err.message}` });
        setTimeout(() => setToastMessage(null), 5000);
      },
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

  const handleReview = useCallback(
    async (status: 'APPROVED' | 'REJECTED') => {
      if (!user?.id || !projectId) return;
      try {
        await reviewProject({
          variables: { projectId, reviewerId: user.id, status },
        });
      } catch (e) {
        console.error('Review error:', e);
      }
    },
    [user?.id, projectId, reviewProject],
  );

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !projectId) return;
    addComment({
      variables: { input: { projectId, content: commentText.trim() } },
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(Number(dateStr) || dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
  };

  const parseImages = (images: string[] | string): string[] => {
    if (Array.isArray(images)) return images;
    try {
      return JSON.parse(images);
    } catch {
      return [];
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Pending Review',
          icon: Clock,
          bg: 'bg-[#242831]',
          text: 'text-[#E85D3A]',
          border: 'border-[#E85D3A]',
        };
      case 'APPROVED':
        return {
          label: 'Approved',
          icon: CheckCircle2,
          bg: 'bg-[#242831]',
          text: 'text-[#E85D3A]',
          border: 'border-[#E85D3A]',
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          icon: XCircle,
          bg: 'bg-[#E85D3A]',
          text: 'text-[#E85D3A]',
          border: 'border-[#E85D3A]',
        };
      case 'FUNDED':
        return {
          label: 'Funded',
          icon: CheckCheck,
          bg: 'bg-[#2D323E]/20',
          text: 'text-[#E85D3A]',
          border: 'border-[#242831]/50',
        };
      default:
        return {
          label: status,
          icon: AlertCircle,
          bg: 'bg-[#242831]',
          text: 'text-[#EAE2D5]',
          border: 'border-[#E85D3A]',
        };
    }
  };

  if (projectLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-[#242831] rounded-xl w-24" />
        <div className="h-[300px] bg-[#242831] rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-[#242831] rounded-xl w-2/3" />
            <div className="h-32 bg-[#242831] rounded-2xl" />
          </div>
          <div className="h-64 bg-[#242831] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[#E85D3A]" />
        <p className="text-white font-medium mb-2">Project not found</p>
        <p className="text-xs text-[#EAE2D5]/60 mb-6">
          {projectError?.message || 'This project may have been removed.'}
        </p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl bg-[#242831]/30 text-[#E85D3A] hover:bg-[#242831] border border-[#242831]/50 text-xs font-semibold transition cursor-pointer"
        >
          Go back
        </button>
      </div>
    );
  }

  const comments = commentsData?.getProjectComments || [];
  const creator = creatorData?.getUserById;
  const reviewer = reviewerData?.getUserById;
  const images = parseImages(project.images);
  const statusConfig = getStatusConfig(project.status);
  const StatusIcon = statusConfig.icon;
  const isPending = project.status === 'PENDING';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl text-sm font-semibold border backdrop-blur-md transition-all animate-in slide-in-from-right ${
            toastMessage.type === 'success'
              ? 'bg-[#242831]/90 text-[#E85D3A] border-[#E85D3A]'
              : 'bg-[#E85D3A]/90 text-white border-[#E85D3A]'
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#EAE2D5]/70 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to teacher dashboard
      </button>

      <div className="relative h-[300px] rounded-3xl overflow-hidden bg-[#242831] border border-[#242831]/30">
        {images[0] ? (
          <button
            onClick={() => images.length > 0 && setLightboxIndex(0)}
            className="w-full h-full cursor-pointer"
          >
            <img
              src={images[0]}
              alt={project.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </button>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#242831]/30 flex items-center justify-center mb-3 border border-[#242831]/50">
              <ImageIcon className="w-7 h-7 text-[#EAE2D5]/80/30" />
            </div>
            <p className="text-[#EAE2D5]/80/40 text-sm font-medium">
              No image provided
            </p>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#242831] via-transparent to-transparent" />

        <div className="absolute top-5 left-5 right-5 flex items-start justify-between">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {statusConfig.label}
          </div>
          <div className="px-3 py-1.5 rounded-full bg-[#242831]/50 backdrop-blur-md border border-[#242831]/50 flex items-center gap-2">
            <Coins className="w-3.5 h-3.5 text-[#E85D3A]" />
            <span className="text-xs font-bold text-white">
              {project.totalCoinsCollected}
            </span>
            <span className="text-[9px] text-[#EAE2D5]/50 font-medium">
              coins raised
            </span>
          </div>
        </div>

        <div className="absolute bottom-5 left-5 right-5">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {project.title}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-[#EAE2D5]/60">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(project.createdAt)}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#2D323E]/20" />
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {creator?.userName || 'Unknown'}{' '}
              {creator?.role === 'STUDENT' ? '(Student)' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {creator && (
            <div className="p-5 rounded-2xl bg-[#242831] border border-[#242831]/30 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#242831]/30 border border-[#242831]/50 shrink-0">
                {creator.avatarUrl ? (
                  <img
                    src={creator.avatarUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#EAE2D5]/80" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">
                  {creator.userName}
                </p>
                <p className="text-[10px] text-[#EAE2D5]/60">{creator.email}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-[#E85D3A]" />
                <span className="text-sm font-bold text-white">
                  {creator.coinBalance}
                </span>
              </div>
            </div>
          )}

          <div className="p-6 rounded-2xl bg-[#242831] border border-[#242831]/30 space-y-4">
            <h3 className="text-xs font-bold text-[#E85D3A] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Project Description
            </h3>
            <p className="text-sm text-[#EAE2D5] leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>

          {!isPending && reviewer && (
            <div className="p-5 rounded-2xl bg-[#242831] border border-[#242831]/30 flex items-center gap-4">
              {project.status === 'APPROVED' ? (
                <div className="p-2.5 rounded-xl bg-[#242831] border border-[#E85D3A]">
                  <ThumbsUp className="w-5 h-5 text-[#E85D3A]" />
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-[#E85D3A] border border-[#E85D3A]">
                  <ThumbsDown className="w-5 h-5 text-[#E85D3A]" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-xs font-semibold text-white">
                  {project.status === 'APPROVED'
                    ? 'Approved by'
                    : 'Rejected by'}{' '}
                  {reviewer.userName}
                </p>
                <p className="text-[10px] text-[#EAE2D5]/60 mt-0.5">
                  {reviewer.email}
                </p>
              </div>
              <span className="text-[10px] text-[#EAE2D5]/60">
                {formatDate(project.updatedAt)}
              </span>
            </div>
          )}

          <div className="p-6 rounded-2xl bg-[#242831] border border-[#242831]/30 space-y-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#E85D3A]" />
              Comments & Feedback ({comments.length})
            </h3>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Add your feedback as a teacher..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#242831]/30 border border-[#242831]/50 text-white text-sm placeholder-[#242831] focus:outline-none focus:border-[#E85D3A] transition"
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
                    projectId={project.id}
                    refetchComments={refetchComments}
                  />
                ))
              ) : (
                <p className="text-xs text-[#EAE2D5]/60 text-center py-6">
                  No comments yet. Be the first to provide feedback!
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-6 space-y-4">
          <div className="p-6 rounded-2xl bg-[#242831] border border-[#242831]/30 space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#242831]/30 border border-[#242831]/50 mb-3">
                <Flag className="w-6 h-6 text-[#E85D3A]" />
              </div>
              <p className="text-[10px] font-bold text-[#EAE2D5]/60 uppercase tracking-wider mb-1">
                Teacher Decision
              </p>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-sm font-bold text-white">
                  Review this project
                </span>
              </div>
            </div>

            {isPending ? (
              <div className="space-y-3 pt-2">
                <p className="text-[11px] text-[#EAE2D5]/60 text-center">
                  This project is awaiting your review. Approve it to allow
                  students to fund it with their coins.
                </p>
                <button
                  onClick={() => handleReview('APPROVED')}
                  disabled={reviewing}
                  className="w-full py-3 px-4 rounded-xl bg-[#242831] text-[#E85D3A] font-bold text-sm border border-[#E85D3A] hover:bg-[#E85D3A] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {reviewing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Approve Project
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleReview('REJECTED')}
                  disabled={reviewing}
                  className="w-full py-3 px-4 rounded-xl bg-[#E85D3A]/80 text-white font-bold text-sm border border-[#E85D3A] hover:bg-[#E85D3A] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" /> Reject Project
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-[#242831]/30">
                <p className="text-xs text-[#EAE2D5]/60 text-center py-3">
                  {project.status === 'APPROVED'
                    ? '✅ This project has been approved and is open for funding.'
                    : project.status === 'REJECTED'
                      ? '❌ This project was not approved.'
                      : '🎉 This project has been funded!'}
                </p>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-[#242831] border border-[#242831]/30 space-y-4">
            <h3 className="text-[10px] font-bold text-[#EAE2D5]/60 uppercase tracking-wider">
              Project Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#EAE2D5]/60">Status</span>
                <span className={`text-[10px] font-bold ${statusConfig.text}`}>
                  {statusConfig.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#EAE2D5]/60">
                  Coins Raised
                </span>
                <span className="text-xs font-bold text-white">
                  {project.totalCoinsCollected}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#EAE2D5]/60">Created</span>
                <span className="text-[10px] text-[#EAE2D5]">
                  {formatDate(project.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#EAE2D5]/60">Creator</span>
                <span className="text-[10px] text-[#E85D3A] font-semibold">
                  {creator?.userName || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          <Link
            href={`/student-dashboard/project/${project.id}`}
            className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#242831] border border-[#242831]/30 hover:border-[#E85D3A]/20 transition-all group"
          >
            <Users className="w-4 h-4 text-[#EAE2D5]/80 group-hover:text-[#E85D3A] transition-colors" />
            <span className="text-xs font-semibold text-[#EAE2D5]/80 group-hover:text-[#E85D3A] transition-colors">
              View as Student
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-[#EAE2D5]/80 group-hover:text-[#E85D3A] transition-colors" />
          </Link>
        </div>
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(i) => setLightboxIndex(i)}
        />
      )}
    </div>
  );
}
