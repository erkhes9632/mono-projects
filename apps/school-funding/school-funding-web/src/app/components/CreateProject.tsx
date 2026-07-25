'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Image as ImageIcon,
  Loader2,
  X,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';

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
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createProject, { loading: mutationLoading, error }] = useMutation(
    CREATE_PROJECT_MUTATION,
  );

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#E85D3A]" />
      </div>
    );

  if (!user)
    return (
      <div className="text-center py-16">
        <p className="text-[#EAE2D5]/80">Please sign in to create a project.</p>
      </div>
    );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setFileError('Image must be under 3MB');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadImageToServer = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let uploadedImageUrl = '';
      if (selectedFile)
        uploadedImageUrl = await uploadImageToServer(selectedFile);
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
      setSuccess(true);
      setTimeout(() => router.push('/student-dashboard'), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading = mutationLoading || isUploading;

  if (success) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-[#E85D3A]/15 border border-[#E85D3A]/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-[#E85D3A]" />
        </div>
        <h2 className="text-xl font-bold text-[#EAE2D5] mb-2">
          Project Submitted! 🎉
        </h2>
        <p className="text-sm text-[#EAE2D5]/80">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#E85D3A]/15 border border-[#E85D3A]/20">
          <Sparkles className="w-5 h-5 text-[#E85D3A]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#EAE2D5]">
            Propose a Project
          </h1>
          <p className="text-xs text-[#EAE2D5]/80 mt-0.5">
            Share your idea to make a difference
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 flex items-start gap-3">
        <Lightbulb className="w-4 h-4 text-[#E85D3A] mt-0.5 shrink-0" />
        <div className="text-[11px] text-[#EAE2D5]/80 leading-relaxed">
          <span className="text-[#E85D3A] font-medium">
            Tips for a great project:
          </span>{' '}
          Be specific about what you want to achieve, explain the impact on the
          school community, and add a compelling image.
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 space-y-5"
      >
        <div>
          <label className="block text-[11px] font-semibold text-[#EAE2D5]/80 uppercase tracking-wider mb-2">
            Project Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., School Garden Renovation"
            className="w-full px-4 py-3 rounded-xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 text-[#EAE2D5] text-sm placeholder-[#242831] focus:outline-none focus:border-[#E85D3A]/40 transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#EAE2D5]/80 uppercase tracking-wider mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            placeholder="Describe your project in detail — what is it, why is it needed, how will it benefit the community?"
            className="w-full px-4 py-3 rounded-xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 text-[#EAE2D5] text-sm placeholder-[#242831] focus:outline-none focus:border-[#E85D3A]/40 transition resize-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#EAE2D5]/80 uppercase tracking-wider mb-2">
            Project Image (optional)
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
              className="border-2 border-dashed border-[#E85D3A]/30 rounded-xl p-8 text-center cursor-pointer hover:border-[#E85D3A]/50 hover:bg-[#E85D3A]/[0.03] transition"
            >
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-[#EAE2D5]/80" />
              <p className="text-xs font-medium text-[#EAE2D5]/80">
                Click to upload an image
              </p>
              <p className="text-[10px] text-[#EAE2D5]/80/50 mt-1">
                PNG, JPG, WEBP (max 3MB)
              </p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-[#E85D3A]/10 border border-[#E85D3A]/20">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setFileError(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#2D323E]/80 backdrop-blur-md text-[#EAE2D5]/80 hover:text-[#E85D3A] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {fileError && (
            <p className="text-xs text-red-400 mt-2">{fileError}</p>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 text-[#EAE2D5]/80 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-[#E85D3A] text-white font-bold text-sm shadow-lg shadow-[#E85D3A]/20 hover:bg-[#D14C2A] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4" /> Submit Project
            </>
          )}
        </button>
      </form>
    </div>
  );
}
