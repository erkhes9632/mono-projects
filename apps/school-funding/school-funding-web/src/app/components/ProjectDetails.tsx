'use client';
import React from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client'; // 1. gql-ээ тусад нь импортлож авна

// 2. Query-гоо шууд энд нь зарлачихна (Импорт хийх шаардлагагүй)
const GET_PROJECT_BY_ID_QUERY = gql`
  query GetProjectById($id: ID!) {
    getProjectById(id: $id) {
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

interface ProjectDetailProps {
  projectId: string;
}

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  // 3. Зарласан query-гоо хувьсагчаар дамжуулж ашиглана
  const { loading, error, data } = useQuery<{ getProjectById: Project | null }>(
    GET_PROJECT_BY_ID_QUERY,
    {
      variables: { id: projectId },
      fetchPolicy: 'network-only',
    },
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-pulse space-y-6">
        <div className="h-96 bg-gray-200 rounded-3xl w-full"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-md mx-auto text-center bg-red-50 text-red-600 rounded-xl mt-12">
        ⚠️ Алдаа гарлаа: {error.message}
      </div>
    );
  }

  const project = data?.getProjectById;

  if (!project) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-2xl max-w-md mx-auto mt-12 border">
        <span className="text-4xl block mb-2">🔍</span>
        <p className="text-gray-500 font-medium">
          Уучлаарай, ийм төсөл олдсонгүй.
        </p>
      </div>
    );
  }

  const hasImage = project.images && project.images.length > 0;
  const mainImage = hasImage ? project.images[0] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Буцах товч */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition"
      >
        ← Буцах
      </button>

      {/* Төслийн том зураг болон Статус */}
      <div className="h-[450px] w-full bg-gray-100 relative rounded-3xl overflow-hidden shadow-lg border border-gray-100">
        {mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mainImage}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 text-lg">
            <span>📸 Энэ төсөлд зураг байхгүй байна</span>
          </div>
        )}

        <span
          className={`absolute top-6 right-6 text-sm font-bold px-4 py-1.5 rounded-full shadow-md ${
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

      {/* Төслийн үндсэн мэдээлэл */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Зүүн тал: Гарчиг болон Тайлбар */}
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {project.title}
          </h1>
          <p className="text-xs text-gray-400">
            Үүсгэсэн огноо:{' '}
            {new Date(
              Number(project.createdAt) || project.createdAt,
            ).toLocaleDateString('mn-MN')}
          </p>
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Төслийн тухай
            </h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        </div>

        {/* Баруун тал: Төслийн санхүүжилт / Зоос цуглуулалт */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4 shadow-sm">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Цугларсан дэмжлэг
          </h4>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-amber-600">
              🪙 {project.totalCoinsCollected}
            </span>
            <span className="text-sm font-medium text-gray-400">зоос</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-amber-500 h-2.5 rounded-full"
              style={{ width: '45%' }}
            ></div>
          </div>

          <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-amber-500/10 transition mt-2">
            🙌 Зоосоор дэмжих
          </button>
        </div>
      </div>
    </div>
  );
}
