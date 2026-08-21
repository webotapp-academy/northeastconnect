"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface MessengerDropdownProps {
  currentUser?: any;
}

export default function MessengerDropdown({ currentUser }: MessengerDropdownProps) {
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeChatFriend, setActiveChatFriend] = useState<any | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessagesList, setChatMessagesList] = useState<Record<number, Array<{ sender: string; text: string; time: string }>>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  useEffect(() => {
    if (open && currentUser) {
      fetchFriends();
    }
  }, [open, currentUser]);

  async function fetchFriends() {
    try {
      setLoading(true);
      const res = await fetch("/api/friends");
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.friends)) {
        setFriends(data.friends.map((f: any) => f.user).filter(Boolean));
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!chatMessage.trim() || !activeChatFriend) return;

    const friendId = activeChatFriend.id;
    const newMsg = {
      sender: "me",
      text: chatMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessagesList((prev) => ({
      ...prev,
      [friendId]: [...(prev[friendId] || []), newMsg],
    }));

    setChatMessage("");
  }

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Messenger Top Bar Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer shrink-0"
        aria-label="Friends Messenger"
        title="Messenger / Friends Chat"
      >
        <span className="text-sm sm:text-base">💬</span>
        {friends.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
            {friends.length > 9 ? "9+" : friends.length}
          </span>
        )}
      </button>

      {/* Messenger Dropdown Panel */}
      {open && (
        <div className="fixed left-1/2 -translate-x-1/2 top-14 w-[calc(100vw-24px)] max-w-sm sm:absolute sm:left-auto sm:right-0 sm:translate-x-0 sm:w-96 sm:top-auto sm:mt-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850/80">
            <div className="flex items-center gap-2">
              <span className="text-base">💬</span>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                {activeChatFriend ? `Chat with @${activeChatFriend.username}` : "Friends Messenger"}
              </h4>
            </div>
            {activeChatFriend ? (
              <button
                onClick={() => setActiveChatFriend(null)}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                &larr; Back
              </button>
            ) : (
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                {friends.length} {friends.length === 1 ? "Friend" : "Friends"}
              </span>
            )}
          </div>

          {/* Active Chat Conversation View */}
          {activeChatFriend ? (
            <div className="flex flex-col h-72">
              {/* Chat Friend Info Bar */}
              <div className="px-4 py-2.5 bg-emerald-50/60 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
                <Link
                  href={`/profile/${activeChatFriend.username}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 min-w-0 hover:underline"
                >
                  <img
                    src={
                      activeChatFriend.profileImageUrl ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${activeChatFriend.username}`
                    }
                    alt={activeChatFriend.username}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-500 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {activeChatFriend.fullName || activeChatFriend.username}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">@{activeChatFriend.username}</p>
                  </div>
                </Link>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Connected
                </span>
              </div>

              {/* Chat Messages Bubble Area */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 text-xs">
                {(!chatMessagesList[activeChatFriend.id] ||
                  chatMessagesList[activeChatFriend.id].length === 0) && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-1 py-6">
                    <span className="text-2xl">👋</span>
                    <p className="font-semibold text-xs text-slate-600 dark:text-slate-300">
                      Say hello to @{activeChatFriend.username}!
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-[200px]">
                      Share tips, plan road trips, or discuss local community addas.
                    </p>
                  </div>
                )}

                {(chatMessagesList[activeChatFriend.id] || []).map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.sender === "me" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                        msg.sender === "me"
                          ? "bg-emerald-600 text-white rounded-br-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs"
                      }`}
                    >
                      <p className="leading-relaxed break-words">{msg.text}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder={`Message @${activeChatFriend.username}...`}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!chatMessage.trim()}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-full text-xs font-bold transition cursor-pointer shrink-0 shadow-xs"
                >
                  Send
                </button>
              </form>
            </div>
          ) : (
            /* Friends List View */
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-500">Loading your friends...</div>
              ) : friends.length === 0 ? (
                <div className="p-6 text-center text-slate-500 space-y-3">
                  <span className="text-3xl block">👥</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No connected friends yet
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                    Connect with fellow explorers across Northeast India to unlock instant messaging.
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <Link
                      href="/leaderboard"
                      onClick={() => setOpen(false)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full transition shadow-xs"
                    >
                      Meet Explorers
                    </Link>
                  </div>
                </div>
              ) : (
                friends.map((friend: any) => (
                  <div
                    key={friend.id}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-850/60 transition flex items-center justify-between gap-3"
                  >
                    <Link
                      href={`/profile/${friend.username}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 min-w-0 group"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={
                            friend.profileImageUrl ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${friend.username}`
                          }
                          alt={friend.username}
                          className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate transition">
                          {friend.fullName || friend.username}
                        </h5>
                        <p className="text-[10px] text-slate-500 font-mono truncate">
                          @{friend.username} • 📍 {friend.city || friend.state || "Northeast"}
                        </p>
                      </div>
                    </Link>

                    <button
                      onClick={() => setActiveChatFriend(friend)}
                      className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-full text-xs font-bold transition cursor-pointer shrink-0 shadow-xs flex items-center gap-1"
                    >
                      <span>💬</span>
                      <span>Chat</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
