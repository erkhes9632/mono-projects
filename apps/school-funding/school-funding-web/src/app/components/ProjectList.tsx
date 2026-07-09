'use client';
import React from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client'; //
import Link from 'next/link';

const GET_PROJECTS_QUERY = gql`
  query GetProjects {
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

interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  status: string;
  totalCoinsCollected: number;
  createdAt: string;
}

export default function ProjectList() {
  const { loading, error, data } = useQuery<{ getProjects: Project[] }>(
    GET_PROJECTS_QUERY,
    {
      fetchPolicy: 'network-only',
    },
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="bg-white rounded-2xl p-6 shadow animate-pulse border border-gray-100"
          >
            <div className="bg-gray-200 h-40 rounded-xl mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-md mx-auto text-center bg-red-50 text-red-600 rounded-xl mt-6">
        ⚠️ Төслүүдийг ачаалахад алдаа гарлаа: {error.message}
      </div>
    );
  }

  const projects = data?.getProjects || [];

  if (projects.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 max-w-md mx-auto mt-6">
        <span className="text-4xl block mb-2">📂</span>
        <p className="text-gray-500 font-medium">
          Одоогоор харуулах төсөл алга байна.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
      {projects.map((project) => {
        const hasImage = project.images && project.images.length > 0;
        const mainImage = hasImage ? project.images[0] : null;

        return (
          <Link
            href={`/student-dashboard/project/${project.id}`}
            key={project.id}
            className="block"
          >
            <div
              key={project.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col"
            >
              <div className="h-48 w-full bg-gray-100 relative">
                {mainImage ? (
                  <img
                    src={
                      mainImage.startsWith('data:image') ? mainImage : mainImage
                    }
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                    <span>📸 Зураггүй</span>
                  </div>
                )}

                <span
                  className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full shadow-sm ${
                    project.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : project.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : project.status === 'FUNDED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {project.status}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {project.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-amber-600 font-semibold">
                    <span>🪙</span>
                    <span>{project.totalCoinsCollected} Coins</span>
                  </div>
                  <div className="text-gray-400 text-xs">
                    {new Date(
                      Number(project.createdAt) || project.createdAt,
                    ).toLocaleDateString('mn-MN')}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
