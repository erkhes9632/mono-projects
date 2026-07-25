'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Coins,
  ExternalLink,
  GraduationCap,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  Lightbulb,
  CheckSquare,
  Medal,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const GET_ALL_PROJECTS_STATS = gql`
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

const GET_ALL_USERS_FOR_STATS = gql`
  query GetUsers {
    getUsers {
      id
      role
      coinBalance
    }
  }
`;

const GET_LEADERBOARD = gql`
  query GetLeaderboardProjects($limit: Int) {
    getLeaderboardProjects(limit: $limit) {
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

interface UserSummary {
  id: string;
  role: string;
  coinBalance: number;
}

export default function TeacherDashboard() {
  const { user } = useUser();

  const { data: allData, loading: allLoading } = useQuery<{
    getProjects: Project[];
  }>(GET_ALL_PROJECTS_STATS, { fetchPolicy: 'network-only' });

  const { data: pendingData, loading: pendingLoading } = useQuery<{
    getProjects: Project[];
  }>(GET_ALL_PROJECTS_STATS, {
    variables: { status: 'PENDING' },
    fetchPolicy: 'network-only',
  });

  const { data: usersData, loading: usersLoading } = useQuery<{
    getUsers: UserSummary[];
  }>(GET_ALL_USERS_FOR_STATS, { fetchPolicy: 'network-only' });

  const { data: leaderboardData } = useQuery<{
    getLeaderboardProjects: Project[];
  }>(GET_LEADERBOARD, { variables: { limit: 5 }, fetchPolicy: 'network-only' });

  const projects = allData?.getProjects || [];
  const pendingProjects = pendingData?.getProjects || [];
  const allUsers = usersData?.getUsers || [];
  const trendingProjects = leaderboardData?.getLeaderboardProjects || [];

  const stats = useMemo(() => {
    const total = projects.length;
    const pending = projects.filter((p) => p.status === 'PENDING').length;
    const approved = projects.filter((p) => p.status === 'APPROVED').length;
    const rejected = projects.filter((p) => p.status === 'REJECTED').length;
    const funded = projects.filter((p) => p.status === 'FUNDED').length;
    const totalCoins = projects.reduce(
      (s, p) => s + (p.totalCoinsCollected ?? 0),
      0,
    );
    const students = allUsers.filter((u) => u.role === 'STUDENT').length;
    const totalStudentCoins = allUsers
      .filter((u) => u.role === 'STUDENT')
      .reduce((s, u) => s + u.coinBalance, 0);

    return {
      total,
      pending,
      approved,
      rejected,
      funded,
      totalCoins,
      students,
      totalStudentCoins,
    };
  }, [projects, allUsers]);

  const recentApproved = useMemo(
    () =>
      projects
        .filter((p) => p.status === 'APPROVED' || p.status === 'FUNDED')
        .slice(0, 4),
    [projects],
  );

  const isLoading = allLoading && pendingLoading && usersLoading;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(Number(dateStr) || dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const parseImages = (imgs: string[] | string): string[] => {
    if (Array.isArray(imgs)) return imgs;
    try {
      return JSON.parse(imgs);
    } catch {
      return [];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          icon: Clock,
          bg: 'bg-[#E85D3A]/20',
          text: 'text-[#E85D3A]',
          border: 'border-[#E85D3A]/30',
        };
      case 'APPROVED':
        return {
          icon: CheckCircle2,
          bg: 'bg-[#242831]',
          text: 'text-[#E85D3A]',
          border: 'border-[#E85D3A]',
        };
      case 'REJECTED':
        return {
          icon: XCircle,
          bg: 'bg-[#E85D3A]',
          text: 'text-[#E85D3A]',
          border: 'border-[#E85D3A]',
        };
      case 'FUNDED':
        return {
          icon: CheckCircle2,
          bg: 'bg-[#E85D3A]/20',
          text: 'text-[#E85D3A]',
          border: 'border-[#E85D3A]/30',
        };
      default:
        return {
          icon: Clock,
          bg: 'bg-[#E85D3A]/10',
          text: 'text-[#EAE2D5]/80',
          border: 'border-[#E85D3A]/20',
        };
    }
  };

  const medalColors = ['text-[#E85D3A]', 'text-[#EAE2D5]/80', 'text-[#EAE2D5]'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#E85D3A]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-[#2D323E] border border-[#E85D3A]/20 p-6">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#E85D3A]/10 blur-3xl rounded-full" />
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-[#E85D3A]/10 border border-[#E85D3A]/20">
              <GraduationCap className="w-8 h-8 text-[#E85D3A]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#EAE2D5]">
                Welcome back, {user?.fullName?.split(' ')[0] || 'Teacher'}
              </h1>
              <p className="text-sm text-[#EAE2D5]/80">
                Manage student projects and oversee the funding platform
              </p>
            </div>
          </div>
          <Link
            href="/teacher-dashboard/review"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E85D3A]/10 text-[#E85D3A] hover:bg-[#E85D3A]/20 transition-all border border-[#E85D3A]/20 font-semibold text-xs"
          >
            <CheckSquare className="w-4 h-4" />
            Review Projects
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#2D323E] border border-[#E85D3A]/20">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded-lg bg-[#E85D3A]/15">
              <FileText className="w-4 h-4 text-[#E85D3A]" />
            </div>
            <span className="text-[10px] font-bold text-[#EAE2D5]/80 uppercase">
              Total
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[#EAE2D5]">
            {stats.total}
          </p>
          <p className="text-[10px] text-[#EAE2D5]/80/60 mt-0.5">projects</p>
        </div>
        <div className="p-4 rounded-xl bg-[#2D323E] border border-[#E85D3A]/20">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded-lg bg-[#E85D3A]/15">
              <Clock className="w-4 h-4 text-[#E85D3A]" />
            </div>
            <span className="text-[10px] font-bold text-[#EAE2D5]/80 uppercase">
              Pending
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[#E85D3A]">
            {stats.pending}
          </p>
          <p className="text-[10px] text-[#EAE2D5]/80/60 mt-0.5">
            awaiting review
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#2D323E] border border-[#E85D3A]/20">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded-lg bg-[#E85D3A]/15">
              <CheckCircle2 className="w-4 h-4 text-[#E85D3A]" />
            </div>
            <span className="text-[10px] font-bold text-[#EAE2D5]/80 uppercase">
              Approved
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[#E85D3A]">
            {stats.approved}
          </p>
          <p className="text-[10px] text-[#EAE2D5]/80/60 mt-0.5">
            live for funding
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#2D323E] border border-[#E85D3A]/20">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded-lg bg-[#E85D3A]/15">
              <Coins className="w-4 h-4 text-[#E85D3A]" />
            </div>
            <span className="text-[10px] font-bold text-[#EAE2D5]/80 uppercase">
              Coins
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[#EAE2D5]">
            {stats.totalCoins}
          </p>
          <p className="text-[10px] text-[#EAE2D5]/80/60 mt-0.5">
            total raised
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#2D323E] border border-[#E85D3A]/20">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded-lg bg-[#E85D3A]/15">
              <Users className="w-4 h-4 text-[#E85D3A]" />
            </div>
            <span className="text-[10px] font-bold text-[#EAE2D5]/80 uppercase">
              Students
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[#EAE2D5]">
            {stats.students}
          </p>
          <p className="text-[10px] text-[#EAE2D5]/80/60 mt-0.5">
            active participants
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#2D323E] border border-[#E85D3A]/20">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded-lg bg-[#E85D3A]/15">
              <TrendingUp className="w-4 h-4 text-[#E85D3A]" />
            </div>
            <span className="text-[10px] font-bold text-[#EAE2D5]/80 uppercase">
              Funded
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[#E85D3A]">
            {stats.funded}
          </p>
          <p className="text-[10px] text-[#EAE2D5]/80/60 mt-0.5">
            successfully funded
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#2D323E] border border-[#E85D3A]/20">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded-lg bg-[#E85D3A]/15">
              <XCircle className="w-4 h-4 text-[#EAE2D5]/80" />
            </div>
            <span className="text-[10px] font-bold text-[#EAE2D5]/80 uppercase">
              Rejected
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[#EAE2D5]/80">
            {stats.rejected}
          </p>
          <p className="text-[10px] text-[#EAE2D5]/80/60 mt-0.5">
            not approved
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#2D323E] border border-[#E85D3A]/20">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded-lg bg-[#E85D3A]/15">
              <Coins className="w-4 h-4 text-[#E85D3A]" />
            </div>
            <span className="text-[10px] font-bold text-[#EAE2D5]/80 uppercase">
              Student $
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[#EAE2D5]">
            {stats.totalStudentCoins}
          </p>
          <p className="text-[10px] text-[#EAE2D5]/80/60 mt-0.5">
            student coin pool
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 overflow-hidden">
            <div className="p-5 border-b border-[#E85D3A]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#E85D3A]/15">
                  <Clock className="w-5 h-5 text-[#E85D3A]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#EAE2D5]">
                    Pending Reviews
                  </h3>
                  <p className="text-[10px] text-[#EAE2D5]/80">
                    {stats.pending} project(s) awaiting your decision
                  </p>
                </div>
              </div>
              <Link
                href="/teacher-dashboard/review"
                className="text-[10px] font-semibold text-[#E85D3A] hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {pendingProjects.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-[#E85D3A] opacity-50" />
                <p className="text-sm text-[#EAE2D5]/80">
                  All projects have been reviewed!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E85D3A]/15">
                {pendingProjects.slice(0, 5).map((project) => {
                  const images = parseImages(project.images);
                  return (
                    <div
                      key={project.id}
                      className="p-4 hover:bg-[#E85D3A]/10 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#E85D3A]/15 overflow-hidden shrink-0 border border-[#E85D3A]/20">
                          {images[0] ? (
                            <img
                              src={images[0]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs">
                              💡
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[#EAE2D5] truncate">
                            {project.title}
                          </h4>
                          <p className="text-[10px] text-[#EAE2D5]/80 mt-0.5">
                            {project.creatorId.slice(0, 8)}... &middot;{' '}
                            {formatDate(project.createdAt)}
                          </p>
                        </div>
                        <Link
                          href={`/teacher-dashboard/project/${project.id}`}
                          className="shrink-0 p-2 rounded-lg bg-[#E85D3A]/15 text-[#EAE2D5]/80 hover:text-[#E85D3A] transition-colors border border-[#E85D3A]/20"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 overflow-hidden">
            <div className="p-5 border-b border-[#E85D3A]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#E85D3A]/15">
                  <TrendingUp className="w-5 h-5 text-[#E85D3A]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#EAE2D5]">
                    Trending Projects
                  </h3>
                  <p className="text-[10px] text-[#EAE2D5]/80">
                    Most funded this period
                  </p>
                </div>
              </div>
            </div>

            {trendingProjects.length === 0 ? (
              <div className="p-8 text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-[#EAE2D5]/80/40" />
                <p className="text-xs text-[#EAE2D5]/80">
                  No trending projects yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E85D3A]/15">
                {trendingProjects.map((project, i) => {
                  const images = parseImages(project.images);
                  return (
                    <Link
                      key={project.id}
                      href={`/teacher-dashboard/project/${project.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-[#E85D3A]/10 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#E85D3A]/15 border border-[#E85D3A]/20 flex items-center justify-center shrink-0">
                        {i < 3 ? (
                          <Medal className={`w-4 h-4 ${medalColors[i]}`} />
                        ) : (
                          <span className="text-xs font-bold text-[#EAE2D5]/80">
                            {i + 1}
                          </span>
                        )}
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-[#E85D3A]/15 overflow-hidden shrink-0 border border-[#E85D3A]/20">
                        {images[0] ? (
                          <img
                            src={images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs">
                            💡
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#EAE2D5] truncate group-hover:text-[#E85D3A] transition-colors">
                          {project.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Coins className="w-3.5 h-3.5 text-[#E85D3A]" />
                        <span className="text-xs font-bold text-[#EAE2D5]">
                          {project.totalCoinsCollected}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 overflow-hidden">
            <div className="p-5 border-b border-[#E85D3A]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#E85D3A]/20">
                  <CheckCircle2 className="w-5 h-5 text-[#E85D3A]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#EAE2D5]">
                    Active Projects
                  </h3>
                  <p className="text-[10px] text-[#EAE2D5]/80">
                    Approved & funded projects
                  </p>
                </div>
              </div>
              <Link
                href="/teacher-dashboard/review"
                className="text-[10px] font-semibold text-[#E85D3A] hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentApproved.length === 0 ? (
              <div className="p-8 text-center">
                <Lightbulb className="w-8 h-8 mx-auto mb-2 text-[#EAE2D5]/80/40" />
                <p className="text-xs text-[#EAE2D5]/80">
                  No approved projects yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E85D3A]/15">
                {recentApproved.map((project) => {
                  const statusStyle = getStatusIcon(project.status);
                  const StatusIcon = statusStyle.icon;
                  const images = parseImages(project.images);
                  return (
                    <Link
                      key={project.id}
                      href={`/teacher-dashboard/project/${project.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-[#E85D3A]/10 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#E85D3A]/15 overflow-hidden shrink-0 border border-[#E85D3A]/20">
                        {images[0] ? (
                          <img
                            src={images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm">
                            💡
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#EAE2D5] truncate group-hover:text-[#E85D3A] transition-colors">
                          {project.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                          >
                            <StatusIcon className="w-2.5 h-2.5" />
                            {project.status}
                          </span>
                          <span className="text-[10px] text-[#EAE2D5]/80">
                            {project.totalCoinsCollected} coins
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#EAE2D5]/80 group-hover:text-[#E85D3A] transition-colors shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 p-5">
            <h3 className="text-xs font-bold text-[#EAE2D5] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E85D3A]" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                href="/teacher-dashboard/review"
                className="flex items-center gap-3 p-3 rounded-xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 hover:bg-[#E85D3A]/20 transition-all group"
              >
                <div className="p-2 rounded-lg bg-[#E85D3A]/15">
                  <CheckSquare className="w-4 h-4 text-[#E85D3A]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#EAE2D5] group-hover:text-[#E85D3A] transition-colors">
                    Review Projects
                  </p>
                  <p className="text-[10px] text-[#EAE2D5]/80">
                    {stats.pending} pending
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#EAE2D5]/80 group-hover:text-[#E85D3A]" />
              </Link>

              <Link
                href="/teacher-dashboard/students"
                className="flex items-center gap-3 p-3 rounded-xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 hover:bg-[#E85D3A]/20 transition-all group"
              >
                <div className="p-2 rounded-lg bg-[#E85D3A]/15">
                  <Users className="w-4 h-4 text-[#E85D3A]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#EAE2D5] group-hover:text-[#E85D3A] transition-colors">
                    View Students
                  </p>
                  <p className="text-[10px] text-[#EAE2D5]/80">
                    {stats.students} active
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#EAE2D5]/80 group-hover:text-[#E85D3A]" />
              </Link>

              <Link
                href="/teacher-dashboard/review"
                className="flex items-center gap-3 p-3 rounded-xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 hover:bg-[#E85D3A]/20 transition-all group"
              >
                <div className="p-2 rounded-lg bg-[#E85D3A]/15">
                  <BarChart3 className="w-4 h-4 text-[#E85D3A]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#EAE2D5] group-hover:text-[#E85D3A] transition-colors">
                    All Projects
                  </p>
                  <p className="text-[10px] text-[#EAE2D5]/80">
                    {stats.total} submissions
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#EAE2D5]/80 group-hover:text-[#E85D3A]" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 p-5">
            <h3 className="text-xs font-bold text-[#EAE2D5] uppercase tracking-wider mb-4">
              Platform Overview
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#EAE2D5]/80">Approval Rate</span>
                  <span className="text-[#EAE2D5] font-semibold">
                    {stats.total > 0
                      ? Math.round(
                          ((stats.approved + stats.funded) / stats.total) * 100,
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#E85D3A]/15 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#E85D3A] to-[#E85D3A] transition-all duration-500"
                    style={{
                      width: `${stats.total > 0 ? ((stats.approved + stats.funded) / stats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#EAE2D5]/80">Funding Progress</span>
                  <span className="text-[#EAE2D5] font-semibold">
                    {stats.total > 0
                      ? Math.round((stats.funded / stats.total) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#E85D3A]/15 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#E85D3A] to-[#E85D3A] transition-all duration-500"
                    style={{
                      width: `${stats.total > 0 ? (stats.funded / stats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 p-5 text-center">
            <Sparkles className="w-6 h-6 text-[#E85D3A] mx-auto mb-2" />
            <p className="text-3xl font-extrabold text-[#EAE2D5]">
              {stats.totalCoins}
            </p>
            <p className="text-xs text-[#EAE2D5]/80 mt-1">
              Total coins raised by students
            </p>
            <p className="text-[10px] text-[#EAE2D5]/80/50 mt-2">
              {stats.funded} project{stats.funded !== 1 ? 's' : ''} successfully
              funded
            </p>
          </div>

          {stats.pending > 0 && (
            <Link
              href="/teacher-dashboard/review"
              className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#E85D3A]/15 border border-[#E85D3A]/30 hover:bg-[#E85D3A]/20 transition-all group"
            >
              <Clock className="w-4 h-4 text-[#E85D3A]" />
              <span className="text-xs font-semibold text-[#E85D3A] group-hover:text-[#EAE2D5] transition-colors">
                {stats.pending} project{stats.pending !== 1 ? 's' : ''} need
                {stats.pending === 1 ? 's' : ''} your review
              </span>
              <ArrowRight className="w-4 h-4 text-[#E85D3A] group-hover:text-[#EAE2D5] transition-colors" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
