"use client";

import React, { useState } from "react";
import ImageLightboxModal from "./ImageLightboxModal";

interface PostMediaCarouselProps {
  mediaUrls: string;
}

export default function PostMediaCarousel({ mediaUrls }: PostMediaCarouselProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  if (!mediaUrls) return null;

  // Parse comma-separated or JSON list of image URLs
  let images: string[] = [];
  try {
    if (mediaUrls.startsWith("[")) {
      images = JSON.parse(mediaUrls);
    } else {
      images = mediaUrls
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);
    }
  } catch {
    images = [mediaUrls];
  }

  if (images.length === 0) return null;

  const handleOpenLightbox = (index: number) => {
    setActivePhotoIndex(index);
    setLightboxOpen(true);
  };

  // Case 1: Single Photo
  if (images.length === 1) {
    return (
      <>
        <div
          onClick={() => handleOpenLightbox(0)}
          className="relative mb-3.5 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 group cursor-zoom-in max-h-[500px]"
        >
          <img
            src={images[0]}
            alt="Attached media"
            className="w-full h-auto max-h-[500px] object-cover group-hover:scale-[1.01] transition-transform duration-300"
          />
          {/* Zoom Overlay Badge */}
          <div className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[11px] font-bold text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <span>🔍</span> Click to zoom
          </div>
        </div>

        <ImageLightboxModal
          images={images}
          initialIndex={activePhotoIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      </>
    );
  }

  // Case 2: Multi-Photo Carousel
  return (
    <>
      <div className="relative mb-3.5 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 group select-none">
        {/* Main Carousel Slide */}
        <div
          onClick={() => handleOpenLightbox(carouselIndex)}
          className="relative w-full h-72 sm:h-96 cursor-zoom-in overflow-hidden"
        >
          <img
            src={images[carouselIndex]}
            alt={`Slide ${carouselIndex + 1}`}
            className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
          />

          {/* Photo Counter Pill */}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-white border border-white/10 shadow-lg">
            {carouselIndex + 1} / {images.length}
          </div>

          {/* Zoom Indicator */}
          <div className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[11px] font-bold text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <span>🔍</span> Zoom
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        {carouselIndex > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCarouselIndex((prev) => Math.max(prev - 1, 0));
            }}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center font-bold text-base transition opacity-90 hover:opacity-100 shadow-md cursor-pointer"
            title="Previous Photo"
          >
            ‹
          </button>
        )}

        {carouselIndex < images.length - 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCarouselIndex((prev) => Math.min(prev + 1, images.length - 1));
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center font-bold text-base transition opacity-90 hover:opacity-100 shadow-md cursor-pointer"
            title="Next Photo"
          >
            ›
          </button>
        )}

        {/* Indicator Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCarouselIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                carouselIndex === i ? "w-5 bg-emerald-400" : "w-1.5 bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>

      <ImageLightboxModal
        images={images}
        initialIndex={activePhotoIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
