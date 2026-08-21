"use client";

import React, { useState } from "react";

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
}

export default function InviteFriendsModal({
  isOpen,
  onClose,
  currentUser,
}: InviteFriendsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Always default to production domain so WhatsApp / Social shares work for recipients
  const origin =
    typeof window !== "undefined" && !window.location.origin.includes("localhost")
      ? window.location.origin
      : "https://northeastconnect.in";
  const refCode = currentUser?.username || "friend";
  const inviteUrl = `${origin}/?ref=${encodeURIComponent(refCode)}`;
  const shareText = `Hey! Join me on NorthEast Connect — the premier community hub for all 8 Northeast states! Connect with locals, join regional Addas, explore verified homestays & news: ${inviteUrl}`;

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  function handleWhatsAppShare() {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
  }

  function handleTelegramShare() {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(
        "Join me on NorthEast Connect!"
      )}`,
      "_blank"
    );
  }

  function handleTwitterShare() {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  }

  return (
    <div
      className="fixed inset-0 z-[1100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 text-lg w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center cursor-pointer transition"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-3xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            🤝
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Invite Your Friends
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
            Bring your friends, college circle & fellow explorers to NorthEast Connect and build your regional network!
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 rounded-full text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-3">
            <span>✨</span> Earn +50 Explorer XP per referral
          </div>
        </div>

        {/* Referral Link Box */}
        <div className="space-y-2 mb-6">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Your Personal Invite Link
          </label>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-1.5 pl-3">
            <span className="text-xs text-slate-600 dark:text-slate-300 font-mono truncate flex-1 select-all">
              {inviteUrl}
            </span>
            <button
              onClick={handleCopy}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer shrink-0 ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white"
              }`}
            >
              {copied ? "Copied! ✓" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* Quick Social Share Buttons */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block text-center">
            Quick Share Via
          </span>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={handleWhatsAppShare}
              className="flex flex-col items-center justify-center p-3 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl transition cursor-pointer group"
            >
              <span className="text-xl mb-1 group-hover:scale-110 transition-transform">💬</span>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">WhatsApp</span>
            </button>

            <button
              onClick={handleTelegramShare}
              className="flex flex-col items-center justify-center p-3 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800/60 rounded-2xl transition cursor-pointer group"
            >
              <span className="text-xl mb-1 group-hover:scale-110 transition-transform">✈️</span>
              <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300">Telegram</span>
            </button>

            <button
              onClick={handleTwitterShare}
              className="flex flex-col items-center justify-center p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl transition cursor-pointer group"
            >
              <span className="text-xl mb-1 group-hover:scale-110 transition-transform">𝕏</span>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Twitter / X</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
