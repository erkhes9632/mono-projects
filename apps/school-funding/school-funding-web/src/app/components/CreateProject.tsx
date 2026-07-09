'use client';
import React, { useState, useRef } from 'react';
import { useMutation } from '@apollo/client/react';
import { useUser } from '@clerk/nextjs';
import { gql } from '@apollo/client';

const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: ProjectInput!) {
    createProject(input: $input) {
      id
      title
      description
      images
      status
    }
  }
`;

export default function CreateProject() {
  const { user, isLoaded } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Зургийн файл болон Preview харуулах state-үүд
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createProject, { loading: mutationLoading, error }] = useMutation(
    CREATE_PROJECT_MUTATION,
  );

  if (!isLoaded)
    return (
      <p className="text-center p-4 text-gray-500 animate-pulse">
        Уншиж байна...
      </p>
    );
  if (!user)
    return (
      <p className="text-center p-4 text-red-500 font-semibold">
        Та эхлээд нэвтрэнэ үү.
      </p>
    );

  // Файл сонгох үед ажиллах функц
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Сонгосон зургийг дэлгэц дээр урьдчилж харуулах (Preview) URL үүсгэх
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Зургийг сервер рүү хуулж, жинхэнэ URL авах функц (Жишээ бүтэц)
  const uploadImageToServer = async (file: File): Promise<string> => {
    // Хэрэв та Cloudflare R2 эсвэл Uploadthing ашиглаж байгаа бол энд upload логикоо бичнэ.
    // Жишээ болгож Base64 хэлбэрээр бэкэнд рүү шидэхээр форматлав:
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let uploadedImageUrl = '';

      // Хэрэв хэрэв файл сонгосон байвал эхлээд сервер рүү хуулж URL авна
      if (selectedFile) {
        uploadedImageUrl = await uploadImageToServer(selectedFile);
      }

      await createProject({
        variables: {
          input: {
            title,
            description,
            images: uploadedImageUrl ? [uploadedImageUrl] : [],
            creatorId: user.id,
          },
        },
      });

      alert('Төсөл амжилттай үүслээ! 🎉');
      // Form-оо цэвэрлэх
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading = mutationLoading || isUploading;

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Шинэ төсөл нэмэх
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Төслийн нэр */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Төслийн нэр
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Төслийн гарчиг оруулна уу"
            className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        {/* Тайлбар */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Төслийн тайлбар
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            placeholder="Төслийнхөө талаар дэлгэрэнгүй бичээрэй..."
            className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
          />
        </div>

        {/* Зураг оруулах хэсэг (File Drag & Drop загвартай) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Төслийн зураг
          </label>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition"
            >
              <span className="text-4xl block mb-2">📸</span>
              <p className="text-sm font-medium text-gray-600">
                Зураг сонгох бол энд дарна уу
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, WEBP (Макс 5МБ)
              </p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-4 right-4 bg-red-500 text-white p-1.5 rounded-full shadow hover:bg-red-600 transition text-xs font-bold px-2.5"
              >
                Устгах
              </button>
            </div>
          )}
        </div>

        {/* Алдаа харуулах */}
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            ⚠️ Алдаа: {error.message}
          </div>
        )}

        {/* Илгээх товч */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 transition duration-200"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Төслийг үүсгэж байна...
            </span>
          ) : (
            'Төсөл үүсгэх'
          )}
        </button>
      </form>
    </div>
  );
}
