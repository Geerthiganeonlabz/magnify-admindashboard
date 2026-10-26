"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PreviewImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ImagePreviewModalProps {
  images: PreviewImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const ANIMATION_DURATION_MS = 200;


export function ImagePreviewModal({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: ImagePreviewModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const image = images[currentIndex];
  const hasMultiple = images.length > 1;

  const handleClose = useCallback(() => {
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      onClose();
    }, ANIMATION_DURATION_MS);
  }, [onClose]);

  const goToPrevious = useCallback(() => {
    if (!hasMultiple) return;
    onNavigate((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, hasMultiple, images.length, onNavigate]);

  const goToNext = useCallback(() => {
    if (!hasMultiple) return;
    onNavigate((currentIndex + 1) % images.length);
  }, [currentIndex, hasMultiple, images.length, onNavigate]);


  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handleClose();
      if (event.key === "ArrowLeft") goToPrevious();
      if (event.key === "ArrowRight") goToNext();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, goToPrevious, goToNext]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  if (!image) return null;

  const animateIn = isVisible && !isClosing;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onClick={handleClose}
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 transition-opacity duration-200 sm:p-8",
        animateIn ? "opacity-100" : "opacity-0",
      )}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          handleClose();
        }}
        aria-label="Close preview"
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60 sm:right-6 sm:top-6"
      >
        <X className="h-6 w-6" aria-hidden="true" />
      </button>

      {hasMultiple && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            goToPrevious();
          }}
          aria-label="Previous image"
          className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60 sm:left-6"
        >
          <ChevronLeft className="h-7 w-7" aria-hidden="true" />
        </button>
      )}

      {hasMultiple && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            goToNext();
          }}
          aria-label="Next image"
          className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60 sm:right-6"
        >
          <ChevronRight className="h-7 w-7" aria-hidden="true" />
        </button>
      )}

      <div
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "relative flex h-full max-h-[85vh] w-full max-w-5xl items-center justify-center transition-transform duration-200",
          animateIn ? "scale-100" : "scale-95",
        )}
      >
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="100vw"
          className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain"
        />
      </div>

      {hasMultiple && (
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-sm text-white">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
