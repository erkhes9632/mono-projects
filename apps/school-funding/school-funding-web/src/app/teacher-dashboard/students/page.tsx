'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import Link from 'next/link';
import {
  Users,
  Search,
  Loader2,
  Coins,
  GraduationCap,
  FolderKanban,
  BarChart3,
  Mail,
} from 'lucide-react';

const GET_ALL_USERS = gql`
  query GetUsers($searchName: String) {
    getUsers(searchName: $searchName) {
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

interface UserData {
  id: string;
  userName: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  coinBalance: number;
  createdAt: string;
}

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: usersData, loading: usersLoading } = useQuery<{
    getUsers: UserData[];
  }>(GET_ALL_USERS, {
    variables: { searchName: searchQuery || undefined },
    fetchPolicy: 'network-only',
  });

  const allUsers = usersData?.getUsers || [];

  const students = useMemo(
    () =>
      allUsers
        .filter((u) => u.role === 'STUDENT')
        .filter((u) => {
          if (!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return (
            u.userName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
          );
        }),
    [allUsers, searchQuery],
  );

  const studentStats = useMemo(
    () => ({
      total: students.length,
      totalCoins: students.reduce((s, u) => s + u.coinBalance, 0),
      averageCoins:
        students.length > 0
          ? Math.round(
              students.reduce((s, u) => s + u.coinBalance, 0) / students.length,
            )
          : 0,
    }),
    [students],
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

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#E85D3A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-[#E85D3A]/15 border border-[#E85D3A]/20">
              <Users className="w-5 h-5 text-[#E85D3A]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#EAE2D5]">Students</h1>
              <p className="text-xs text-[#EAE2D5]/80">
                View all students and their activity
              </p>
            </div>
          </div>
        </div>
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#EAE2D5]/80" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 text-xs text-[#EAE2D5] placeholder-[#242831] focus:outline-none focus:border-[#E85D3A] transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-[#2D323E] border border-[#E85D3A]/20">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded-lg bg-[#E85D3A]/15">
              <GraduationCap className="w-4 h-4 text-[#E85D3A]" />
            </div>
            <span className="text-[10px] font-bold text-[#EAE2D5]/80 uppercase tracking-wider">
              Total Students
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[#EAE2D5]">
            {studentStats.total}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#2D323E] border border-[#E85D3A]/20">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded-lg bg-[#E85D3A]/15">
              <Coins className="w-4 h-4 text-[#E85D3A]" />
            </div>
            <span className="text-[10px] font-bold text-[#EAE2D5]/80 uppercase tracking-wider">
              Total Coins
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[#EAE2D5]">
            {studentStats.totalCoins}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#2D323E] border border-[#E85D3A]/20">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded-lg bg-[#E85D3A]/15">
              <BarChart3 className="w-4 h-4 text-[#E85D3A]" />
            </div>
            <span className="text-[10px] font-bold text-[#EAE2D5]/80 uppercase tracking-wider">
              Avg. Coins
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[#EAE2D5]">
            {studentStats.averageCoins}
          </p>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 text-center">
          <Users className="w-10 h-10 mx-auto mb-3 text-[#EAE2D5]/80 opacity-50" />
          <p className="text-sm text-[#EAE2D5]/80 font-medium">
            {searchQuery
              ? 'No students match your search'
              : 'No students registered yet'}
          </p>
          <p className="text-xs text-[#EAE2D5]/80/60 mt-1">
            {searchQuery
              ? 'Try a different search term'
              : 'Students will appear once they join the platform'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {students.map((student) => (
            <div
              key={student.id}
              className="rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 overflow-hidden hover:border-[#E85D3A]/30 transition-all"
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#E85D3A]/20 bg-[#E85D3A]/10">
                    {student.avatarUrl ? (
                      <img
                        src={student.avatarUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-[#EAE2D5]/80" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-[#EAE2D5] truncate">
                          {student.userName}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Mail className="w-3 h-3 text-[#EAE2D5]/80" />
                          <p className="text-[10px] text-[#EAE2D5]/80 truncate">
                            {student.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Coins className="w-3.5 h-3.5 text-[#E85D3A]" />
                        <span className="text-sm font-bold text-[#EAE2D5]">
                          {student.coinBalance}
                        </span>
                        <span className="text-[9px] text-[#EAE2D5]/80 font-medium">
                          coins
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[9px] text-[#EAE2D5]/80">
                        Joined {formatDate(student.createdAt)}
                      </span>
                      <Link
                        href={`/teacher-dashboard/students/${student.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E85D3A]/15 text-[#E85D3A] hover:text-white hover:bg-[#E85D3A]/30 transition-all border border-[#E85D3A]/20 text-[10px] font-semibold"
                      >
                        <FolderKanban className="w-3 h-3" />
                        View Projects
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
