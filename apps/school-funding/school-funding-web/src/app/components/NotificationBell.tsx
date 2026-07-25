'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellRing,
  CheckCheck,
  Loader2,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Coins,
} from 'lucide-react';

const GET_UNREAD_COUNT = gql`
  query GetUnreadNotificationCount { getUnreadNotificationCount }
`;

const GET_NOTIFICATIONS = gql`
  query GetNotifications($onlyUnread: Boolean) {
    getNotifications(onlyUnread: $onlyUnread) {
      id type title message projectId isRead createdAt
    }
  }
`;

const MARK_ALL_READ = gql`
  mutation MarkAllNotificationsRead { markAllNotificationsRead { success message } }
`;

const MARK_READ = gql`
  mutation MarkNotificationRead($id: ID!) { markNotificationRead(id: $id) { success message } }
`;

interface Notification {
  id: string; type: string; title: string; message: string;
  projectId?: string | null; isRead: boolean; createdAt: string;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: countData } = useQuery<{ getUnreadNotificationCount: number }>(
    GET_UNREAD_COUNT, { pollInterval: 15000, fetchPolicy: 'network-only' }
  );

  const { data: notifData, loading: notifLoading, refetch: refetchNotifs } = useQuery<{ getNotifications: Notification[] }>(
    GET_NOTIFICATIONS, { variables: { onlyUnread: true }, skip: !isOpen, fetchPolicy: 'network-only' }
  );

  const [markAllRead, { loading: markingAll }] = useMutation(MARK_ALL_READ, { onCompleted: () => refetchNotifs() });
  const [markRead] = useMutation(MARK_READ, { onCompleted: () => refetchNotifs() });

  const unreadCount = countData?.getUnreadNotificationCount ?? 0;
  const notifications = notifData?.getNotifications || [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (dateStr: string) => {
    const date = new Date(Number(dateStr) || dateStr);
    const diff = Date.now() - date.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Just now';
    if (min < 60) return `${min}m ago`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'PROJECT_REVIEWED': return <CheckCircle2 className="w-4 h-4 text-[#E85D3A]" />;
      case 'NEW_COMMENT': return <MessageSquare className="w-4 h-4 text-[#E85D3A]" />;
      case 'PROJECT_FUNDED': return <Coins className="w-4 h-4 text-[#E85D3A]" />;
      default: return <Bell className="w-4 h-4 text-[#EAE2D5]/80" />;
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-[#E85D3A]/10 hover:bg-[#E85D3A]/20 text-[#EAE2D5]/80 hover:text-[#E85D3A] transition-all border border-[#E85D3A]/20 focus:outline-none"
        title="Notifications"
      >
        {unreadCount > 0 ? <BellRing className="w-[18px] h-[18px]" /> : <Bell className="w-[18px] h-[18px]" />}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-gradient-to-br from-[#E85D3A] to-[#E85D3A] text-white text-[8px] font-bold flex items-center justify-center border-2 border-[#2D323E]"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 shadow-2xl overflow-hidden z-50"
            style={{ maxHeight: '70vh' }}
          >
            <div className="p-4 border-b border-[#E85D3A]/20 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#EAE2D5]">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={() => markAllRead()} disabled={markingAll}
                  className="flex items-center gap-1 text-[10px] font-semibold text-[#E85D3A] hover:text-[#D14C2A] transition">
                  {markingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3 h-3" />}
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto max-h-[50vh]">
              {notifLoading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#E85D3A]" /></div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-[#EAE2D5]/80/30" />
                  <p className="text-xs text-[#EAE2D5]/80">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E85D3A]/15">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`p-3 hover:bg-[#E85D3A]/10 transition-colors ${!notif.isRead ? 'bg-[#E85D3A]/[0.03]' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">{getIconForType(notif.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#EAE2D5] truncate">{notif.title}</p>
                          <p className="text-[10px] text-[#EAE2D5]/80 line-clamp-2 mt-0.5">{notif.message}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[9px] text-[#EAE2D5]/80/50">{formatTime(notif.createdAt)}</span>
                            <div className="flex items-center gap-1.5">
                              {!notif.isRead && (
                                <button onClick={() => markRead({ variables: { id: notif.id } })}
                                  className="text-[9px] text-[#EAE2D5]/80 hover:text-[#E85D3A] transition" title="Mark as read">✓</button>
                              )}
                              {notif.projectId && (
                                <Link href={`/student-dashboard/project/${notif.projectId}`}
                                  onClick={() => { markRead({ variables: { id: notif.id } }); setIsOpen(false); }}
                                  className="text-[9px] text-[#E85D3A] hover:underline font-semibold flex items-center gap-0.5">
                                  View <ExternalLink className="w-2.5 h-2.5" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-[#E85D3A]/20 text-center">
              <Link href="/notifications" onClick={() => setIsOpen(false)}
                className="text-[10px] font-semibold text-[#E85D3A] hover:underline">
                View all notifications →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
