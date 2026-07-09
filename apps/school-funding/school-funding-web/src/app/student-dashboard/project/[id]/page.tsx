import React from 'react';
import ProjectDetail from '../../../components/ProjectDetails';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function ProjectPage({ params }: PageProps) {
  // Next.js-ийн дүрэм ёсоор params-ийг await хийж авна
  const resolvedParams = await params;
  const id = resolvedParams.id;

  return (
    <div className="min-h-screen bg-white">
      {/* Бэлдсэн компонентоо дуудаж, id-ийг нь дамжуулна */}
      <ProjectDetail projectId={id} />
    </div>
  );
}
