'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import {
  FolderKanban,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Coins,
  Edit3,
  ExternalLink,
  Loader2,
  AlertCircle,
  Search,
} from 'lucide-react';
import { gql } from '@apollo/client';
import EditProjectModal from './EditProjectModal';

export const GET_MY_PROJECTS_QUERY = gql`
  query GetMyProjects {
    getMyProjects {
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

export interface Project {
  id: string;
  title: string;
  description: string;
  images?: string[];
  status: string;
  totalCoinsCollected?: number;
  createdAt: string;
}

interface GetMyProjectsQueryData {
  getMyProjects: Project[];
}

const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; colors: string }
> = {
  PENDING: {
    label: 'Pending',
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
    icon: CheckCircle2,
    colors: 'bg-[#E85D3A]/20 text-[#EAE2D5] border-[#E85D3A]/40',
  },
};

export default function StudentOwnProjects() {
  const { user, isLoaded: userLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery<GetMyProjectsQueryData>(
    GET_MY_PROJECTS_QUERY,
    { fetchPolicy: 'network-only' },
  );
  const projects = data?.getMyProjects || [];

  const filteredProjects = useMemo(
    () =>
      projects.filter((p) => {
        const matchesTab =
          activeTab === 'ALL' ||
          p.status.toUpperCase() === activeTab.toUpperCase();
        const matchesSearch =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
      }),
    [projects, activeTab, searchQuery],
  );

  const stats = useMemo(
    () => ({
      all: projects.length,
      approved: projects.filter((p) => p.status === 'APPROVED').length,
      funded: projects.filter((p) => p.status === 'FUNDED').length,
      rejected: projects.filter((p) => p.status === 'REJECTED').length,
      pending: projects.filter((p) => p.status === 'PENDING').length,
    }),
    [projects],
  );

  const totalCoins = useMemo(
    () => projects.reduce((sum, p) => sum + (p.totalCoinsCollected ?? 0), 0),
    [projects],
  );

  const tabs = [
    { id: 'ALL', label: 'All', count: stats.all },
    { id: 'APPROVED', label: 'Approved', count: stats.approved },
    { id: 'FUNDED', label: 'Funded', count: stats.funded },
    { id: 'PENDING', label: 'Pending', count: stats.pending },
    { id: 'REJECTED', label: 'Rejected', count: stats.rejected },
  ];

  if (!userLoaded || (loading && !data)) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#E85D3A]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-[#E85D3A]/15 border border-[#E85D3A]/20">
              <FolderKanban className="w-5 h-5 text-[#E85D3A]" />
            </div>
            <h1 className="text-xl font-bold text-[#EAE2D5]">My Projects</h1>
          </div>
          <p className="text-xs text-[#EAE2D5]/80">
            Track your submitted projects
          </p>
        </div>
        <Link
          href="/student-dashboard/createProject"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E85D3A] text-white font-semibold text-xs hover:bg-[#D14C2A] transition-all shadow-lg shadow-[#E85D3A]/20"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#2D323E] border border-[#E85D3A]/20">
          <p className="text-2xl font-bold text-[#EAE2D5]">{stats.all}</p>
          <p className="text-[10px] text-[#EAE2D5]/80 mt-0.5">Total Projects</p>
        </div>
        <div className="p-4 rounded-xl bg-[#2D323E] border border-[#E85D3A]/20">
          <p className="text-2xl font-bold text-[#E85D3A]">{stats.approved}</p>
          <p className="text-[10px] text-[#EAE2D5]/80 mt-0.5">Approved</p>
        </div>
        <div className="p-4 rounded-xl bg-[#2D323E] border border-[#E85D3A]/20">
          <p className="text-2xl font-bold text-[#E85D3A]">{totalCoins}</p>
          <p className="text-[10px] text-[#EAE2D5]/80 mt-0.5">Total Coins</p>
        </div>
        <div className="p-4 rounded-xl bg-[#2D323E] border border-[#E85D3A]/20">
          <p className="text-2xl font-bold text-[#EAE2D5]">{stats.funded}</p>
          <p className="text-[10px] text-[#EAE2D5]/80 mt-0.5">Funded</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#E85D3A]/15 text-[#E85D3A] border border-[#E85D3A]/30'
                  : 'text-[#EAE2D5]/80 hover:text-[#E85D3A] hover:bg-[#E85D3A]/10'
              }`}
            >
              {tab.label}
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] ${activeTab === tab.id ? 'bg-[#E85D3A]/20 text-[#E85D3A]' : 'bg-[#E85D3A]/10 text-[#EAE2D5]/80'}`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#EAE2D5]/80/50" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#E85D3A]/10 border border-[#E85D3A]/20 text-xs text-[#EAE2D5] placeholder-[#242831] focus:outline-none focus:border-[#E85D3A]/30 transition"
          />
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error.message}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-16 rounded-2xl bg-[#2D323E] border border-dashed border-[#E85D3A]/30 text-center">
          <FolderKanban className="w-10 h-10 mx-auto mb-3 text-[#EAE2D5]/80/40" />
          <p className="text-sm text-[#EAE2D5]/80 font-medium">
            No projects found
          </p>
          <p className="text-[10px] text-[#EAE2D5]/80/50 mt-1">
            {searchQuery
              ? 'Try a different search'
              : 'Submit your first project!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const status =
              statusConfig[project.status.toUpperCase()] ||
              statusConfig.PENDING;
            const StatusIcon = status.icon;

            const progress = Math.min(
              (project.totalCoinsCollected ?? 0) * 100,
              100,
            );

            return (
              <div
                key={project.id}
                className="group relative rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 hover:border-[#E85D3A]/40 transition-all duration-300 p-5 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold border ${status.colors}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setIsEditModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-[#EAE2D5]/80 hover:text-[#E85D3A] hover:bg-[#E85D3A]/15 transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 flex-1">
                  <h2 className="text-sm font-bold text-[#EAE2D5] group-hover:text-[#E85D3A] transition-colors line-clamp-1">
                    {project.title}
                  </h2>
                  <p className="text-[11px] text-[#EAE2D5]/80 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="space-y-3 pt-4 mt-4 border-t border-[#E85D3A]/15">
                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-1.5">
                      <span className="text-[#EAE2D5]/80 font-medium">
                        Progress
                      </span>
                      <span className="text-[#EAE2D5] font-semibold">
                        {project.totalCoinsCollected ?? 0}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#E85D3A]/15 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#E85D3A] to-[#E85D3A] transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#EAE2D5]/80/50">
                      {new Date(
                        Number(project.createdAt) || String(project.createdAt),
                      ).toLocaleDateString('en-US')}
                    </span>
                    <Link
                      href={`/student-dashboard/project/${project.id}`}
                      className="inline-flex items-center gap-1 text-[#E85D3A] hover:underline font-semibold"
                    >
                      Details <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedProject && (
        <EditProjectModal
          project={selectedProject}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProject(null);
          }}
          onUpdated={refetch}
        />
      )}
    </div>
  );
}
