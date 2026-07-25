'use client';

import React from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import Link from 'next/link';
import { Trophy, Coins, Loader2, TrendingUp, Medal, ExternalLink } from 'lucide-react';

const GET_LEADERBOARD_QUERY = gql`
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
  createdAt: string;
}

const medalColors = ['text-[#E85D3A]', 'text-[#EAE2D5]/80', 'text-[#E85D3A]'];
const medalBg = ['bg-[#E85D3A]/15 border-[#E85D3A]/30', 'bg-[#242831]/15 border-[#242831]/30', 'bg-[#E85D3A]/15 border-[#E85D3A]/30'];

export default function Leaderboard({ limit = 5 }: { limit?: number }) {
  const { loading, data } = useQuery<{ getLeaderboardProjects: Project[] }>(
    GET_LEADERBOARD_QUERY, { variables: { limit }, fetchPolicy: 'network-only' }
  );

  if (loading) return (
    <div className="p-6 rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 text-center">
      <Loader2 className="w-5 h-5 animate-spin text-[#E85D3A] mx-auto" />
    </div>
  );

  const projects = data?.getLeaderboardProjects || [];
  if (projects.length === 0) return null;

  return (
    <div className="rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 overflow-hidden">
      <div className="p-5 border-b border-[#E85D3A]/20 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#E85D3A]/15">
          <Trophy className="w-[18px] h-[18px] text-[#E85D3A]" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-[#EAE2D5]">Trending Projects</h3>
          <p className="text-[10px] text-[#EAE2D5]/80">Most funded this period</p>
        </div>
        <TrendingUp className="w-4 h-4 text-[#E85D3A] ml-auto" />
      </div>

      <div className="divide-y divide-[#E85D3A]/15">
        {projects.map((project, i) => {
          let images: string[] = [];
          if (Array.isArray(project.images)) images = project.images;
          else if (typeof project.images === 'string') { try { images = JSON.parse(project.images); } catch {} }

          return (
            <Link key={project.id} href={`/student-dashboard/project/${project.id}`} className="flex items-center gap-3 p-3.5 hover:bg-[#E85D3A]/10 transition-colors group">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-extrabold border ${medalBg[i] || 'bg-[#E85D3A]/10 border-[#E85D3A]/20 text-[#EAE2D5]/80'}`}>
                {i < 3 ? <Medal className={`w-3.5 h-3.5 ${medalColors[i] || 'text-white/30'}`} /> : i + 1}
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#E85D3A]/15 overflow-hidden shrink-0 border border-[#E85D3A]/20">
                {images[0] ? <img src={images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-[#EAE2D5]/80/50">💡</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#EAE2D5]/80 truncate group-hover:text-[#E85D3A] transition-colors">{project.title}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Coins className="w-3 h-3 text-[#E85D3A]" />
                <span className="text-xs font-bold text-[#EAE2D5]">{project.totalCoinsCollected}</span>
              </div>
              <ExternalLink className="w-3 h-3 text-[#EAE2D5]/80/50 group-hover:text-[#E85D3A] transition-colors shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
