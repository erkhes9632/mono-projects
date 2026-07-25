'use client';

import React, { useMemo } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import {
  Coins,
  TrendingUp,
  CheckCircle2,
  Lightbulb,
  Plus,
  ArrowRight,
  Loader2,
  Clock,
  Flame,
  Sparkles,
  Medal,
  ExternalLink,
  BarChart3,
  Users,
} from 'lucide-react';

const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    getMyProjects {
      id
      title
      status
      totalCoinsCollected
      createdAt
    }
    getLeaderboardProjects(limit: 5) {
      id
      title
      description
      images
      status
      totalCoinsCollected
      createdAt
    }
    getProjects {
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

const GET_USER_INFO = gql`
  query GetUserById {
    getUserById {
      id
      userName
      coinBalance
      createdAt
    }
  }
`;

interface Project {
  id: string;
  title: string;
  description?: string;
  images?: string[] | string;
  status: string;
  totalCoinsCollected: number;
  createdAt: string;
}

interface DashboardData {
  getMyProjects: Project[];
  getLeaderboardProjects: Project[];
  getProjects: Project[];
}

interface UserInfo {
  getUserById: {
    id: string;
    userName: string;
    coinBalance: number;
    createdAt: string;
  } | null;
}

export default function StudentDashboard() {
  const { data, loading } = useQuery<DashboardData>(GET_DASHBOARD_DATA, {
    fetchPolicy: 'network-only',
  });
  const { data: userData } = useQuery<UserInfo>(GET_USER_INFO, {
    pollInterval: 30000,
    fetchPolicy: 'network-only',
  });

  const myProjects: Project[] = data?.getMyProjects || [];
  const leaderboard: Project[] = data?.getLeaderboardProjects || [];
  const allProjects: Project[] = data?.getProjects || [];
  const userInfo = userData?.getUserById;

  const stats = useMemo(
    () => ({
      myProjectCount: myProjects.length,
      approvedCount: myProjects.filter((p) => p.status === 'APPROVED').length,
      fundedCount: allProjects.filter((p) => p.status === 'FUNDED').length,
      coinsEarned: myProjects.reduce(
        (s, p) => s + (p.totalCoinsCollected ?? 0),
        0,
      ),
      totalProjects: allProjects.length,
    }),
    [myProjects, allProjects],
  );

  const recentApproved = useMemo(
    () => allProjects.filter((p) => p.status === 'APPROVED').slice(0, 3),
    [allProjects],
  );

  const parseImages = (imgs: string[] | string): string[] => {
    if (Array.isArray(imgs)) return imgs;
    try {
      return JSON.parse(imgs);
    } catch {
      return [];
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(Number(dateStr) || dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const medalColors = ['text-[#E85D3A]', 'text-[#EAE2D5]/80', 'text-[#EAE2D5]'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#E85D3A]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 p-6">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#E85D3A]/10 blur-3xl" />
        <div className="flex items-start justify-between relative">
          <div>
            <h1 className="text-xl font-bold text-[#EAE2D5]">
              Welcome back,{' '}
              <span className="text-[#E85D3A]">
                {userInfo?.userName?.split(' ')[0] || 'Student'}
              </span>
            </h1>
            <p className="text-sm text-[#EAE2D5]/80 mt-1">
              Discover ideas and make an impact in your school
            </p>
          </div>
          <Link
            href="/student-dashboard/createProject"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E85D3A]/10 text-[#E85D3A] hover:bg-[#E85D3A]/20 transition-all border border-[#E85D3A]/20 font-semibold text-xs"
          >
            <Lightbulb className="w-4 h-4" />
            Propose Idea
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#2D323E] border border-[#E85D3A]/20">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded-lg bg-[#E85D3A]/15">
              <Coins className="w-4 h-4 text-[#E85D3A]" />
            </div>
            <span className="text-[10px] font-bold text-[#EAE2D5]/80 uppercase tracking-wider">
              My Balance
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[#EAE2D5]">
            {userInfo?.coinBalance ?? 0}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#2D323E] border border-[#E85D3A]/20">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded-lg bg-[#E85D3A]/15">
              <Lightbulb className="w-4 h-4 text-[#E85D3A]" />
            </div>
            <span className="text-[10px] font-bold text-[#EAE2D5]/80 uppercase tracking-wider">
              My Projects
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[#EAE2D5]">
            {stats.myProjectCount}
          </p>
          <p className="text-[10px] text-[#EAE2D5]/80/60 mt-0.5">
            {stats.approvedCount} approved
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#2D323E] border border-[#E85D3A]/20">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded-lg bg-[#E85D3A]/15">
              <TrendingUp className="w-4 h-4 text-[#E85D3A]" />
            </div>
            <span className="text-[10px] font-bold text-[#EAE2D5]/80 uppercase tracking-wider">
              Coins Raised
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[#EAE2D5]">
            {stats.coinsEarned}
          </p>
          <p className="text-[10px] text-[#EAE2D5]/80/60 mt-0.5">
            from your projects
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#2D323E] border border-[#E85D3A]/20">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded-lg bg-[#E85D3A]/15">
              <CheckCircle2 className="w-4 h-4 text-[#E85D3A]" />
            </div>
            <span className="text-[10px] font-bold text-[#EAE2D5]/80 uppercase tracking-wider">
              Total Projects
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[#EAE2D5]">
            {stats.totalProjects}
          </p>
          <p className="text-[10px] text-[#EAE2D5]/80/60 mt-0.5">
            {stats.fundedCount} funded
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E85D3A]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-[#E85D3A]/15">
                  <TrendingUp className="w-4 h-4 text-[#E85D3A]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#EAE2D5]">
                    Trending Projects
                  </h3>
                  <p className="text-[10px] text-[#EAE2D5]/80">
                    Top funded this period
                  </p>
                </div>
              </div>
              <Link
                href="/student-dashboard"
                className="text-[10px] font-semibold text-[#E85D3A] hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="divide-y divide-[#E85D3A]/15">
              {leaderboard.length === 0 ? (
                <div className="p-8 text-center">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 text-[#EAE2D5]/80/40" />
                  <p className="text-xs text-[#EAE2D5]/80">
                    No trending projects yet
                  </p>
                </div>
              ) : (
                leaderboard.map((project, i) => {
                  const images = parseImages(project.images!);
                  return (
                    <Link
                      key={project.id}
                      href={`/student-dashboard/project/${project.id}`}
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
                          <div className="w-full h-full flex items-center justify-center text-xs text-[#EAE2D5]/80/50">
                            💡
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#EAE2D5] truncate group-hover:text-[#E85D3A] transition-colors">
                          {project.title}
                        </p>
                        <p className="text-[10px] text-[#EAE2D5]/80 truncate">
                          {project.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Coins className="w-3.5 h-3.5 text-[#E85D3A]" />
                        <span className="text-xs font-bold text-[#EAE2D5]">
                          {project.totalCoinsCollected}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-[#EAE2D5]/80 group-hover:text-[#E85D3A] transition-colors shrink-0" />
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E85D3A]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-[#E85D3A]/15">
                  <CheckCircle2 className="w-4 h-4 text-[#E85D3A]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#EAE2D5]">
                    Ready to Support
                  </h3>
                  <p className="text-[10px] text-[#EAE2D5]/80">
                    Approved projects waiting for your coins
                  </p>
                </div>
              </div>
              <Link
                href="/student-dashboard"
                className="text-[10px] font-semibold text-[#E85D3A] hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="divide-y divide-[#E85D3A]/15">
              {recentApproved.length === 0 ? (
                <div className="p-8 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-[#EAE2D5]/80/40" />
                  <p className="text-xs text-[#EAE2D5]/80">
                    No approved projects yet
                  </p>
                </div>
              ) : (
                recentApproved.map((project) => {
                  const images = parseImages(project.images!);
                  return (
                    <Link
                      key={project.id}
                      href={`/student-dashboard/project/${project.id}`}
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
                          <div className="flex items-center gap-1">
                            <Coins className="w-3 h-3 text-[#E85D3A]" />
                            <span className="text-[10px] text-[#EAE2D5]/80">
                              {project.totalCoinsCollected} coins
                            </span>
                          </div>
                          <span className="text-[10px] text-[#EAE2D5]/80/50">
                            {formatDate(project.createdAt)}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#EAE2D5]/80 group-hover:text-[#E85D3A] transition-colors shrink-0" />
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 p-5">
            <h3 className="text-xs font-bold text-[#EAE2D5] uppercase tracking-wider mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                href="/student-dashboard/createProject"
                className="flex items-center gap-3 p-3 rounded-xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 hover:bg-[#E85D3A]/20 transition-all group"
              >
                <div className="p-2 rounded-lg bg-[#E85D3A]/15">
                  <Plus className="w-4 h-4 text-[#E85D3A]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#EAE2D5] group-hover:text-[#E85D3A] transition-colors">
                    New Project
                  </p>
                  <p className="text-[10px] text-[#EAE2D5]/80">
                    Submit an idea
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#EAE2D5]/80 group-hover:text-[#E85D3A]" />
              </Link>

              <Link
                href="/student-dashboard/myProjects"
                className="flex items-center gap-3 p-3 rounded-xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 hover:bg-[#E85D3A]/20 transition-all group"
              >
                <div className="p-2 rounded-lg bg-[#E85D3A]/15">
                  <BarChart3 className="w-4 h-4 text-[#E85D3A]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#EAE2D5] group-hover:text-[#E85D3A] transition-colors">
                    My Projects
                  </p>
                  <p className="text-[10px] text-[#EAE2D5]/80">
                    {stats.myProjectCount} total
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#EAE2D5]/80 group-hover:text-[#E85D3A]" />
              </Link>

              <Link
                href="/student-dashboard/profile"
                className="flex items-center gap-3 p-3 rounded-xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 hover:bg-[#E85D3A]/20 transition-all group"
              >
                <div className="p-2 rounded-lg bg-[#E85D3A]/15">
                  <Users className="w-4 h-4 text-[#E85D3A]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#EAE2D5] group-hover:text-[#E85D3A] transition-colors">
                    My Profile
                  </p>
                  <p className="text-[10px] text-[#EAE2D5]/80">
                    {userInfo?.coinBalance ?? 0} coins
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#EAE2D5]/80 group-hover:text-[#E85D3A]" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 p-5">
            <h3 className="text-xs font-bold text-[#EAE2D5] uppercase tracking-wider mb-4">
              My Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#EAE2D5]/80">Projects</span>
                  <span className="text-[#EAE2D5] font-semibold">
                    {stats.myProjectCount}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#E85D3A]/15 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#E85D3A] to-[#E85D3A] transition-all duration-500"
                    style={{
                      width: `${Math.min(stats.myProjectCount * 20, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#EAE2D5]/80">Approval Rate</span>
                  <span className="text-[#EAE2D5] font-semibold">
                    {stats.myProjectCount > 0
                      ? Math.round(
                          (stats.approvedCount / stats.myProjectCount) * 100,
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#E85D3A]/15 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#E85D3A] to-[#E85D3A] transition-all duration-500"
                    style={{
                      width: `${stats.myProjectCount > 0 ? (stats.approvedCount / stats.myProjectCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#EAE2D5]/80">Total Coins</span>
                  <span className="text-[#EAE2D5] font-semibold">
                    {stats.coinsEarned}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#E85D3A]/15 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#E85D3A] to-[#E85D3A] transition-all duration-500"
                    style={{
                      width: `${Math.min((stats.coinsEarned / 500) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 p-5 text-center">
            <Sparkles className="w-6 h-6 text-[#E85D3A] mx-auto mb-2" />
            <p className="text-3xl font-extrabold text-[#EAE2D5]">
              {stats.totalProjects}
            </p>
            <p className="text-xs text-[#EAE2D5]/80 mt-1">
              Total community projects
            </p>
            <p className="text-[10px] text-[#EAE2D5]/80/50 mt-2">
              {stats.fundedCount} successfully funded
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 sm:hidden z-40">
        <Link
          href="/student-dashboard/createProject"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-[#E85D3A] text-white shadow-xl hover:bg-[#D14C2A] transition-all active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}
