'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import Link from 'next/link';
import {
  Bell, BellRing, CheckCheck, Loader2, MessageSquare,
  CheckCircle2, Coins, ExternalLink, ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const GET_ALL_NOTIFICATIONS = gql`
  query GetNotifications($onlyUnread: Boolean) {
    getNotifications(onlyUnread: $onlyUnread) { id type title message projectId isRead createdAt }
  }
`;
const MARK_ALL_READ = gql`mutation MarkAllNotificationsRead { markAllNotificationsRead { success message } }`;
const MARK_READ = gql`mutation MarkNotificationRead($id: ID!) { markNotificationRead(id: $id) { success message } }`;

interface Notification { id: string; type: string; title: string; message: string; projectId?: string | null; isRead: boolean; createdAt: string; }

export default function NotificationsPage() {
  const router = useRouter();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const { data, loading, refetch } = useQuery<{ getNotifications: Notification[] }>(GET_ALL_NOTIFICATIONS, {
    variables: { onlyUnread: showUnreadOnly || undefined }, fetchPolicy: 'network-only',
  });
  const [markAllRead, { loading: markingAll }] = useMutation(MARK_ALL_READ, { onCompleted: () => refetch() });
  const [markRead] = useMutation(MARK_READ, { onCompleted: () => refetch() });

  const notifications = data?.getNotifications || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatDate = (dateStr: string) => {
    const d = new Date(Number(dateStr) || dateStr);
    const diff = Date.now() - d.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Just now';
    if (min < 60) return `${min}m ago`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getIcon = (type: string, isRead: boolean) => {
    const cls = isRead ? 'opacity-50' : '';
    switch (type) {
      case 'PROJECT_REVIEWED': return <div className={`p-2 rounded-lg bg-[#E85D3A]/10 border border-[#E85D3A]/20 ${cls}`}><CheckCircle2 className="w-4 h-4 text-[#E85D3A]" /></div>;
      case 'NEW_COMMENT': return <div className={`p-2 rounded-lg bg-[#E85D3A]/10 border border-[#E85D3A]/20 ${cls}`}><MessageSquare className="w-4 h-4 text-[#E85D3A]" /></div>;
      case 'PROJECT_FUNDED': return <div className={`p-2 rounded-lg bg-[#E85D3A]/15 border border-[#E85D3A]/30 ${cls}`}><Coins className="w-4 h-4 text-[#E85D3A]" /></div>;
      default: return <div className={`p-2 rounded-lg bg-[#E85D3A]/10 border border-[#E85D3A]/20 ${cls}`}><Bell className="w-4 h-4 text-[#EAE2D5]/80" /></div>;
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#E85D3A]" /></div>;

  return (
    <div className="min-h-screen bg-[#2D323E] text-[#EAE2D5] p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg bg-[#E85D3A]/10 text-[#EAE2D5]/80 hover:text-[#E85D3A] border border-[#E85D3A]/20 transition">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#EAE2D5]">Notifications</h1>
            <p className="text-xs text-[#EAE2D5]/80">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition border ${showUnreadOnly ? 'bg-[#E85D3A]/15 text-[#E85D3A] border-[#E85D3A]/30' : 'bg-[#E85D3A]/10 text-[#EAE2D5]/80 border-[#E85D3A]/20 hover:bg-[#E85D3A]/20'}`}>
            Unread only
          </button>
          {unreadCount > 0 && (
            <button onClick={() => markAllRead()} disabled={markingAll}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#E85D3A]/10 text-[#E85D3A] hover:bg-[#E85D3A]/20 text-[10px] font-semibold transition border border-[#E85D3A]/20">
              {markingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3 h-3" />}
              Mark all read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl bg-[#2D323E]/50 border border-dashed border-[#E85D3A]/30 p-12 text-center">
          <BellRing className="w-10 h-10 mx-auto mb-3 text-[#EAE2D5]/80/30" />
          <p className="text-sm text-[#EAE2D5]/80 font-medium">No notifications</p>
          <p className="text-xs text-[#EAE2D5]/80/50 mt-1">You'll see activity here when something happens</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div key={notif.id} className={`rounded-xl border p-4 transition-colors ${notif.isRead ? 'bg-[#2D323E]/50 border-[#E85D3A]/20' : 'bg-[#E85D3A]/[0.03] border-[#E85D3A]/30'}`}>
              <div className="flex items-start gap-3">
                {getIcon(notif.type, notif.isRead)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs ${notif.isRead ? 'font-medium' : 'font-bold'} text-[#EAE2D5] truncate`}>{notif.title}</h4>
                    <span className="text-[10px] text-[#EAE2D5]/80/50 shrink-0">{formatDate(notif.createdAt)}</span>
                  </div>
                  <p className="text-[11px] text-[#EAE2D5]/80 mt-1 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {notif.projectId && (
                      <Link href={`/student-dashboard/project/${notif.projectId}`}
                        onClick={() => { if (!notif.isRead) markRead({ variables: { id: notif.id } }); }}
                        className="text-[10px] text-[#E85D3A] hover:underline font-semibold flex items-center gap-1">
                        View project <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                    {!notif.isRead && (
                      <button onClick={() => markRead({ variables: { id: notif.id } })}
                        className="text-[10px] text-[#EAE2D5]/80 hover:text-[#E85D3A] font-semibold transition">
                        Dismiss
                      </button>
                    )}
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
