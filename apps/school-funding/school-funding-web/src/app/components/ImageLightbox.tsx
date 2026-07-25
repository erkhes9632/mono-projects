'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (index: number) => void;
}

export default function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const [zoomed, setZoomed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  useEffect(() => {
    setActiveIndex(currentIndex);
    setZoomed(false);
  }, [currentIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, images.length]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navigate = (dir: number) => {
    const newIndex = activeIndex + dir;
    if (newIndex < 0 || newIndex >= images.length) return;
    setActiveIndex(newIndex);
    setZoomed(false);
    onNavigate?.(newIndex);
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#E85D3A]/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2.5 rounded-xl bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-all border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoomed(!zoomed);
            }}
            className="absolute top-4 left-4 z-10 p-2.5 rounded-xl bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-all border border-white/10"
          >
            {zoomed ? (
              <ZoomOut className="w-5 h-5" />
            ) : (
              <ZoomIn className="w-5 h-5" />
            )}
          </button>

          {images.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-medium text-white/70">
              {activeIndex + 1} / {images.length}
            </div>
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(-1);
                }}
                disabled={activeIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-xl bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-all border border-white/10 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(1);
                }}
                disabled={activeIndex >= images.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-xl bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-all border border-white/10 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: zoomed ? 1.5 : 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[activeIndex]}
              alt=""
              className={`max-w-[90vw] max-h-[85vh] object-contain rounded-2xl ${
                zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              onClick={() => setZoomed(!zoomed)}
              draggable={false}
            />
          </motion.div>

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(i);
                    setZoomed(false);
                  }}
                  className={`w-12 h-8 rounded-lg overflow-hidden border-2 transition-all ${
                    i === activeIndex
                      ? 'border-[#E85D3A] opacity-100'
                      : 'border-white/20 opacity-50 hover:opacity-80'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
