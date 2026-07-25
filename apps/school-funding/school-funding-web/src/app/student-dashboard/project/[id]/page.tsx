import React from 'react';
import ProjectDetail from '../../../components/ProjectDetails';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function ProjectPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  return <ProjectDetail projectId={id} />;
}
