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
  
  // Track resolved friend requests by notificationId or actorId
  const [resolvedRequests, setResolvedRequests] = useState<Record<number, "ACCEPTED" | "DECLINED">>({});
  // Track existing accepted friends IDs to know if request was already accepted
  const [acceptedFriendActorIds, setAcceptedFriendActorIds] = useState<number[]>([]);

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
      const [notifRes, friendsRes] = await Promise.all([
        fetch("/api/notifications"),
        fetch("/api/friends"),
      ]);
      const notifData = await notifRes.json();
      const friendsData = await friendsRes.json();

      if (notifData.status === "success") {
        setNotifications(notifData.notifications || []);
        setUnreadCount(notifData.unreadCount || 0);
      }

      if (friendsData.status === "success" && friendsData.friends) {
        const friendIds = friendsData.friends.map((f: any) => f.user?.id).filter(Boolean);
        setAcceptedFriendActorIds(friendIds);
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

    // Resolve target URL
    let targetUrl = notification.linkUrl;
    if (!targetUrl || targetUrl === "/community") {
      if (notification.type === "FRIEND_REQUEST" || notification.type === "FRIEND_ACCEPT") {
        targetUrl = notification.actor?.username
          ? `/profile/${notification.actor.username}`
          : `/profile/${currentUser?.username}`;
      } else if (notification.type === "RANK_UP" || notification.type === "BADGE_UNLOCKED") {
        targetUrl = "/leaderboard";
      } else {
        targetUrl = "/";
      }
    }

    try {
      const parsed = new URL(targetUrl, window.location.origin);
      const targetPath = parsed.pathname;
      const targetHash = parsed.hash;
      const currentPath = window.location.pathname;

      const isSamePage =
        currentPath === targetPath ||
        ((targetPath === "/" || targetPath === "") &&
          (currentPath === "/" || currentPath === "" || currentPath === "/community")) ||
        (targetPath === "/community" &&
          (currentPath === "/" || currentPath === "" || currentPath === "/community"));

      if (isSamePage && targetHash) {
        if (window.location.hash !== targetHash) {
          window.location.hash = targetHash;
        }
        window.dispatchEvent(new Event("hashchange"));

        const targetId = targetHash.replace("#", "");
        setTimeout(() => {
          const elem = document.getElementById(targetId);
          if (elem) {
            elem.scrollIntoView({ behavior: "smooth", block: "center" });
            elem.classList.add("ring-2", "ring-emerald-500", "ring-offset-2");
            setTimeout(() => {
              elem.classList.remove("ring-2", "ring-emerald-500", "ring-offset-2");
            }, 3500);
          }
        }, 100);
        return;
      }

      if (parsed.origin === window.location.origin) {
        router.push(parsed.pathname + parsed.search + parsed.hash);
      } else {
        window.location.href = targetUrl;
      }
    } catch {
      router.push(targetUrl);
    }
  }

  async function handleFriendAction(
    e: React.MouseEvent,
    actorId: number,
    action: "ACCEPT" | "REJECT",
    notificationId: number
  ) {
    e.stopPropagation();
    try {
      setActionLoadingId(notificationId);

      // Find friendship with this actor
      const friendsRes = await fetch("/api/friends");
      const friendsData = await friendsRes.json();
      const pendingReq = friendsData.pendingIncoming?.find(
        (req: any) => req.sender?.id === actorId || req.senderId === actorId
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

      // Update local state to immediately show "Accepted" or "Declined"
      setResolvedRequests((prev) => ({
        ...prev,
        [notificationId]: action === "ACCEPT" ? "ACCEPTED" : "DECLINED",
      }));

      if (action === "ACCEPT") {
        setAcceptedFriendActorIds((prev) => [...prev, actorId]);
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
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
        className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer flex items-center justify-center shrink-0"
        aria-label="Notifications"
        title="Notifications"
      >
        <svg
          className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform ${unreadCount > 0 ? "animate-pulse" : ""}`}
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
          <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs animate-in zoom-in-50">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="fixed left-1/2 -translate-x-1/2 top-14 w-[calc(100vw-24px)] max-w-sm sm:absolute sm:left-auto sm:right-0 sm:translate-x-0 sm:w-96 sm:top-auto sm:mt-2.5 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 text-slate-900 dark:text-slate-100 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition cursor-pointer disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 px-3 pt-2 bg-slate-50/50 dark:bg-slate-900 text-xs font-semibold gap-1">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                filterTab === "all"
                  ? "bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterTab("friends")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                filterTab === "friends"
                  ? "bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <span>👥</span> Friends
            </button>
            <button
              onClick={() => setFilterTab("comments")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                filterTab === "comments"
                  ? "bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <span>💬</span> Comments
            </button>
            <button
              onClick={() => setFilterTab("activity")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                filterTab === "activity"
                  ? "bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <span>⚡</span> XP
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/70">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((n) => {
                const icon = getNotificationIcon(n.type);
                const isFriendRequest = n.type === "FRIEND_REQUEST";
                const isResolvedAccepted =
                  resolvedRequests[n.id] === "ACCEPTED" ||
                  (n.actorId && acceptedFriendActorIds.includes(n.actorId));
                const isResolvedDeclined = resolvedRequests[n.id] === "DECLINED";

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/60 flex gap-3 items-start cursor-pointer select-none group ${
                      !n.isRead ? "bg-emerald-50/60 dark:bg-emerald-950/20" : "bg-white dark:bg-slate-900"
                    }`}
                  >
                    {/* Actor Avatar / Icon */}
                    <div className="relative flex-shrink-0">
                      {n.actor?.profileImageUrl ? (
                        <img
                          src={n.actor.profileImageUrl}
                          alt={n.actor.username}
                          className="w-10 h-10 rounded-full object-cover border border-emerald-500/40"
                        />
                      ) : n.actor?.username ? (
                        <img
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${n.actor.username}`}
                          alt={n.actor.username}
                          className="w-10 h-10 rounded-full object-cover border border-emerald-500/40 bg-slate-100 dark:bg-slate-800"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-base">
                          {icon}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 text-xs">{icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono whitespace-nowrap">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>

                      {/* Quick Actions for Friend Requests */}
                      {isFriendRequest && n.actorId && (
                        <div className="mt-2.5">
                          {isResolvedAccepted ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg shadow-2xs animate-in zoom-in-95">
                              <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Accepted</span>
                            </div>
                          ) : isResolvedDeclined ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-medium rounded-lg shadow-2xs">
                              <span>Declined</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => handleFriendAction(e, n.actorId!, "ACCEPT", n.id)}
                                disabled={actionLoadingId === n.id}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1"
                              >
                                {actionLoadingId === n.id ? (
                                  <>
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    <span>Accepting...</span>
                                  </>
                                ) : (
                                  "Accept"
                                )}
                              </button>
                              <button
                                onClick={(e) => handleFriendAction(e, n.actorId!, "REJECT", n.id)}
                                disabled={actionLoadingId === n.id}
                                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition cursor-pointer disabled:opacity-50 border border-slate-200 dark:border-slate-700/60"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Unread indicator */}
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5 shadow-xs" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500">
                <div className="text-3xl mb-2">🌿</div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  No notifications in this tab.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              href={`/profile/${currentUser?.username}`}
              onClick={() => setIsOpen(false)}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold inline-flex items-center gap-1 transition"
            >
              View Connections &amp; Wall &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
