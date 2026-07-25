'use client';

import React from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import Link from 'next/link';
import { Coins, Clock, CheckCircle2, XCircle, Flame, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';

const GET_PROJECTS_QUERY = gql`
  query GetProjects {
    getProjects { id title description images status totalCoinsCollected createdAt }
  }
`;

interface Project {
  id: string; title: string; description: string; images: string[]; status: string;
  totalCoinsCollected: number; createdAt: string;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; colors: string }> = {
  PENDING: { label: 'Pending', icon: Clock, colors: 'bg-[#E85D3A]/20 text-[#E85D3A] border-[#E85D3A]/30' },
  APPROVED: { label: 'Approved', icon: CheckCircle2, colors: 'bg-[#E85D3A]/15 text-[#E85D3A] border-[#E85D3A]/30' },
  REJECTED: { label: 'Rejected', icon: XCircle, colors: 'bg-[#E85D3A]/10 text-[#EAE2D5]/80 border-[#E85D3A]/20' },
  FUNDED: { label: 'Funded', icon: Flame, colors: 'bg-[#E85D3A]/20 text-[#EAE2D5] border-[#E85D3A]/40' },
};

export default function ProjectList() {
  const { loading, error, data } = useQuery<{ getProjects: Project[] }>(GET_PROJECTS_QUERY, { fetchPolicy: 'network-only' });

  const formatDate = (dateStr: string) => {
    const d = new Date(Number(dateStr) || dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const parseImages = (images: string[] | string): string[] => {
    if (Array.isArray(images)) return images;
    try { return JSON.parse(images); } catch { return []; }
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 overflow-hidden animate-pulse">
          <div className="h-44 bg-[#E85D3A]/15" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-[#E85D3A]/15 rounded-lg w-3/4" />
            <div className="h-3 bg-[#E85D3A]/10 rounded-lg w-full" />
          </div>
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div className="p-5 rounded-2xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 text-[#EAE2D5]/80 text-sm flex items-center gap-3">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <span>Failed to load projects: {error.message}</span>
    </div>
  );

  const projects = data?.getProjects || [];

  if (projects.length === 0) return (
    <div className="text-center py-16 px-6 rounded-2xl bg-[#2D323E] border border-dashed border-[#E85D3A]/30">
      <ImageIcon className="w-8 h-8 mx-auto mb-3 text-[#EAE2D5]/80/40" />
      <p className="text-[#EAE2D5]/80 font-medium text-sm">No projects yet</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {projects.map((project) => {
        const images = parseImages(project.images);
        const status = statusConfig[project.status] || statusConfig.PENDING;
        const StatusIcon = status.icon;

        return (
          <Link key={project.id} href={`/student-dashboard/project/${project.id}`} className="group block">
            <div className="relative rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 hover:border-[#E85D3A]/40 transition-all duration-300 overflow-hidden h-full">
              <div className="h-44 bg-[#E85D3A]/15 relative overflow-hidden">
                {images[0] ? (
                  <img src={images[0]} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-[#EAE2D5]/80/30" />
                  </div>
                )}
                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md flex items-center gap-1.5 ${status.colors}`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </div>
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-[#2D323E]/80 backdrop-blur-md border border-[#E85D3A]/20 flex items-center gap-1.5">
                  <Coins className="w-3 h-3 text-[#E85D3A]" />
                  <span className="text-[10px] font-bold text-[#EAE2D5]">{project.totalCoinsCollected}</span>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <h3 className="text-sm font-bold text-[#EAE2D5] group-hover:text-[#E85D3A] transition-colors line-clamp-1">{project.title}</h3>
                <p className="text-xs text-[#EAE2D5]/80 leading-relaxed line-clamp-2">{project.description}</p>
                <div className="pt-2 flex items-center justify-between text-[10px] text-[#EAE2D5]/80/50 border-t border-[#E85D3A]/20">
                  <span>{formatDate(project.createdAt)}</span>
                  <span className="group-hover:text-[#E85D3A] transition-colors font-medium">View details →</span>
                </div>
              </div>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[#E85D3A]/[0.05] to-transparent" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
