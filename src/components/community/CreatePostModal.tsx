"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import AddaAutocompleteInput from "@/components/common/AddaAutocompleteInput";
import { MASTER_ADDAS, AddaDef } from "@/lib/addas";

interface CreatePostModalProps {
  currentUser: any;
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
  defaultAdda?: string | null;
}

export default function CreatePostModal({
  currentUser,
  isOpen,
  onClose,
  onPostCreated,
  defaultAdda = null,
}: CreatePostModalProps) {
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState("");
  const [taggedLocation, setTaggedLocation] = useState(defaultAdda || "");
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [manualMediaUrl, setManualMediaUrl] = useState("");
  const [composerAddaDropdownOpen, setComposerAddaDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addaPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (defaultAdda) {
      setTaggedLocation(defaultAdda);
    }
  }, [defaultAdda]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close adda dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (addaPopoverRef.current && !addaPopoverRef.current.contains(e.target as Node)) {
        setComposerAddaDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen || !mounted) return null;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!currentUser) {
      setErrorMsg("Please sign in to upload photos");
      return;
    }

    try {
      setUploadingMedia(true);
      setErrorMsg("");

      const remainingSlots = 6 - attachedPhotos.length;
      const filesToUpload = files.slice(0, remainingSlots);

      const formData = new FormData();
      for (const file of filesToUpload) {
        formData.append("files", file);
      }
      formData.append("folder", "posts");

      const res = await fetch("/api/upload?folder=posts", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.status === "success") {
        const newUrls = data.urls || (data.url ? [data.url] : []);
        if (newUrls.length > 0) {
          setAttachedPhotos((prev) => [...prev, ...newUrls].slice(0, 6));
        } else {
          setErrorMsg("No images could be processed.");
        }
      } else {
        setErrorMsg(data.message || "Failed to upload image.");
      }
    } catch {
      setErrorMsg("Network error uploading photo.");
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!content.trim() && attachedPhotos.length === 0) {
      setErrorMsg("Please write something or attach a photo to share!");
      return;
    }

    try {
      setSubmitting(true);
      const finalMedia =
        attachedPhotos.length > 0
          ? attachedPhotos.join(",")
          : manualMediaUrl.trim() || null;

      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          mediaUrls: finalMedia,
          mediaType: finalMedia ? "IMAGE" : "TEXT",
          taggedLocation: taggedLocation || null,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setContent("");
        setAttachedPhotos([]);
        setTaggedLocation("");
        setShowMediaInput(false);
        setManualMediaUrl("");

        // Broadcast global post creation event for live feed updates
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("northeast-post-created", { detail: data.post }));
        }

        if (onPostCreated) {
          onPostCreated();
        }
        onClose();
      } else {
        setErrorMsg(data.message || "Failed to create post");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[999999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white dark:bg-[#0f1420] border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-900 dark:text-slate-100 my-0 sm:my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Create Community Post
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 dark:text-rose-300 flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Composer Form */}
        <div className="overflow-y-auto py-3 space-y-3 flex-1 scrollbar-thin">
          <div className="flex gap-3">
            <img
              src={
                currentUser?.profileImageUrl ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.username || "explorer"}`
              }
              alt="Avatar"
              className="w-10 h-10 rounded-2xl object-cover border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <AddaAutocompleteInput
                isTextArea={true}
                rows={3}
                placeholder={
                  taggedLocation
                    ? `Post in ${taggedLocation}... (type #tag or @mention)`
                    : `Share with Northeast explorers... (type #hashtag or n:adda for suggestions)`
                }
                value={content}
                onChange={(val) => setContent(val)}
                onSelectAdda={(adda) => {
                  if (!taggedLocation) {
                    setTaggedLocation(adda.name);
                  }
                }}
                className="w-full bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
              />

              {/* Photo Carousel Preview */}
              {attachedPhotos.length > 0 && (
                <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {attachedPhotos.map((url, idx) => (
                    <div key={idx} className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-100 dark:bg-slate-800 shadow-sm shrink-0 group">
                      <img
                        src={url}
                        alt={`Attachment ${idx + 1}`}
                        className="h-20 w-20 sm:h-24 sm:w-24 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setAttachedPhotos((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-950/85 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer transition"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                      <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-mono text-white">
                        {idx + 1}
                      </span>
                    </div>
                  ))}
                  {attachedPhotos.length < 6 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 flex flex-col items-center justify-center text-slate-400 hover:text-emerald-500 text-xs font-bold transition shrink-0 cursor-pointer"
                    >
                      <span className="text-base">+</span>
                      <span>Add More</span>
                    </button>
                  )}
                </div>
              )}

              {/* Media URL Input */}
              {showMediaInput && (
                <div className="mt-2.5 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
                  <input
                    type="url"
                    placeholder="Paste image link (https://...)"
                    value={manualMediaUrl}
                    onChange={(e) => setManualMediaUrl(e.target.value)}
                    className="w-full bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (manualMediaUrl.trim()) {
                        setAttachedPhotos((prev) => [...prev, manualMediaUrl.trim()].slice(0, 6));
                        setManualMediaUrl("");
                      }
                      setShowMediaInput(false);
                    }}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shrink-0"
                  >
                    Attach
                  </button>
                </div>
              )}

              {/* Action Bar */}
              <div className="mt-3 flex items-center justify-between flex-wrap gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Photo Upload with Multi-File Picker */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingMedia}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                      attachedPhotos.length > 0
                        ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700"
                        : "bg-slate-100/90 dark:bg-slate-800/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80"
                    }`}
                    title="Upload photos (up to 6)"
                  >
                    {uploadingMedia ? (
                      <svg className="w-3.5 h-3.5 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    <span>
                      {uploadingMedia
                        ? "Uploading..."
                        : attachedPhotos.length > 0
                        ? `${attachedPhotos.length} Photo${attachedPhotos.length > 1 ? "s" : ""} ✓`
                        : "Photos"}
                    </span>
                  </button>

                  {/* URL Attachment Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowMediaInput(!showMediaInput)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Attach via Image URL"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </button>

                  {/* Adda Selector Popover */}
                  <div className="relative" ref={addaPopoverRef}>
                    <button
                      type="button"
                      onClick={() => setComposerAddaDropdownOpen(!composerAddaDropdownOpen)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                        taggedLocation
                          ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/80 shadow-xs"
                          : "bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700/80"
                      }`}
                    >
                      <span>{taggedLocation ? (MASTER_ADDAS.find((a: AddaDef) => a.name === taggedLocation)?.icon || "🌿") : "🌿"}</span>
                      <span>{taggedLocation || "Choose Adda"}</span>
                      <svg className="w-3 h-3 ml-0.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {composerAddaDropdownOpen && (
                      <div className="absolute bottom-full left-0 mb-2 w-64 max-h-56 overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1 mb-1">
                          Select Topic or State Adda
                        </div>
                        <div className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setTaggedLocation("");
                              setComposerAddaDropdownOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
                              !taggedLocation
                                ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>🌐</span>
                              <span>n:all (General Feed)</span>
                            </span>
                            {!taggedLocation && <span>✓</span>}
                          </button>

                          {MASTER_ADDAS.map((adda: AddaDef) => (
                            <button
                              key={adda.id}
                              type="button"
                              onClick={() => {
                                setTaggedLocation(adda.name);
                                setComposerAddaDropdownOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
                                taggedLocation === adda.name
                                  ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold"
                                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                            >
                              <span className="flex items-center gap-2 truncate">
                                <span>{adda.icon}</span>
                                <span className="truncate">{adda.name}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                {adda.state}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right XP Perk & Submit Button */}
                <div className="flex items-center gap-2 ml-auto">
                  <div
                    className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full text-[11px] font-bold border border-emerald-200 dark:border-emerald-800/60"
                    title="Earn 10 XP Karma per post!"
                  >
                    <span>✨</span>
                    <span>+10 XP</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || uploadingMedia || (!content.trim() && attachedPhotos.length === 0)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold shadow-md shadow-emerald-600/20 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                  >
                    {submitting ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span>Posting...</span>
                      </>
                    ) : (
                      <span>Post (+10 XP)</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
