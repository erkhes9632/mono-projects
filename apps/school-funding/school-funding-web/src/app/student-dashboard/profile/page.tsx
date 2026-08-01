'use client';

import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useUser } from '@clerk/nextjs';
import {
  Coins,
  User as UserIcon,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Loader2,
  Calendar,
  Edit3,
  Mail,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import EditProfileModal from '../../components/EditProfileModal';

const GET_USER_BY_ID_QUERY = gql`
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
const GET_USER_TRANSACTIONS_QUERY = gql`
  query GetUserTransactions($userId: ID!) {
    getUserTransactions(userId: $userId) {
      id
      userId
      amount
      type
      referenceId
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
interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'EARN' | 'STAKE' | 'REFUND';
  referenceId?: string | null;
  createdAt: string;
}

export default function StudentProfilePage() {
  const { user, isLoaded: clerkLoaded } = useUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    data: userData,
    loading: userLoading,
    refetch: refetchUser,
  } = useQuery<{ getUserById: UserData | null }>(GET_USER_BY_ID_QUERY, {
    variables: { id: user?.id },
    skip: !user?.id,
    fetchPolicy: 'network-only',
  });
  const { data: txData, loading: txLoading } = useQuery<{
    getUserTransactions: Transaction[];
  }>(GET_USER_TRANSACTIONS_QUERY, {
    variables: { userId: user?.id },
    skip: !user?.id,
    fetchPolicy: 'network-only',
  });

  const userInfo = userData?.getUserById;
  const transactions = txData?.getUserTransactions || [];

  const formatDate = (dateStr: string) => {
    const d = new Date(Number(dateStr) || dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
  };

  const getTotalEarned = () =>
    transactions
      .filter((t: Transaction) => t.type === 'EARN')
      .reduce((s: number, t: Transaction) => s + t.amount, 0);
  const getTotalStaked = () =>
    transactions
      .filter((t: Transaction) => t.type === 'STAKE')
      .reduce((s: number, t: Transaction) => s + t.amount, 0);

  if (!clerkLoaded || userLoading)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#E85D3A]" />
      </div>
    );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl bg-[#242831] border border-[#242831]/30 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E85D3A]/5 blur-3xl rounded-full" />
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#242831]/50 bg-[#242831]/30 shadow-xl">
              {userInfo?.avatarUrl || user?.imageUrl ? (
                <img
                  src={userInfo?.avatarUrl || user?.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-[#EAE2D5]/80" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#E85D3A] border-2 border-[#242831]" />
          </div>
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex items-center justify-center sm:justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-white">
                  {userInfo?.userName || user?.fullName || 'User'}
                </h1>
                <div className="flex items-center gap-2 text-[11px] text-[#EAE2D5]/80 mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>
                    {userInfo?.email || user?.primaryEmailAddress?.emailAddress}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 rounded-lg bg-[#242831]/30 text-[#EAE2D5]/80 hover:text-[#E85D3A] hover:bg-[#242831]/50 transition-all border border-[#242831]/30"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#242831]/40 text-[#E85D3A] border border-[#E85D3A]/20">
                {userInfo?.role || 'STUDENT'}
              </span>
              <span className="text-[11px] text-[#EAE2D5]/80 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Joined {formatDate(userInfo?.createdAt || '')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#242831] border border-[#242831]/30">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-lg bg-[#242831]/40">
              <Coins className="w-4 h-4 text-[#E85D3A]" />
            </div>
            <span className="text-[10px] font-bold text-[#EAE2D5]/80 uppercase tracking-wider">
              Balance
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white">
            {userInfo?.coinBalance ?? 0}
          </p>
          <p className="text-[10px] text-[#EAE2D5]/80/50 mt-1">
            Available coins
          </p>
        </div>
        <div className="p-5 rounded-xl bg-[#242831] border border-[#242831]/30">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-lg bg-[#242831]/40">
              <TrendingUp className="w-4 h-4 text-[#E85D3A]" />
            </div>
            <span className="text-[10px] font-bold text-[#EAE2D5]/80 uppercase tracking-wider">
              Earned
            </span>
          </div>
          <p className="text-3xl font-extrabold text-[#E85D3A]">
            {getTotalEarned()}
          </p>
          <p className="text-[10px] text-[#EAE2D5]/80/50 mt-1">
            Total coins earned
          </p>
        </div>
        <div className="p-5 rounded-xl bg-[#242831] border border-[#242831]/30">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-lg bg-[#242831]/40">
              <TrendingDown className="w-4 h-4 text-[#E85D3A]" />
            </div>
            <span className="text-[10px] font-bold text-[#EAE2D5]/80 uppercase tracking-wider">
              Invested
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white">
            {getTotalStaked()}
          </p>
          <p className="text-[10px] text-[#EAE2D5]/80/50 mt-1">
            Total coins invested
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-[#242831] border border-[#242831]/30 overflow-hidden">
        <div className="p-5 border-b border-[#242831]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#242831]/30">
              <RefreshCw className="w-4 h-4 text-[#E85D3A]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">
                Transaction History
              </h3>
              <p className="text-[10px] text-[#EAE2D5]/80">
                Your recent activity
              </p>
            </div>
          </div>
          {txLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-[#E85D3A]" />
          )}
        </div>

        <div className="divide-y divide-[#242831]/20">
          {transactions.length === 0 ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 text-[#EAE2D5]/80/30" />
              <p className="text-xs text-[#EAE2D5]/80">No transactions yet</p>
            </div>
          ) : (
            transactions.map((tx: Transaction) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 hover:bg-[#242831]/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${tx.type === 'EARN' ? 'bg-[#242831]/40 text-[#E85D3A]' : tx.type === 'STAKE' ? 'bg-[#242831]/40 text-[#E85D3A]' : 'bg-[#242831]/40 text-[#E85D3A]'}`}
                  >
                    {tx.type === 'EARN' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : tx.type === 'STAKE' ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white capitalize">
                      {tx.type.toLowerCase()}
                    </p>
                    <p className="text-[10px] text-[#EAE2D5]/80">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold ${tx.type === 'EARN' ? 'text-[#E85D3A]' : tx.type === 'STAKE' ? 'text-white' : 'text-[#E85D3A]'}`}
                >
                  {tx.type === 'EARN' ? '+' : '-'}
                  {tx.amount}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <EditProfileModal
        initialName={userInfo?.userName || user?.fullName || 'User'}
        initialAvatarUrl={userInfo?.avatarUrl || user?.imageUrl || ''}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdated={() => refetchUser()}
      />
    </div>
  );
}
