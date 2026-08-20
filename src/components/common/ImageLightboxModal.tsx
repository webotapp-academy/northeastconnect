"use client";

import React, { useState, useEffect, useCallback } from "react";

interface ImageLightboxModalProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageLightboxModal({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: ImageLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Sync index on open or prop changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, [initialIndex, isOpen]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, [images.length]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, [images.length]);

  // Keyboard navigation & Esc key listener
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "+" || e.key === "=") {
        setZoomLevel((z) => Math.min(z + 0.3, 3));
      } else if (e.key === "-") {
        setZoomLevel((z) => Math.max(z - 0.3, 0.7));
      } else if (e.key === "0") {
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Mouse pan handlers when zoomed in
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-black/95 backdrop-blur-2xl text-white select-none animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center gap-3">
          <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono font-bold text-slate-200 border border-white/10">
            {currentIndex + 1} / {images.length}
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline-block">
            Use Arrow keys to navigate &bull; Esc to exit
          </span>
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-2">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1 flex items-center gap-1 border border-white/10">
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
              className="w-8 h-8 rounded-xl hover:bg-white/20 flex items-center justify-center text-sm font-bold transition cursor-pointer"
              title="Zoom Out (-)"
            >
              −
            </button>
            <button
              onClick={() => {
                setZoomLevel(1);
                setPanPosition({ x: 0, y: 0 });
              }}
              className="px-2 h-8 rounded-xl hover:bg-white/20 flex items-center justify-center text-xs font-mono font-semibold transition cursor-pointer"
              title="Reset Zoom (0)"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3.5))}
              className="w-8 h-8 rounded-xl hover:bg-white/20 flex items-center justify-center text-sm font-bold transition cursor-pointer"
              title="Zoom In (+)"
            >
              +
            </button>
          </div>

          <a
            href={currentImage}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition cursor-pointer text-slate-300 hover:text-white"
            title="Open high-res in new tab"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          <button
            onClick={onClose}
            className="w-9 h-9 bg-white/20 hover:bg-rose-600 rounded-2xl flex items-center justify-center transition cursor-pointer font-bold text-lg text-white"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Image Display Area */}
      <div
        className="relative flex-1 w-full flex items-center justify-center overflow-hidden p-4"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: zoomLevel > 1 ? (isPanning ? "grabbing" : "grab") : "default" }}
      >
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 sm:left-8 z-20 w-12 h-12 rounded-2xl bg-black/60 hover:bg-white/20 backdrop-blur-md border border-white/15 flex items-center justify-center text-white text-xl transition transform hover:scale-110 cursor-pointer shadow-2xl"
            title="Previous (Left Arrow)"
          >
            ‹
          </button>
        )}

        {/* The Scalable / Zoomable Photo */}
        <div
          className="transition-transform duration-100 ease-out max-w-full max-h-full flex items-center justify-center"
          style={{
            transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
          }}
        >
          <img
            src={currentImage}
            alt={`Photo ${currentIndex + 1}`}
            className="max-h-[82vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl transition-all"
            draggable={false}
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 sm:right-8 z-20 w-12 h-12 rounded-2xl bg-black/60 hover:bg-white/20 backdrop-blur-md border border-white/15 flex items-center justify-center text-white text-xl transition transform hover:scale-110 cursor-pointer shadow-2xl"
            title="Next (Right Arrow)"
          >
            ›
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip for Multi-Photo Carousel */}
      {images.length > 1 && (
        <div className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-t from-black/90 to-transparent z-10 overflow-x-auto scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setZoomLevel(1);
                setPanPosition({ x: 0, y: 0 });
              }}
              className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition transform cursor-pointer shrink-0 ${
                currentIndex === idx
                  ? "border-emerald-400 scale-105 shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                  : "border-white/20 opacity-50 hover:opacity-100"
              }`}
            >
              <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
