"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NotificationActor {
  id: number;
  username: string;
  fullName: string | null;
  profileImageUrl: string | null;
  rankTier: string;
}

interface NotificationItem {
  id: number;
  userId: number;
  actorId: number | null;
  type: string;
  title: string;
  message: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
  actor?: NotificationActor | null;
}

interface NotificationDropdownProps {
  currentUser: any;
  onNotificationUpdate?: () => void;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "FRIEND_REQUEST":
      return "👋";
    case "FRIEND_ACCEPT":
      return "🤝";
    case "COMMENT_REPLY":
    case "POST_COMMENT":
      return "💬";
    case "POST_LIKE":
    case "COMMENT_LIKE":
      return "❤️";
    case "RANK_UP":
      return "👑";
    case "BADGE_UNLOCKED":
      return "🏅";
    default:
      return "🔔";
  }
}

export default function NotificationDropdown({
  currentUser,
  onNotificationUpdate,
}: NotificationDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "friends" | "comments" | "activity">("all");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) return;
    loadNotifications();

    // Poll every 30 seconds for real-time notifications
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadNotifications() {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.status === "success") {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }

  async function handleMarkAllRead() {
    try {
      setLoading(true);
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      if (onNotificationUpdate) onNotificationUpdate();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleNotificationClick(notification: NotificationItem) {
    if (!notification.isRead) {
      try {
        fetch("/api/notifications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notification.id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        if (onNotificationUpdate) onNotificationUpdate();
      } catch (err) {
        console.error(err);
      }
    }

    setIsOpen(false);
    if (notification.linkUrl) {
      router.push(notification.linkUrl);
    }
  }

  async function handleFriendAction(
    actorId: number,
    action: "ACCEPT" | "REJECT",
    notificationId: number
  ) {
    try {
      setActionLoadingId(notificationId);

      // Find friendship with this actor
      const friendsRes = await fetch("/api/friends");
      const friendsData = await friendsRes.json();
      const pendingReq = friendsData.pendingIncoming?.find(
        (req: any) => req.sender.id === actorId || req.senderId === actorId
      );

      if (pendingReq) {
        await fetch(`/api/friends/${pendingReq.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
      }

      // Mark notification as read
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      loadNotifications();
      if (onNotificationUpdate) onNotificationUpdate();
    } catch (err) {
      console.error("Friend action error:", err);
    } finally {
      setActionLoadingId(null);
    }
  }

  const filteredNotifications = notifications.filter((item) => {
    if (filterTab === "friends") {
      return item.type === "FRIEND_REQUEST" || item.type === "FRIEND_ACCEPT";
    }
    if (filterTab === "comments") {
      return (
        item.type === "COMMENT_REPLY" ||
        item.type === "POST_COMMENT" ||
        item.type === "COMMENT_LIKE" ||
        item.type === "POST_LIKE"
      );
    }
    if (filterTab === "activity") {
      return item.type === "RANK_UP" || item.type === "BADGE_UNLOCKED";
    }
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications();
        }}
        type="button"
        className="relative p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-white transition-all cursor-pointer flex items-center justify-center"
        aria-label="Notifications"
        title="Notifications"
      >
        <svg
          className={`w-5 h-5 transition-transform ${unreadCount > 0 ? "animate-pulse" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-stone-900 shadow-sm animate-in zoom-in-50">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-200 z-50 text-gray-800 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition cursor-pointer disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-100 px-3 pt-2 bg-white text-xs font-semibold gap-1">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                filterTab === "all"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterTab("friends")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                filterTab === "friends"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <span>👥</span> Friends
            </button>
            <button
              onClick={() => setFilterTab("comments")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                filterTab === "comments"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <span>💬</span> Comments
            </button>
            <button
              onClick={() => setFilterTab("activity")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                filterTab === "activity"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <span>⚡</span> XP
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((n) => {
                const icon = getNotificationIcon(n.type);
                const isFriendRequest = n.type === "FRIEND_REQUEST";

                return (
                  <div
                    key={n.id}
                    className={`p-4 transition hover:bg-gray-50/90 flex gap-3 items-start ${
                      !n.isRead ? "bg-emerald-50/40" : "bg-white"
                    }`}
                  >
                    {/* Actor Avatar / Icon */}
                    <div className="relative flex-shrink-0">
                      {n.actor?.profileImageUrl ? (
                        <img
                          src={n.actor.profileImageUrl}
                          alt={n.actor.username}
                          className="w-10 h-10 rounded-full object-cover border border-emerald-300"
                        />
                      ) : n.actor?.username ? (
                        <img
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${n.actor.username}`}
                          alt={n.actor.username}
                          className="w-10 h-10 rounded-full object-cover border border-emerald-300 bg-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-base">
                          {icon}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 text-xs">{icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div
                        onClick={() => handleNotificationClick(n)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-bold text-gray-900 leading-tight">
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>

                      {/* Quick Actions for Friend Requests */}
                      {isFriendRequest && n.actorId && (
                        <div className="mt-2.5 flex items-center gap-2">
                          <button
                            onClick={() => handleFriendAction(n.actorId!, "ACCEPT", n.id)}
                            disabled={actionLoadingId === n.id}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            {actionLoadingId === n.id ? "Processing..." : "Accept"}
                          </button>
                          <button
                            onClick={() => handleFriendAction(n.actorId!, "REJECT", n.id)}
                            disabled={actionLoadingId === n.id}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition cursor-pointer disabled:opacity-50"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Unread indicator */}
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-400">
                <div className="text-3xl mb-2">🌿</div>
                <p className="text-xs font-semibold text-gray-600">All caught up!</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  No notifications in this tab.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-center">
            <Link
              href={`/profile/${currentUser?.username}`}
              onClick={() => setIsOpen(false)}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1"
            >
              View Connections &amp; Wall &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
