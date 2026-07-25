'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Clock,
  Coins,
  ExternalLink,
  Search,
  Filter,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Calendar,
  User,
} from 'lucide-react';

const GET_ALL_PROJECTS_FOR_REVIEW = gql`
  query GetProjects($status: ProjectStatus) {
    getProjects(status: $status) {
      id
      title
      description
      images
      status
      totalCoinsCollected
      creatorId
      createdAt
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

interface Project {
  id: string;
  title: string;
  description: string;
  images: string[] | string;
  status: string;
  totalCoinsCollected: number;
  creatorId: string;
  createdAt: string;
}

const statusColors: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    bg: string;
    text: string;
    border: string;
  }
> = {
  PENDING: {
    label: 'Pending',
    icon: Clock,
    bg: 'bg-[#E85D3A]/20',
    text: 'text-[#E85D3A]',
    border: 'border-[#E85D3A]/30',
  },
  APPROVED: {
    label: 'Approved',
    icon: CheckCircle2,
    bg: 'bg-[#E85D3A]/15',
    text: 'text-[#E85D3A]',
    border: 'border-[#E85D3A]/30',
  },
  REJECTED: {
    label: 'Rejected',
    icon: XCircle,
    bg: 'bg-[#E85D3A]/10',
    text: 'text-[#EAE2D5]/80',
    border: 'border-[#E85D3A]/20',
  },
  FUNDED: {
    label: 'Funded',
    icon: CheckCircle2,
    bg: 'bg-[#E85D3A]/20',
    text: 'text-[#E85D3A]',
    border: 'border-[#E85D3A]/30',
  },
};

export default function ReviewProjectsPage() {
  const { user } = useUser();
  const [filterTab, setFilterTab] = useState<
    'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  >('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

  const { data, loading, refetch } = useQuery<{ getProjects: Project[] }>(
    GET_ALL_PROJECTS_FOR_REVIEW,
    {
      variables: filterTab === 'ALL' ? {} : { status: filterTab },
      fetchPolicy: 'network-only',
    },
  );

  const [reviewProject, { loading: reviewing }] = useMutation<MutationData>(
    REVIEW_PROJECT_MUTATION,
    {
      onCompleted: (data) => {
        const status = data?.reviewProject?.status;
        setToastMessage({
          type: 'success',
          text:
            status === 'APPROVED'
              ? 'Project approved successfully! 🎉'
              : 'Project rejected.',
        });
        setTimeout(() => setToastMessage(null), 3000);
        refetch();
      },
      onError: (err) => {
        setToastMessage({ type: 'error', text: `Error: ${err.message}` });
        setTimeout(() => setToastMessage(null), 5000);
      },
    },
  );

  const handleReview = useCallback(
    async (projectId: string, status: 'APPROVED' | 'REJECTED') => {
      if (!user?.id) return;
      try {
        await reviewProject({
          variables: { projectId, reviewerId: user.id, status },
        });
      } catch (e) {
        console.error('Review error:', e);
      }
    },
    [user?.id, reviewProject],
  );

  const projects = data?.getProjects || [];

  const filteredProjects = useMemo(
    () =>
      projects.filter((p) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }),
    [projects, searchQuery],
  );

  const stats = useMemo(
    () => ({
      all: projects.length,
      pending: projects.filter((p) => p.status === 'PENDING').length,
      approved: projects.filter((p) => p.status === 'APPROVED').length,
      rejected: projects.filter((p) => p.status === 'REJECTED').length,
    }),
    [projects],
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(Number(dateStr) || dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
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

  const tabs = [
    { id: 'ALL' as const, label: 'All', count: stats.all },
    { id: 'PENDING' as const, label: 'Pending', count: stats.pending },
    { id: 'APPROVED' as const, label: 'Approved', count: stats.approved },
    { id: 'REJECTED' as const, label: 'Rejected', count: stats.rejected },
  ];

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#E85D3A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-[#E85D3A]/15 border border-[#E85D3A]/20">
              <CheckSquare className="w-5 h-5 text-[#E85D3A]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#EAE2D5]">
                Review Projects
              </h1>
              <p className="text-xs text-[#EAE2D5]/80">
                Review and decide on student submissions
              </p>
            </div>
          </div>
        </div>
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#EAE2D5]/80" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 text-xs text-[#EAE2D5] placeholder-[#242831] focus:outline-none focus:border-[#E85D3A] transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={`p-4 rounded-xl border text-left transition-all ${
              filterTab === tab.id
                ? 'bg-[#2D323E] border-[#E85D3A]/30'
                : 'bg-[#2D323E] border-[#E85D3A]/20 hover:border-[#E85D3A]/30'
            }`}
          >
            <p className="text-2xl font-bold text-[#EAE2D5]">{tab.count}</p>
            <p
              className={`text-[10px] font-semibold mt-0.5 ${filterTab === tab.id ? 'text-[#E85D3A]' : 'text-[#EAE2D5]/80'}`}
            >
              {tab.label}
            </p>
          </button>
        ))}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 text-center">
          {filterTab === 'PENDING' ? (
            <>
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-[#E85D3A] opacity-50" />
              <p className="text-sm text-[#EAE2D5]/80 font-medium">
                All caught up!
              </p>
              <p className="text-xs text-[#EAE2D5]/80/60 mt-1">
                No pending projects to review.
              </p>
            </>
          ) : (
            <>
              <Filter className="w-10 h-10 mx-auto mb-3 text-[#EAE2D5]/80 opacity-50" />
              <p className="text-sm text-[#EAE2D5]/80 font-medium">
                No projects found
              </p>
              <p className="text-xs text-[#EAE2D5]/80/60 mt-1">
                Try a different filter or search term.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project) => {
            const statusStyle =
              statusColors[project.status] || statusColors.PENDING;
            const StatusIcon = statusStyle.icon;
            const isExpanded = expandedId === project.id;
            const images = parseImages(project.images);

            return (
              <div
                key={project.id}
                className="rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 overflow-hidden transition-all hover:border-[#E85D3A]/30"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <div className="hidden sm:block w-14 h-14 rounded-xl bg-[#E85D3A]/15 overflow-hidden shrink-0 border border-[#E85D3A]/20">
                      {images[0] ? (
                        <img
                          src={images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-[#EAE2D5]/80/50" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-[#EAE2D5] truncate">
                            {project.title}
                          </h3>
                          <p className="text-xs text-[#EAE2D5]/80 line-clamp-2 mt-1 leading-relaxed">
                            {project.description}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusStyle.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-[10px] text-[#EAE2D5]/80">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(project.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          {project.totalCoinsCollected} coins
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {project.creatorId.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E85D3A]/15">
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : project.id)
                      }
                      className="flex items-center gap-1.5 text-[10px] font-semibold text-[#EAE2D5]/80 hover:text-[#E85D3A] transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" /> Less details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" /> More details
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      {project.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleReview(project.id, 'APPROVED')}
                            disabled={reviewing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E85D3A]/15 text-[#E85D3A] hover:bg-[#E85D3A]/25 transition-colors disabled:opacity-50 border border-[#E85D3A]/30 text-[10px] font-bold"
                          >
                            {reviewing ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(project.id, 'REJECTED')}
                            disabled={reviewing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E85D3A]/80 text-white hover:bg-[#E85D3A] transition-colors disabled:opacity-50 border border-[#E85D3A] text-[10px] font-bold"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                      <Link
                        href={`/teacher-dashboard/project/${project.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E85D3A]/10 text-[#EAE2D5]/80 hover:text-[#E85D3A] transition-colors border border-[#E85D3A]/20 text-[10px] font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Details
                      </Link>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[#E85D3A]/15 space-y-3">
                      {images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto scrollbar-none">
                          {images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`${project.title} image ${i + 1}`}
                              className="h-28 w-40 object-cover rounded-xl border border-[#E85D3A]/20 shrink-0"
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-[#EAE2D5]/80 leading-relaxed whitespace-pre-wrap">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-[#EAE2D5]/80">
                        <Coins className="w-3 h-3" />
                        Total coins collected:{' '}
                        <span className="text-[#EAE2D5] font-semibold">
                          {project.totalCoinsCollected}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
