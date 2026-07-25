'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Coins,
  ExternalLink,
  GraduationCap,
  Mail,
  Calendar,
  FolderKanban,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  Gift,
  Plus,
  Minus,
} from 'lucide-react';

const GET_USER_BY_ID = gql`
  query GetUserById($id: ID) {
    getUserById(id: $id) {
      id
      userName
      email
      avatarUrl
      role
      coinBalance
      createdAt
    }
  }
`;

const GET_USER_PROJECTS = gql`
  query GetUserProjects($userId: ID!) {
    getUserProjects(userId: $userId) {
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

const ADD_COINS_TO_STUDENT = gql`
  mutation AddCoinsToStudent($studentId: ID!, $amount: Int!) {
    addCoinsToStudent(studentId: $studentId, amount: $amount) {
      success
      message
    }
  }
`;

interface UserData {
  id: string;
  userName: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  coinBalance: number;
  createdAt: string;
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

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const router = useRouter();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [coinModalOpen, setCoinModalOpen] = useState(false);
  const [coinAmount, setCoinAmount] = useState<number>(10);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  React.useEffect(() => {
    const resolveParams = async () => {
      if (params instanceof Promise) {
        const p = await params;
        setStudentId(p.id);
      } else {
        setStudentId(params.id);
      }
    };
    resolveParams();
  }, [params]);

  const {
    data: studentData,
    loading: studentLoading,
    refetch: refetchStudent,
  } = useQuery<{ getUserById: UserData | null }>(GET_USER_BY_ID, {
    variables: { id: studentId },
    skip: !studentId,
    fetchPolicy: 'network-only',
  });

  const { data: projectsData, loading: projectsLoading } = useQuery<{
    getUserProjects: Project[];
  }>(GET_USER_PROJECTS, {
    variables: { userId: studentId },
    skip: !studentId,
    fetchPolicy: 'network-only',
  });

  const [addCoins, { loading: coinLoading }] = useMutation<{
    addCoinsToStudent: { success: boolean; message: string };
  }>(ADD_COINS_TO_STUDENT, {
    onCompleted: (data) => {
      setCoinModalOpen(false);
      setCoinAmount(10);
      setToastMessage({
        type: data.addCoinsToStudent.success ? 'success' : 'error',
        text: data.addCoinsToStudent.message,
      });
      setTimeout(() => setToastMessage(null), 4000);
      refetchStudent();
    },
    onError: (err) => {
      setToastMessage({ type: 'error', text: `Error: ${err.message}` });
      setTimeout(() => setToastMessage(null), 5000);
    },
  });

  const student = studentData?.getUserById;
  const projects = projectsData?.getUserProjects || [];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(Number(dateStr) || dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Pending',
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
          icon: CheckCircle2,
          bg: 'bg-[#242831]/40',
          text: 'text-[#E85D3A]',
          border: 'border-[#242831]/50',
        };
      default:
        return {
          label: status,
          icon: AlertCircle,
          bg: 'bg-[#242831]/30',
          text: 'text-[#EAE2D5]/80',
          border: 'border-[#242831]/50',
        };
    }
  };

  const handleAddCoins = async () => {
    if (!studentId || coinAmount <= 0) return;
    try {
      await addCoins({ variables: { studentId, amount: coinAmount } });
    } catch (e) {
      console.error('Add coins error:', e);
    }
  };

  if (studentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#E85D3A]" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[#E85D3A]" />
        <p className="text-white font-medium mb-2">Student not found</p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl bg-[#242831]/30 text-[#E85D3A] hover:bg-[#242831] border border-[#242831]/50 text-xs font-semibold transition cursor-pointer"
        >
          Go back
        </button>
      </div>
    );
  }

  const stats = {
    total: projects.length,
    approved: projects.filter(
      (p) => p.status === 'APPROVED' || p.status === 'FUNDED',
    ).length,
    rejected: projects.filter((p) => p.status === 'REJECTED').length,
    pending: projects.filter((p) => p.status === 'PENDING').length,
    totalCoins: projects.reduce((s, p) => s + (p.totalCoinsCollected ?? 0), 0),
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl text-sm font-semibold border backdrop-blur-md transition-all animate-in slide-in-from-right ${
            toastMessage.type === 'success'
              ? 'bg-[#242831]/90 text-[#E85D3A] border-[#E85D3A]'
              : 'bg-[#E85D3A]/90 text-[#E85D3A] border-[#E85D3A]'
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {coinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-2xl bg-[#242831] border border-[#242831]/30 p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#242831] border border-[#E85D3A] mb-3">
                <Gift className="w-7 h-7 text-[#E85D3A]" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Add Coins to Student
              </h3>
              <p className="text-xs text-[#EAE2D5]/60 mt-1">
                Reward{' '}
                <span className="font-semibold text-white">
                  {student.userName}
                </span>{' '}
                with coins
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[10, 25, 50, 100, 200, 500].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCoinAmount(preset)}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                      coinAmount === preset
                        ? 'bg-[#242831] text-[#E85D3A] border-[#E85D3A]'
                        : 'bg-[#242831]/30 text-[#EAE2D5]/70 border-[#242831]/50 hover:border-[#E85D3A]/30 hover:text-white'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E85D3A]" />
                <input
                  type="number"
                  min={1}
                  value={coinAmount}
                  onChange={(e) =>
                    setCoinAmount(Math.max(1, parseInt(e.target.value) || 0))
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#242831]/30 border border-[#242831]/50 text-white text-lg font-bold focus:outline-none focus:border-[#E85D3A] transition"
                  placeholder="Enter amount"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setCoinModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-[#242831]/30 text-[#EAE2D5]/70 font-semibold text-sm border border-[#242831]/50 hover:bg-[#242831] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCoins}
                  disabled={coinLoading || coinAmount <= 0}
                  className="flex-1 py-3 rounded-xl bg-[#242831] text-[#E85D3A] font-bold text-sm border border-[#E85D3A] hover:bg-[#E85D3A] transition disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {coinLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Add {coinAmount} Coins
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#EAE2D5]/70 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to students
      </button>

      <div className="rounded-2xl bg-[#242831] border border-[#242831]/30 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#242831]/50 bg-[#242831]/30 shrink-0">
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-[#EAE2D5]/80" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left space-y-2">
            <h1 className="text-xl font-bold text-white">{student.userName}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-[11px] text-[#EAE2D5]/70">
              <Mail className="w-3.5 h-3.5" />
              <span>{student.email}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#242831]/40 text-[#E85D3A] border border-[#E85D3A]/20">
                STUDENT
              </span>
              <span className="text-[11px] text-[#EAE2D5]/70 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Joined {formatDate(student.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#242831]/30 border border-[#242831]/50">
              <Coins className="w-5 h-5 text-[#E85D3A]" />
              <span className="text-lg font-extrabold text-white">
                {student.coinBalance}
              </span>
              <span className="text-[9px] text-[#EAE2D5]/50">coins</span>
            </div>
            <button
              onClick={() => setCoinModalOpen(true)}
              className="p-2.5 rounded-xl bg-[#242831] text-[#E85D3A] hover:bg-[#E85D3A] transition-all border border-[#E85D3A] cursor-pointer"
              title="Add coins to student"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#242831] border border-[#242831]/30">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-[10px] text-[#EAE2D5]/80 mt-0.5">Total Projects</p>
        </div>
        <div className="p-4 rounded-xl bg-[#242831] border border-[#242831]/30">
          <p className="text-2xl font-bold text-[#E85D3A]">{stats.approved}</p>
          <p className="text-[10px] text-[#EAE2D5]/80 mt-0.5">Approved</p>
        </div>
        <div className="p-4 rounded-xl bg-[#242831] border border-[#242831]/30">
          <p className="text-2xl font-bold text-[#E85D3A]">{stats.rejected}</p>
          <p className="text-[10px] text-[#EAE2D5]/80 mt-0.5">Rejected</p>
        </div>
        <div className="p-4 rounded-xl bg-[#242831] border border-[#242831]/30">
          <p className="text-2xl font-bold text-[#E85D3A]">{stats.pending}</p>
          <p className="text-[10px] text-[#EAE2D5]/80 mt-0.5">Pending</p>
        </div>
      </div>

      <div className="rounded-2xl bg-[#242831] border border-[#242831]/30 overflow-hidden">
        <div className="p-5 border-b border-[#242831]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#242831]/30">
              <FolderKanban className="w-5 h-5 text-[#E85D3A]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {student.userName.split(' ')[0]}&apos;s Projects
              </h3>
              <p className="text-[10px] text-[#EAE2D5]/80">
                {stats.total} project(s) submitted
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#E85D3A]" />
            <span className="text-xs font-bold text-white">
              {stats.totalCoins}
            </span>
            <span className="text-[9px] text-[#EAE2D5]/50">coins raised</span>
          </div>
        </div>

        {projectsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#E85D3A]" />
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center">
            <FolderKanban className="w-8 h-8 mx-auto mb-2 text-[#EAE2D5]/80/30" />
            <p className="text-xs text-[#EAE2D5]/80">
              This student hasn&apos;t submitted any projects yet
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#242831]/30">
            {projects.map((project) => {
              const statusCfg = getStatusBadge(project.status);
              const StatusIcon = statusCfg.icon;
              const images = parseImages(project.images);

              return (
                <div
                  key={project.id}
                  className="p-4 hover:bg-[#242831]/10 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {images[0] ? (
                      <img
                        src={images[0]}
                        alt=""
                        className="w-14 h-14 rounded-xl object-cover border border-[#242831]/50 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-[#242831]/30 border border-[#242831]/50 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-5 h-5 text-[#EAE2D5]/80/50" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-white truncate">
                            {project.title}
                          </h4>
                          <p className="text-[11px] text-[#EAE2D5] line-clamp-1 mt-0.5">
                            {project.description}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3 text-[10px] text-[#EAE2D5]/80">
                          <span className="flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            {project.totalCoinsCollected} coins
                          </span>
                          <span>{formatDate(project.createdAt)}</span>
                        </div>
                        <Link
                          href={`/teacher-dashboard/project/${project.id}`}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#E85D3A] hover:underline"
                        >
                          Review <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
