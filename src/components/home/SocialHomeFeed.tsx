"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import RankBadge from "@/components/profile/RankBadge";
import CommentSection from "@/components/comments/CommentSection";
import AuthModal from "@/components/auth/AuthModal";
import GoogleAd from "@/components/GoogleAd";
import AddaAutocompleteInput from "@/components/common/AddaAutocompleteInput";
import PostMediaCarousel from "@/components/common/PostMediaCarousel";
import PostReactionsBar from "@/components/community/PostReactionsBar";
import RepostModal from "@/components/community/RepostModal";
import ShareButton from "@/components/common/ShareButton";
import { soundFX } from "@/lib/soundEffects";
import { renderRichPostContent } from "@/lib/postFormatting";
import PostLinkPreview from "@/components/common/PostLinkPreview";
import { getCommunityPostSlugUrl } from "@/lib/slugs";

const NE_STATES = [
  { name: "All States", icon: "🌿", tag: "All" },
  { name: "Assam", icon: "🦏", tag: "Assam" },
  { name: "Meghalaya", icon: "🌧️", tag: "Meghalaya" },
  { name: "Arunachal Pradesh", icon: "🏔️", tag: "Arunachal" },
  { name: "Nagaland", icon: "🦅", tag: "Nagaland" },
  { name: "Manipur", icon: "🌸", tag: "Manipur" },
  { name: "Mizoram", icon: "🎋", tag: "Mizoram" },
  { name: "Tripura", icon: "🏰", tag: "Tripura" },
  { name: "Sikkim", icon: "❄️", tag: "Sikkim" },
];

const INITIAL_ADDAS = [
  {
    id: "guwahati",
    name: "n:guwahati",
    title: "Guwahati City Adda",
    icon: "🏙️",
    count: 1343,
    tag: "City Hub",
    category: "Cities",
    state: "Assam",
    desc: "Capital hub, city life, hangouts, food spots & local events.",
  },
  {
    id: "shillong",
    name: "n:shillong",
    title: "Shillong Hills & Music",
    icon: "🌧️",
    count: 256,
    tag: "Music & Hills",
    category: "Cities",
    state: "Meghalaya",
    desc: "Rock music, pine groves, cozy cafes & Khasi cultural vibes.",
  },
  {
    id: "kaziranga",
    name: "n:kaziranga",
    title: "Kaziranga Wildlife Safari",
    icon: "🦏",
    count: 184,
    tag: "Wildlife & Safari",
    category: "Nature & Wildlife",
    state: "Assam",
    desc: "One-horned rhino sightings, safari bookings & nature stories.",
  },
  {
    id: "nagaland",
    name: "n:nagaland",
    title: "Nagaland & Hornbill Adda",
    icon: "🦅",
    count: 201,
    tag: "Hornbill & Culture",
    category: "States",
    state: "Nagaland",
    desc: "Hornbill festival, tribal traditions, music & high hills.",
  },
  {
    id: "sikkim",
    name: "n:sikkim",
    title: "Sikkim Himalayan Adda",
    icon: "❄️",
    count: 102,
    tag: "Himalayas & Monasteries",
    category: "States",
    state: "Sikkim",
    desc: "Kanchenjunga vistas, high mountain passes & monasteries.",
  },
  {
    id: "tawang",
    name: "n:tawang",
    title: "Tawang & Arunachal Trails",
    icon: "🏔️",
    count: 203,
    tag: "Mountain Trails",
    category: "Nature & Wildlife",
    state: "Arunachal Pradesh",
    desc: "Sela Pass snow, Tawang Monastery & Arunachal exploration.",
  },
  {
    id: "majuli",
    name: "n:majuli",
    title: "Majuli Island Heritage",
    icon: "🎭",
    count: 124,
    tag: "River Island & Art",
    category: "Culture",
    state: "Assam",
    desc: "World's largest river island, mask making & Vaishnavite Sattras.",
  },
  {
    id: "dzukou",
    name: "n:dzukou",
    title: "Dzukou Valley Trekkers",
    icon: "🌸",
    count: 198,
    tag: "Valley Trekking",
    category: "Nature & Wildlife",
    state: "Nagaland",
    desc: "Trekking trails, seasonal lily blooms & mountain camping.",
  },
  {
    id: "cherrapunji",
    name: "n:cherrapunji",
    title: "Sohra & Living Root Bridges",
    icon: "🌊",
    count: 224,
    tag: "Root Bridges & Falls",
    category: "Nature & Wildlife",
    state: "Meghalaya",
    desc: "Living root bridges, Nohkalikai falls & monsoon adventures.",
  },
  {
    id: "food",
    name: "n:food",
    title: "NE Foodies & Cuisines",
    icon: "🍲",
    count: 542,
    tag: "Food & Recipes",
    category: "Topics",
    state: "All States",
    desc: "Smoked pork, bamboo shoot, authentic thalis & traditional recipes.",
  },
  {
    id: "travel",
    name: "n:travel",
    title: "Backpackers & Road Trips",
    icon: "🎒",
    count: 610,
    tag: "Travel & Backpacking",
    category: "Topics",
    state: "All States",
    desc: "Road trips, homestay reviews, shared cabs & travel itineraries.",
  },
  {
    id: "music",
    name: "n:music",
    title: "NE Indie Music & Bands",
    icon: "🎸",
    count: 385,
    tag: "Music & Festivals",
    category: "Topics",
    state: "All States",
    desc: "Ziro festival, rock bands, folk fusion & local gig alerts.",
  },
];

interface SocialHomeFeedProps {
  initialPosts: any[];
  latestNews: any[];
  featuredDirectory: any[];
  topExplorers: any[];
  marketplaceDeals: any[];
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
  const days = Math.floor(minutes / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function SocialHomeFeed({
  initialPosts = [],
  latestNews = [],
  featuredDirectory = [],
  topExplorers = [],
  marketplaceDeals = [],
}: SocialHomeFeedProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedAdda, setSelectedAdda] = useState<string | null>(null);
  const [feedTab, setFeedTab] = useState<"trending" | "latest" | "friends">("trending");
  const [loading, setLoading] = useState(false);

  // Addas membership state
  const [addasList, setAddasList] = useState(INITIAL_ADDAS);
  const [joinedAddas, setJoinedAddas] = useState<string[]>([]);
  const [showAddasModal, setShowAddasModal] = useState(false);
  const [addaSearchQuery, setAddaSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Adda real members & related content
  const [addaMembers, setAddaMembers] = useState<any[]>([]);
  const [totalAddaMembers, setTotalAddaMembers] = useState(0);
  const [relatedAddaNews, setRelatedAddaNews] = useState<any[]>([]);
  const [relatedAddaDirectory, setRelatedAddaDirectory] = useState<any[]>([]);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);

  // Post composer state
  const [newContent, setNewContent] = useState("");
  const [taggedLocation, setTaggedLocation] = useState("");
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);
  const [manualMediaUrl, setManualMediaUrl] = useState("");
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [composerAddaDropdownOpen, setComposerAddaDropdownOpen] = useState(false);
  const [composerAddaSearch, setComposerAddaSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const addaPopoverRef = useRef<HTMLDivElement | null>(null);

  // Post editing & action menu state
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editPostContent, setEditPostContent] = useState("");
  const [editPostSaving, setEditPostSaving] = useState(false);
  const [openPostMenuId, setOpenPostMenuId] = useState<number | null>(null);

  // Active expanded comments
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<number | null>(null);

  // Friend requests state
  const [friendRequestsSent, setFriendRequestsSent] = useState<Record<number, boolean>>({});

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Repost modal state
  const [repostModalOpen, setRepostModalOpen] = useState(false);
  const [repostModalPost, setRepostModalPost] = useState<any>(null);

  // Infinite scroll pagination state (10-by-10)
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (addaPopoverRef.current && !addaPopoverRef.current.contains(e.target as Node)) {
        setComposerAddaDropdownOpen(false);
      }
    }
    if (composerAddaDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [composerAddaDropdownOpen]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    try {
      setUploadingMedia(true);
      const formData = new FormData();
      const count = Math.min(files.length, 6);
      for (let i = 0; i < count; i++) {
        formData.append("files", files[i]);
      }

      const res = await fetch("/api/upload?folder=community", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.urls) && data.urls.length > 0) {
        setAttachedPhotos((prev) => [...prev, ...data.urls].slice(0, 6));
        setShowMediaInput(false);
        showToast(`📸 ${data.urls.length > 1 ? `${data.urls.length} photos` : "Photo"} attached!`);
      } else {
        showToast(data.message || "Failed to upload photo");
      }
    } catch {
      showToast("Error uploading photo");
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  useEffect(() => {
    fetchMe();

    async function loadLiveCounts() {
      try {
        const res = await fetch("/api/community/addas");
        const data = await res.json();
        if (data.status === "success" && Array.isArray(data.addas)) {
          setAddasList((prev) =>
            prev.map((a) => {
              const match = data.addas.find((s: any) => s.name === a.name);
              return match ? { ...a, count: match.count } : a;
            })
          );
        }
      } catch {
        // Ignored
      }
    }
    loadLiveCounts();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const addaParam = params.get("adda");
      if (addaParam) {
        setSelectedAdda(addaParam);
        setTaggedLocation(addaParam);
        fetchAddaMembers(addaParam);
        loadPosts(selectedState, feedTab, addaParam);
      }
    }
  }, []);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }

  // Handle direct navigation to post from notification hash (e.g. #post-123)
  useEffect(() => {
    async function handlePostHash() {
      if (typeof window === "undefined") return;
      const hash = window.location.hash;
      if (hash && hash.startsWith("#post-")) {
        const postId = parseInt(hash.replace("#post-", ""), 10);
        if (!isNaN(postId)) {
          // If post is not in current list, fetch it from API and prepend
          const exists = posts.some((p) => p.id === postId);
          if (!exists && posts.length > 0) {
            try {
              const res = await fetch(`/api/community/posts/${postId}`);
              const data = await res.json();
              if (data.status === "success" && data.post) {
                setPosts((prev) => {
                  if (prev.some((p) => p.id === postId)) return prev;
                  return [data.post, ...prev];
                });
              }
            } catch {
              // Ignore
            }
          }

          setExpandedCommentsPostId(postId);

          // Allow DOM to settle and scroll to post
          setTimeout(() => {
            const element = document.getElementById(`post-${postId}`);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
              // Highlight post card with subtle emerald glow
              element.classList.add("ring-2", "ring-emerald-500", "ring-offset-2");
              setTimeout(() => {
                element.classList.remove("ring-2", "ring-emerald-500", "ring-offset-2");
              }, 3500);
            }
          }, 350);
        }
      }
    }

    handlePostHash();
    window.addEventListener("hashchange", handlePostHash);
    window.addEventListener("popstate", handlePostHash);

    function handleExternalPostCreated(e: any) {
      if (e?.detail) {
        setPosts((prev) => [e.detail, ...prev]);
        setToastMessage("🎉 Post published (+10 XP)!");
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        loadPosts(selectedState, feedTab, selectedAdda, selectedHashtag);
      }
    }
    window.addEventListener("northeast-post-created", handleExternalPostCreated);

    function handleCommentCountUpdated(e: any) {
      if (e?.detail && e.detail.entityType === "post" && e.detail.entityId) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === e.detail.entityId) {
              return {
                ...p,
                commentsCount: e.detail.count,
                _count: {
                  ...(p._count || {}),
                  comments: e.detail.count,
                },
              };
            }
            return p;
          })
        );
      }
    }
    window.addEventListener("northeast-comment-count-updated", handleCommentCountUpdated);

    return () => {
      window.removeEventListener("hashchange", handlePostHash);
      window.removeEventListener("popstate", handlePostHash);
      window.removeEventListener("northeast-post-created", handleExternalPostCreated);
      window.removeEventListener("northeast-comment-count-updated", handleCommentCountUpdated);
    };
  }, [posts, selectedState, feedTab, selectedAdda, selectedHashtag]);

  async function fetchMe() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.status === "success" && data.user) {
        setCurrentUser(data.user);
        try {
          const saved = localStorage.getItem(`nec-joined-addas-${data.user.id}`);
          if (saved) {
            setJoinedAddas(JSON.parse(saved));
          } else {
            setJoinedAddas([]);
          }
        } catch {
          setJoinedAddas([]);
        }

        // Load existing friend connections and pending outgoing requests
        try {
          const friendsRes = await fetch("/api/friends");
          const friendsData = await friendsRes.json();
          if (friendsData.status === "success") {
            const sentMap: Record<number, boolean> = {};
            if (Array.isArray(friendsData.pendingOutgoing)) {
              friendsData.pendingOutgoing.forEach((req: any) => {
                const targetId = req.receiverId || req.receiver?.id;
                if (targetId) sentMap[targetId] = true;
              });
            }
            if (Array.isArray(friendsData.friends)) {
              friendsData.friends.forEach((f: any) => {
                if (f.user?.id) sentMap[f.user.id] = true;
              });
            }
            setFriendRequestsSent(sentMap);
          }
        } catch {
          // Ignored
        }
      } else {
        setCurrentUser(null);
        setJoinedAddas([]);
      }
    } catch {
      setCurrentUser(null);
      setJoinedAddas([]);
    }
  }

  async function handleCancelFriendRequest(targetUserId: number, targetUsername: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/friends?targetUserId=${targetUserId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.status === "success") {
        setFriendRequestsSent((prev) => {
          const updated = { ...prev };
          delete updated[targetUserId];
          return updated;
        });
        showToast(`Friend request to @${targetUsername} cancelled`);
      } else {
        showToast(data.message || "Failed to cancel request");
      }
    } catch {
      showToast("Failed to cancel friend request");
    }
  }

  async function loadPosts(
    state: string,
    tab: string,
    adda: string | null = null,
    hashtag: string | null = null
  ) {
    try {
      setLoading(true);
      setPage(1);
      setHasMore(true);
      const queryParams = new URLSearchParams();
      queryParams.set("page", "1");
      queryParams.set("limit", "10");
      if (tab === "friends") queryParams.set("filter", "friends");
      if (state !== "All States") queryParams.set("state", state);
      if (adda) queryParams.set("adda", adda);
      if (hashtag) queryParams.set("hashtag", hashtag);

      const res = await fetch(`/api/community/posts?${queryParams.toString()}`);
      const data = await res.json();
      if (data.status === "success") {
        setPosts(data.posts || []);
        setRelatedAddaNews(data.relatedNews || []);
        setRelatedAddaDirectory(data.relatedDirectory || []);
        if (data.hasMore === false || (data.posts && data.posts.length < 10)) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMorePosts() {
    if (loading || loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const queryParams = new URLSearchParams();
      queryParams.set("page", String(nextPage));
      queryParams.set("limit", "10");
      if (feedTab === "friends") queryParams.set("filter", "friends");
      if (selectedState !== "All States") queryParams.set("state", selectedState);
      if (selectedAdda) queryParams.set("adda", selectedAdda);
      if (selectedHashtag) queryParams.set("hashtag", selectedHashtag);

      const res = await fetch(`/api/community/posts?${queryParams.toString()}`);
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.posts)) {
        if (data.posts.length > 0) {
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p: any) => p.id));
            const newUniquePosts = data.posts.filter((p: any) => !existingIds.has(p.id));
            return [...prev, ...newUniquePosts];
          });
          setPage(nextPage);
        }
        if (data.hasMore === false || data.posts.length < 10) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more posts:", err);
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    const target = observerTarget.current;
    if (!target || !hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1, rootMargin: "300px" }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [observerTarget.current, hasMore, loading, loadingMore, page, feedTab, selectedState, selectedAdda, selectedHashtag]);

  function handleSelectHashtag(tag: string) {
    const cleanTag = tag.replace(/^#/, "");
    if (selectedHashtag === cleanTag) {
      setSelectedHashtag(null);
      loadPosts(selectedState, feedTab, selectedAdda, null);
    } else {
      setSelectedHashtag(cleanTag);
      loadPosts(selectedState, feedTab, selectedAdda, cleanTag);
    }
  }

  function renderPostContent(content: string) {
    if (!content) return null;
    return renderRichPostContent(content, {
      onSelectHashtag: handleSelectHashtag,
      onSelectAdda: handleSelectAdda,
    });
  }

  function getPostTypography(text: string) {
    if (!text) {
      return {
        excerpt: "",
        isLong: false,
        textStyle: "text-[14px] sm:text-[15px] font-normal leading-relaxed text-slate-800 dark:text-slate-200",
      };
    }

    // Strip raw image URLs from text preview
    const cleaned = text
      .replace(
        /(https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|webp|gif|svg|avif)(?:\?[^\s"'<>]*)?|\/uploads\/[^\s"'<>]+)/gi,
        ""
      )
      .trim();

    if (!cleaned) {
      return {
        excerpt: text,
        isLong: false,
        textStyle: "text-lg sm:text-xl font-bold sm:font-extrabold leading-snug tracking-tight text-slate-900 dark:text-slate-100",
      };
    }

    // Extract up to 3 lines / sentences (max 260 chars)
    const paragraphs = cleaned.split(/\n+/).map((p) => p.trim()).filter(Boolean);
    const maxChars = 260;

    let excerpt = "";
    let isLong = false;

    const sentenceMatches = cleaned.match(/[^.!?]+[.!?]+/g);

    if (sentenceMatches && sentenceMatches.length > 0) {
      if (sentenceMatches.length <= 3 && cleaned.length <= maxChars && paragraphs.length <= 3) {
        excerpt = cleaned;
        isLong = false;
      } else {
        const threeSentences = sentenceMatches.slice(0, 3).join(" ").trim();
        if (threeSentences.length < cleaned.length) {
          excerpt = threeSentences.slice(0, maxChars).trim();
          isLong = true;
        } else {
          excerpt = cleaned.slice(0, maxChars).trim();
          isLong = cleaned.length > maxChars;
        }
      }
    } else if (paragraphs.length > 3) {
      excerpt = paragraphs.slice(0, 3).join("\n").trim();
      isLong = true;
    } else if (cleaned.length > maxChars) {
      excerpt = cleaned.slice(0, maxChars).trim();
      isLong = true;
    } else {
      excerpt = cleaned;
      isLong = false;
    }

    // Dynamic Reddit-style Typography:
    // Tier 1: 1 line (short, < 65 chars) -> Big and Bold
    // Tier 2: 2 lines (medium, 65 - 145 chars) -> Little Big and Bold
    // Tier 3: 3 lines (long/excerpt, > 145 chars) -> Small and Regular (same balanced space)
    const excerptLen = excerpt.length;
    const lineBreaks = (excerpt.match(/\n/g) || []).length;

    let textStyle = "";
    if (excerptLen < 65 && lineBreaks === 0) {
      textStyle = "text-lg sm:text-xl font-bold sm:font-extrabold leading-snug tracking-tight text-slate-900 dark:text-slate-100";
    } else if (excerptLen <= 145 && lineBreaks <= 1) {
      textStyle = "text-[16px] sm:text-[17px] font-bold leading-snug tracking-[-0.01em] text-slate-900 dark:text-slate-100";
    } else {
      textStyle = "text-[14px] sm:text-[15px] font-normal leading-relaxed text-slate-800 dark:text-slate-200";
    }

    return { excerpt, isLong, textStyle };
  }

  function handleStateChange(state: string) {
    setSelectedState(state);
    setSelectedAdda(null);
    setSelectedHashtag(null);
    loadPosts(state, feedTab, null, null);
  }

  async function fetchAddaMembers(addaName: string) {
    try {
      const res = await fetch(`/api/community/addas?adda=${encodeURIComponent(addaName)}`);
      const data = await res.json();
      if (data.status === "success") {
        setAddaMembers(data.members || []);
        setTotalAddaMembers(data.totalMembers || 0);
      }
    } catch {
      // Ignored
    }
  }

  function handleSelectAdda(addaName: string) {
    if (selectedAdda === addaName) {
      // Toggle off
      setSelectedAdda(null);
      setAddaMembers([]);
      setTotalAddaMembers(0);
      loadPosts(selectedState, feedTab, null, selectedHashtag);
    } else {
      setSelectedAdda(addaName);
      setTaggedLocation(addaName);
      fetchAddaMembers(addaName);
      loadPosts(selectedState, feedTab, addaName, selectedHashtag);
      // Smooth scroll to composer
      const composer = document.getElementById("community-composer");
      if (composer) {
        composer.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  function handleToggleJoinAdda(addaName: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();

    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    const isCurrentlyJoined = joinedAddas.includes(addaName);
    let updated: string[];

    if (isCurrentlyJoined) {
      updated = joinedAddas.filter((name) => name !== addaName);
      showToast(`Left ${addaName}`);
    } else {
      updated = [...joinedAddas, addaName];
      showToast(`🎉 You joined ${addaName}! (+15 XP)`);
    }

    setJoinedAddas(updated);
    try {
      localStorage.setItem(`nec-joined-addas-${currentUser.id}`, JSON.stringify(updated));
    } catch {
      // Ignored
    }
  }

  async function handleSendFriendRequest(targetUserId: number, targetUsername: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      if (data.status === "success") {
        soundFX.playConnect();
        setFriendRequestsSent((prev) => ({ ...prev, [targetUserId]: true }));
        showToast(`✨ Friend request sent to @${targetUsername}!`);
      } else {
        showToast(data.message || "Request sent!");
      }
    } catch {
      showToast("Failed to send friend request");
    }
  }

  function handleTabChange(tab: "trending" | "latest" | "friends") {
    if (tab === "friends" && !currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setFeedTab(tab);
    loadPosts(selectedState, tab, selectedAdda);
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!newContent.trim()) return;

    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    try {
      setSubmitting(true);
      const postLocation = taggedLocation.trim() || selectedAdda || null;
      const finalMedia = attachedPhotos.length > 0
        ? attachedPhotos.join(",")
        : manualMediaUrl.trim() || null;

      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newContent.trim(),
          taggedLocation: postLocation,
          mediaUrls: finalMedia,
        }),
      });
      const data = await res.json();
      if (data.status === "success" && data.post) {
        soundFX.playPostPublished();
        setPosts([data.post, ...posts]);
        setNewContent("");
        if (!selectedAdda) setTaggedLocation("");
        setAttachedPhotos([]);
        setManualMediaUrl("");
        setShowMediaInput(false);
        showToast("✨ Post published with photo carousel! (+20 XP)");
        fetchMe();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveEditPost(postId: number) {
    if (!editPostContent.trim()) return;
    try {
      setEditPostSaving(true);
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editPostContent.trim() }),
      });
      const data = await res.json();
      if (data.status === "success" && data.post) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, content: data.post.content } : p))
        );
        setEditingPostId(null);
        showToast("✨ Post updated successfully!");
      } else {
        showToast(data.message || "Failed to update post");
      }
    } catch {
      showToast("Error updating post");
    } finally {
      setEditPostSaving(false);
    }
  }

  async function handleDeletePost(postId: number) {
    if (!confirm("Are you sure you want to permanently delete this post?")) return;
    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.status === "success") {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        showToast("🗑️ Post deleted successfully.");
      } else {
        showToast(data.message || "Failed to delete post");
      }
    } catch {
      showToast("Error deleting post");
    }
  }

  async function handleShare(post: any) {
    const shareUrl = `${window.location.origin}/community#post-${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by @${post.user.username} on North East Connect`,
          text: post.content.slice(0, 100),
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast("📋 Post link copied to clipboard!");
    }
  }

  // Filter posts if active adda is selected locally
  const displayedPosts = selectedAdda
    ? posts.filter((p) => {
        const loc = (p.taggedLocation || "").toLowerCase();
        const addaClean = selectedAdda.replace("n:", "").toLowerCase();
        return loc.includes(addaClean) || (p.content || "").toLowerCase().includes(selectedAdda.toLowerCase());
      })
    : posts;

  const currentActiveAddaObj = addasList.find((a) => a.name === selectedAdda);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 pt-3 sm:pt-5 pb-16 transition-colors">
      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-300 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        {/* ========================================================================= */}
        {/* TOP STATE PILLS BAR (Quick Regional Adda Switcher)                        */}
        {/* ========================================================================= */}
        <div className="mb-4 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-2xl p-2.5 sm:p-3 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {NE_STATES.map((st) => {
              const active = selectedState === st.name && !selectedAdda;
              return (
                <button
                  key={st.name}
                  onClick={() => handleStateChange(st.name)}
                  className={`flex-shrink-0 snap-start flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700/60"
                  }`}
                >
                  <span>{st.icon}</span>
                  <span>{st.name === "All States" ? "n:all" : `n:${st.name.toLowerCase().replace(/\s+/g, "")}`}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN 3-COLUMN ADDA LAYOUT (Glossy Cards)                                  */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ======================================================================= */}
          {/* LEFT COLUMN: User Card, Joined Addas & Navigation                       */}
          {/* ======================================================================= */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            {/* 1. User Profile or Join CTA Card */}
            {!currentUser ? (
              <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] space-y-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                    Join the North East Adda
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Connect with locals, join topic addas, share stories &amp; earn karma.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full shadow-xs transition cursor-pointer"
                  >
                    Sign In or Join Free
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    By joining, you can participate in all 8 state addas, comment, and post ads.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] text-center">
                <Link href={`/profile/${currentUser.username}`}>
                  <img
                    src={
                      currentUser.profileImageUrl ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`
                    }
                    alt={currentUser.username}
                    className="w-16 h-16 rounded-2xl object-cover mx-auto border-2 border-emerald-500 shadow-sm mb-3"
                  />
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 hover:text-emerald-500 dark:hover:text-emerald-400 transition">
                    {currentUser.fullName || currentUser.username}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">u/{currentUser.username}</p>
                </Link>
                <div className="mt-2.5 flex justify-center">
                  <RankBadge
                    rankTier={currentUser.rankTier}
                    xpPoints={currentUser.xpPoints}
                    size="sm"
                    showLevel={true}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link
                    href={`/profile/${currentUser.username}`}
                    className="p-2 bg-slate-100/80 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
                  >
                    <span className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                      {currentUser.xpPoints || 0}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">XP Karma</span>
                  </Link>
                  <Link
                    href={`/profile/${currentUser.username}`}
                    className="p-2 bg-slate-100/80 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
                  >
                    <span className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                      {currentUser.rankTier}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Rank</span>
                  </Link>
                </div>
              </div>
            )}

            {/* 2. MY JOINED ADDAS (Dynamic & Interactive) */}
            <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] space-y-1">
              <div className="flex items-center justify-between px-2 py-1 mb-1">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  My Addas ({joinedAddas.length})
                </span>
                <Link
                  href="/addas"
                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  + Explore
                </Link>
              </div>

              {joinedAddas.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500">
                  <p>You haven&apos;t joined any Addas yet.</p>
                  <Link
                    href="/addas"
                    className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 underline block"
                  >
                    Browse Popular Addas
                  </Link>
                </div>
              ) : (
                joinedAddas.map((addaName) => {
                  const addaObj = addasList.find((a) => a.name === addaName) || {
                    id: addaName,
                    name: addaName,
                    title: addaName,
                    icon: "💬",
                    count: 0,
                    tag: "Community",
                    category: "General",
                    state: "Northeast",
                    desc: "Community Adda",
                  };
                  const active = selectedAdda === addaName;

                  return (
                    <button
                      key={addaName}
                      onClick={() => handleSelectAdda(addaName)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        active
                          ? "bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/80 text-emerald-700 dark:text-emerald-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span>{addaObj.icon}</span>
                        <span className="truncate">{addaName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {addaObj.count ? `${addaObj.count.toLocaleString()}` : addaObj.state}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* 3. Quick Community Hubs */}
            <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] space-y-1">
              <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1 mb-1">
                Explore Hubs
              </div>
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60"
              >
                <span className="text-base">🏠</span>
                <span>Main Community Feed</span>
              </Link>
              <Link
                href="/community?tab=users"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">👥</span>
                <span>People &amp; Explorers</span>
              </Link>
              <Link
                href="/community?tab=posts"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">💭</span>
                <span>Community Thoughts</span>
              </Link>
              <Link
                href="/addas"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">🏛️</span>
                <span>Regional Addas</span>
              </Link>
              <Link
                href="/jobs"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">💼</span>
                <span>Jobs &amp; Careers</span>
              </Link>
              <Link
                href="/properties"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">🏡</span>
                <span>Properties (Buy &amp; Rent)</span>
              </Link>
              <Link
                href="/directory"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">🏢</span>
                <span>Verified Directory</span>
              </Link>
              <Link
                href="/marketplace"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">🛍️</span>
                <span>Marketplace Ads</span>
              </Link>
              <Link
                href="/news"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">📰</span>
                <span>Regional News</span>
              </Link>
              <Link
                href="/culture"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">🎭</span>
                <span>Culture &amp; Heritage</span>
              </Link>
              <Link
                href="/wildlife"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">🦏</span>
                <span>Wildlife Sanctuaries</span>
              </Link>
              <Link
                href="/adventure"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">🏔️</span>
                <span>Adventure Trails</span>
              </Link>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* CENTER COLUMN: Reddit-style Social Community Feed & Composer            */}
          {/* ======================================================================= */}
          <div className="lg:col-span-6 space-y-4">
            {/* Active Adda Header Banner (When filtering by an Adda) */}
            {selectedAdda && currentActiveAddaObj && (
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0">
                    {currentActiveAddaObj.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black tracking-tight truncate">
                        {currentActiveAddaObj.name}
                      </h2>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold font-mono">
                        {currentActiveAddaObj.count ? `${currentActiveAddaObj.count.toLocaleString()} members` : currentActiveAddaObj.tag}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-100 line-clamp-1 mt-0.5">
                      {currentActiveAddaObj.desc}
                    </p>

                    {/* Real Members Avatar Stack */}
                    {addaMembers.length > 0 && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/20">
                        <div className="flex -space-x-2 overflow-hidden">
                          {addaMembers.slice(0, 5).map((m) => (
                            <Link
                              key={m.id}
                              href={`/profile/${m.username}`}
                              title={`u/${m.username} (${m.fullName}) - ${m.city}`}
                            >
                              <img
                                src={m.profileImageUrl}
                                alt={m.username}
                                className="w-6 h-6 rounded-full border-2 border-emerald-600 object-cover hover:scale-110 transition shrink-0"
                              />
                            </Link>
                          ))}
                        </div>
                        <span className="text-[11px] text-emerald-100 font-medium">
                          {totalAddaMembers > 0
                            ? `${totalAddaMembers} real members (${currentActiveAddaObj.state})`
                            : `${addaMembers.length} active members`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => handleToggleJoinAdda(currentActiveAddaObj.name, e)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shadow-xs ${
                      joinedAddas.includes(currentActiveAddaObj.name)
                        ? "bg-white text-emerald-800 hover:bg-emerald-50"
                        : "bg-emerald-950/80 hover:bg-emerald-950 text-white border border-white/40"
                    }`}
                  >
                    {joinedAddas.includes(currentActiveAddaObj.name) ? "Joined ✓" : "+ Join Adda"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAdda(null);
                      loadPosts(selectedState, feedTab, null);
                    }}
                    className="p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white text-xs cursor-pointer"
                    title="Clear filter"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Quick Post Composer (Desktop / Tablet view only; Mobile uses bottom nav + button modal) */}
            <div
              id="community-composer"
              className="hidden lg:block bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all"
            >
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
                    rows={2}
                    placeholder={
                      currentUser
                        ? (taggedLocation || selectedAdda)
                          ? `Post in ${taggedLocation || selectedAdda}, u/${currentUser.username}... (type #tag or n:adda)`
                          : `Share with Northeast explorers... (type #hashtag or n:adda for suggestions)`
                        : `Sign in to share stories, ask recommendations, or tag #places...`
                    }
                    value={newContent}
                    onChange={(val) => setNewContent(val)}
                    onSelectAdda={(adda) => {
                      if (!taggedLocation && !selectedAdda) {
                        setTaggedLocation(adda.name);
                      }
                    }}
                    className="w-full bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
                  />

                  {/* Real-time Attached Photo Carousel Strip Preview */}
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

                  {/* Media URL Input Expandable */}
                  {showMediaInput && (
                    <div className="mt-2.5 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
                      <input
                        type="url"
                        placeholder="Paste image link (e.g. https://...)"
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

                  {/* Modern Action Bar */}
                  <div className="mt-3 flex items-center justify-between flex-wrap gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Photo Upload with Native Multi-File Picker */}
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
                        onClick={() => {
                          if (!currentUser) {
                            setAuthModalOpen(true);
                            return;
                          }
                          fileInputRef.current?.click();
                        }}
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
                            ? "Compressing & Uploading..."
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

                      {/* Modern Adda Selector Pill Popover */}
                      <div className="relative" ref={addaPopoverRef}>
                        {(() => {
                          const currentTag = taggedLocation || selectedAdda;
                          const activeAddaItem = addasList.find((a) => a.name === currentTag);
                          return (
                            <>
                              <button
                                type="button"
                                onClick={() => setComposerAddaDropdownOpen(!composerAddaDropdownOpen)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                                  currentTag
                                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/80 shadow-xs"
                                    : "bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700/80"
                                }`}
                              >
                                <span>{activeAddaItem ? activeAddaItem.icon : "🌿"}</span>
                                <span className="font-mono text-[11px] sm:text-xs">
                                  {currentTag || "Choose Adda"}
                                </span>
                                <svg
                                  className={`w-3 h-3 text-slate-400 transition-transform ${composerAddaDropdownOpen ? "rotate-180" : ""}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>

                              {/* Modern Dropdown Popover */}
                              {composerAddaDropdownOpen && (
                                <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                                  <div className="p-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                      type="text"
                                      placeholder="Search addas (e.g. guwahati, kaziranga)..."
                                      value={composerAddaSearch}
                                      onChange={(e) => setComposerAddaSearch(e.target.value)}
                                      className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                                    />
                                    {composerAddaSearch && (
                                      <button
                                        type="button"
                                        onClick={() => setComposerAddaSearch("")}
                                        className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>

                                  <div className="max-h-56 overflow-y-auto p-1 space-y-1 scrollbar-none">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTaggedLocation("");
                                        setComposerAddaDropdownOpen(false);
                                      }}
                                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition cursor-pointer ${
                                        !currentTag
                                          ? "bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100"
                                          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                      }`}
                                    >
                                      <span>🌐 General Feed (All Northeast)</span>
                                      {!currentTag && <span className="text-emerald-500 font-bold">✓</span>}
                                    </button>

                                    {addasList
                                      .filter((a) =>
                                        a.name.toLowerCase().includes(composerAddaSearch.toLowerCase()) ||
                                        a.state.toLowerCase().includes(composerAddaSearch.toLowerCase()) ||
                                        a.title.toLowerCase().includes(composerAddaSearch.toLowerCase())
                                      )
                                      .map((a) => (
                                        <button
                                          key={a.name}
                                          type="button"
                                          onClick={() => {
                                            setTaggedLocation(a.name);
                                            setComposerAddaDropdownOpen(false);
                                          }}
                                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition cursor-pointer ${
                                            currentTag === a.name
                                              ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-bold"
                                              : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                          }`}
                                        >
                                          <div className="flex items-center gap-2 truncate">
                                            <span className="text-base">{a.icon}</span>
                                            <div className="min-w-0">
                                              <p className="font-bold text-xs truncate">{a.name}</p>
                                              <p className="text-[10px] text-slate-400">{a.state} &bull; {a.tag}</p>
                                            </div>
                                          </div>
                                          {currentTag === a.name && (
                                            <span className="text-emerald-500 font-bold ml-2">✓</span>
                                          )}
                                        </button>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full hidden sm:inline-block">
                        ✨ +10 XP
                      </span>
                      <button
                        onClick={handleCreatePost}
                        disabled={submitting || !newContent.trim()}
                        className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-full shadow-md shadow-emerald-600/20 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                      >
                        {submitting ? "Posting..." : "Post (+10 XP)"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feed Sort Tabs (Trending / Latest / Friends) */}
            <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-2xl p-1.5 flex items-center gap-1 shadow-xs">
              <button
                onClick={() => handleTabChange("trending")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer group ${
                  feedTab === "trending"
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <svg
                  className={`w-4 h-4 transition-transform group-active:scale-95 ${
                    feedTab === "trending"
                      ? "text-amber-500 fill-amber-500/20"
                      : "text-slate-400 group-hover:text-amber-500"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z" />
                </svg>
                <span>Trending</span>
              </button>
              <button
                onClick={() => handleTabChange("latest")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer group ${
                  feedTab === "latest"
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <svg
                  className={`w-4 h-4 transition-transform group-active:scale-95 ${
                    feedTab === "latest"
                      ? "text-emerald-500 fill-emerald-500/20"
                      : "text-slate-400 group-hover:text-emerald-500"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Latest</span>
              </button>
              <button
                onClick={() => handleTabChange("friends")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer group ${
                  feedTab === "friends"
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <svg
                  className={`w-4 h-4 transition-transform group-active:scale-95 ${
                    feedTab === "friends"
                      ? "text-sky-500 fill-sky-500/20"
                      : "text-slate-400 group-hover:text-sky-500"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
                <span>Friends</span>
              </button>
            </div>

            {/* Active Filter Banner */}
            {(selectedHashtag || selectedAdda) && (
              <div className="mb-4 flex items-center justify-between bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/80 rounded-2xl px-4 py-2.5 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{selectedHashtag ? "🏷️" : "🌿"}</span>
                  <span className="text-xs text-slate-700 dark:text-slate-200">
                    Filtering by:{" "}
                    <strong className="text-emerald-700 dark:text-emerald-300 font-mono">
                      {selectedHashtag ? `#${selectedHashtag}` : selectedAdda}
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedHashtag) {
                      setSelectedHashtag(null);
                      loadPosts(selectedState, feedTab, selectedAdda, null);
                    } else if (selectedAdda) {
                      setSelectedAdda(null);
                      loadPosts(selectedState, feedTab, null, selectedHashtag);
                    }
                  }}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-rose-500 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>✕ Clear</span>
                </button>
              </div>
            )}

            {/* Feed Posts Stream (Glossy Reddit-Style Cards) */}
            {loading ? (
              <div className="py-20 text-center text-slate-400 text-xs">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading community feed...
              </div>
            ) : displayedPosts.length === 0 ? (
              <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl mb-3">
                  💬
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {selectedAdda ? `No posts in ${selectedAdda} yet` : "No posts found in this feed"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  {selectedAdda ? `Be the first to start the conversation in ${selectedAdda}!` : "Be the first explorer to share a story or recommendation!"}
                </p>
                <button
                  onClick={() => {
                    const comp = document.getElementById("community-composer");
                    if (comp) comp.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full shadow-xs transition cursor-pointer"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Aggregated In-Adda News & Directory Showcases */}
                {selectedAdda && (relatedAddaNews.length > 0 || relatedAddaDirectory.length > 0) && (
                  <div className="space-y-4 mb-2">
                    {/* Related News Card */}
                    {relatedAddaNews.length > 0 && (
                      <div className="bg-gradient-to-br from-white/90 to-emerald-50/40 dark:from-slate-900/90 dark:to-emerald-950/20 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base">📰</span>
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                              Trending News in {selectedAdda}
                            </h3>
                          </div>
                          <Link href="/news" className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                            View All &rarr;
                          </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {relatedAddaNews.map((n) => (
                            <Link
                              key={n.id}
                              href={`/news/${n.url || n.id}`}
                              className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 hover:border-emerald-500 transition group flex flex-col justify-between"
                            >
                              <div>
                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                                  {n.category || "News"}
                                </span>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-2 mt-1">
                                  {n.title}
                                </h4>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono mt-2 block">
                                {n.publishedDate ? new Date(n.publishedDate).toLocaleDateString() : "Recent"}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Directory Businesses */}
                    {relatedAddaDirectory.length > 0 && (
                      <div className="bg-gradient-to-br from-white/90 to-blue-50/40 dark:from-slate-900/90 dark:to-blue-950/20 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base">📇</span>
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                              Verified Businesses in {selectedAdda}
                            </h3>
                          </div>
                          <Link href="/directory" className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                            Explore Directory &rarr;
                          </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {relatedAddaDirectory.map((b) => (
                            <Link
                              key={b.id}
                              href={`/listing/${(b.businessName || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${b.id}`}
                              className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 hover:border-blue-500 transition group flex flex-col justify-between"
                            >
                              <div>
                                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                                  {b.category || "Business"}
                                </span>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-1 mt-1">
                                  {b.businessName}
                                </h4>
                                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                  📍 {b.city || b.address || "Northeast"}
                                </p>
                              </div>
                              <span className="text-[10px] text-emerald-600 font-bold mt-2 block">
                                ⭐ Verified Listing
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {displayedPosts.map((post, idx) => {
                  const isCommentsOpen = expandedCommentsPostId === post.id;
                  const addaTag = post.taggedLocation?.startsWith("n:")
                    ? post.taggedLocation
                    : post.taggedLocation
                    ? `n:${post.taggedLocation.toLowerCase().replace(/\s+/g, "")}`
                    : null;

                  return (
                    <React.Fragment key={post.id}>
                      <article
                        id={`post-${post.id}`}
                        className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-lg transition-all duration-200 group"
                      >
                        {/* Header: Author & Adda Metadata */}
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <Link href={`/profile/${post.user.username}`} className="shrink-0">
                              <img
                                src={
                                  post.user.profileImageUrl ||
                                  `https://api.dicebear.com/7.x/bottts/svg?seed=${post.user.username}`
                                }
                                alt={post.user.username}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition"
                              />
                            </Link>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs sm:text-[13px]">
                                {addaTag ? (
                                  <button
                                    onClick={() => handleSelectAdda(addaTag)}
                                    className="font-black text-xs sm:text-[13px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                                  >
                                    {addaTag}
                                  </button>
                                ) : (
                                  <span className="font-black text-xs sm:text-[13px] text-slate-800 dark:text-slate-200">
                                    n:all
                                  </span>
                                )}
                                <span className="text-slate-400 text-xs">•</span>
                                <Link
                                  href={`/profile/${post.user.username}`}
                                  className="font-bold text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition truncate"
                                >
                                  u/{post.user.username}
                                </Link>
                                <span className="text-slate-400 text-xs">•</span>
                                <Link
                                  href={getCommunityPostSlugUrl(post)}
                                  className="text-xs text-slate-500 dark:text-slate-400 font-mono hover:underline hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                                  title="Open full post thread in new page"
                                >
                                  {timeAgo(post.createdAt)}
                                </Link>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <RankBadge
                              rankTier={post.user.rankTier}
                              xpPoints={post.user.xpPoints}
                              size="sm"
                              showLevel={false}
                            />

                            {/* Author / Admin Action Dropdown */}
                            {currentUser && (currentUser.id === post.user.id || currentUser.role === "Admin" || currentUser.role === "SuperAdmin") && (
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenPostMenuId(openPostMenuId === post.id ? null : post.id);
                                  }}
                                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-xs font-bold"
                                  title="Post options"
                                >
                                  •••
                                </button>

                                {openPostMenuId === post.id && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1 z-30 animate-in fade-in duration-100 text-xs"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingPostId(post.id);
                                        setEditPostContent(post.content);
                                        setOpenPostMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold transition text-left cursor-pointer"
                                    >
                                      <span>✏️</span>
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenPostMenuId(null);
                                        handleDeletePost(post.id);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-semibold transition text-left cursor-pointer"
                                    >
                                      <span>🗑️</span>
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content or Inline Editor */}
                        {editingPostId === post.id ? (
                          <div className="mb-3.5 space-y-2 animate-in fade-in duration-150">
                            <textarea
                              rows={3}
                              value={editPostContent}
                              onChange={(e) => setEditPostContent(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-emerald-500 rounded-2xl p-3 text-sm sm:text-base text-slate-900 dark:text-slate-100 focus:outline-none"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingPostId(null)}
                                className="px-3 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEditPost(post.id)}
                                disabled={editPostSaving}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                              >
                                {editPostSaving ? "Saving..." : "Save Changes"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-3.5">
                            {(() => {
                              const { excerpt: displayContent, isLong, textStyle } = getPostTypography(post.content);
                              return (
                                <Link
                                  href={`/community/${post.id}`}
                                  className="block group/desc hover:opacity-95 transition"
                                  title="Click to view full post thread"
                                >
                                  <div className={`${textStyle} whitespace-pre-wrap`}>
                                    {renderPostContent(displayContent)}
                                    {isLong && (
                                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover/desc:underline ml-1.5 align-baseline">
                                        ... Read more &rarr;
                                      </span>
                                    )}
                                  </div>
                                </Link>
                              );
                            })()}

                            {/* Embedded Reposted Post Card (Facebook-Style) */}
                            {post.originalPost && (
                              <div className="mt-3 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 bg-slate-100/90 dark:bg-slate-800/80 space-y-2.5">
                                <div className="flex items-center justify-between gap-2">
                                  <Link
                                    href={`/profile/${post.originalPost.user?.username}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-2 min-w-0 group/orig"
                                  >
                                    <img
                                      src={
                                        post.originalPost.user?.profileImageUrl ||
                                        `https://api.dicebear.com/7.x/bottts/svg?seed=${post.originalPost.user?.username}`
                                      }
                                      alt={post.originalPost.user?.username}
                                      className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                    />
                                    <div className="min-w-0">
                                      <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 group-hover/orig:underline truncate block">
                                        {post.originalPost.user?.fullName || post.originalPost.user?.username}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        @{post.originalPost.user?.username}
                                      </span>
                                    </div>
                                  </Link>
                                  {post.originalPost.user && (
                                    <RankBadge
                                      rankTier={post.originalPost.user.rankTier}
                                      xpPoints={post.originalPost.user.xpPoints}
                                      size="sm"
                                      showLevel={false}
                                    />
                                  )}
                                </div>

                                <Link href={`/community/${post.originalPost.id}`} className="block">
                                  <p className="text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 line-clamp-3 leading-relaxed">
                                    {post.originalPost.content}
                                  </p>
                                </Link>

                                {post.originalPost.mediaUrls && (
                                  <PostMediaCarousel mediaUrls={post.originalPost.mediaUrls} />
                                )}
                              </div>
                            )}

                            {/* Link Previews (Facebook-Style & YouTube) */}
                            <PostLinkPreview content={post.content} />
                          </div>
                        )}

                        {/* Media Attachment Carousel & Lightbox Zoom (with fallback image auto-detection) */}
                        {(() => {
                          const effectiveMediaUrls =
                            post.mediaUrls ||
                            (() => {
                              const imgRegex =
                                /(https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|webp|gif|svg|avif)(?:\?[^\s"'<>]*)?|\/uploads\/[^\s"'<>]+)/gi;
                              const matches = post.content?.match(imgRegex);
                              return matches && matches.length > 0
                                ? Array.from(new Set(matches)).join(",")
                                : null;
                            })();
                          if (!effectiveMediaUrls) return null;
                          return (
                            <div className="mb-3.5">
                              <PostMediaCarousel mediaUrls={effectiveMediaUrls} />
                            </div>
                          );
                        })()}

                        {/* Footer Action Bar */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            {/* Like Reactions Bar */}
                            <PostReactionsBar
                              postId={post.id}
                              initialLikesCount={post.likesCount || 0}
                              initialUserReaction={post.userReaction || null}
                              currentUser={currentUser}
                            />

                            {/* Comments Count & Toggle */}
                            {(() => {
                              const numComments = (post.commentsCount !== undefined ? post.commentsCount : post._count?.comments) || 0;
                              return (
                                <button
                                  onClick={() =>
                                    setExpandedCommentsPostId(isCommentsOpen ? null : post.id)
                                  }
                                  className={`px-3 sm:px-3.5 py-1.5 rounded-full font-bold text-xs sm:text-[13px] flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs ${
                                    isCommentsOpen
                                      ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                                      : "bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60"
                                  }`}
                                >
                                  <span>💬</span>
                                  <span>{numComments}</span>
                                  <span className="hidden sm:inline font-semibold">{numComments === 1 ? "Thought" : "Thoughts"}</span>
                                </button>
                              );
                            })()}

                            {/* Repost Button */}
                            <button
                              type="button"
                              onClick={() => {
                                if (!currentUser) {
                                  setAuthModalOpen(true);
                                  return;
                                }
                                setRepostModalPost(post);
                                setRepostModalOpen(true);
                              }}
                              className="px-3 sm:px-3.5 py-1.5 rounded-full font-bold text-xs sm:text-[13px] flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60"
                              title="Repost to this platform"
                            >
                              <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 1l4 4-4 4" />
                                <path d="M3 11V9a4 4 0 014-4h14" />
                                <path d="M7 23l-4-4 4-4" />
                                <path d="M21 13v2a4 4 0 01-4 4H3" />
                              </svg>
                              <span>Repost</span>
                              {post.repostsCount > 0 && (
                                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{post.repostsCount}</span>
                              )}
                            </button>

                            <ShareButton
                              url={getCommunityPostSlugUrl(post)}
                              title={`Thought by @${post.user.username} on NorthEast Connect`}
                              text={post.content.slice(0, 100)}
                            />
                          </div>

                          <Link
                            href={getCommunityPostSlugUrl(post)}
                            className="text-[11px] text-slate-400 dark:text-slate-500 font-mono hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline"
                            title="Open permalink"
                          >
                            #{post.id}
                          </Link>
                        </div>

                        {/* Expandable Universal Comment Section */}
                        {isCommentsOpen && (
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
                            <CommentSection
                              entityType="post"
                              entityId={post.id}
                              entityTitle={`Post by @${post.user.username}`}
                              entityUrl={`/#post-${post.id}`}
                              hideHeader={true}
                              minimal={true}
                            />
                          </div>
                        )}
                      </article>

                      {/* In-feed "Make Friends & Discover Explorers" Section (Shown after 2 posts) */}
                      {((idx === 1) || (idx === 0 && posts.length === 1)) &&
                        topExplorers.filter((exp: any) => exp.id !== currentUser?.id && !friendRequestsSent[exp.id]).length > 0 && (
                        <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] my-1">
                          <div className="flex items-center justify-between mb-3.5">
                            <div className="flex items-center gap-2">
                              <span className="text-base">🤝</span>
                              <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                                Meet &amp; Make Friends
                              </h3>
                            </div>
                            <Link
                              href="/leaderboard"
                              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              Top Explorers &rarr;
                            </Link>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {topExplorers
                              .filter((exp: any) => exp.id !== currentUser?.id && !friendRequestsSent[exp.id])
                              .slice(0, 4)
                              .map((explorer: any) => {
                                return (
                                  <div
                                    key={explorer.id}
                                    className="p-3 bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 hover:border-emerald-500/50 transition"
                                  >
                                    <Link href={`/profile/${explorer.username}`} className="flex items-center gap-2.5 min-w-0">
                                      <img
                                        src={
                                          explorer.profileImageUrl ||
                                          `https://api.dicebear.com/7.x/bottts/svg?seed=${explorer.username}`
                                        }
                                        alt={explorer.username}
                                        className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                      />
                                      <div className="min-w-0">
                                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate hover:text-emerald-600">
                                          {explorer.fullName || explorer.username}
                                        </h4>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
                                          📍 {explorer.city || explorer.state || "Northeast"}
                                        </p>
                                      </div>
                                    </Link>

                                    <button
                                      onClick={(e) => handleSendFriendRequest(explorer.id, explorer.username, e)}
                                      className="px-3.5 py-1 text-[11px] font-bold rounded-full transition cursor-pointer shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs active:scale-95"
                                    >
                                      + Connect
                                    </button>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}

                      {/* In-feed Sponsored placement */}
                      {idx === 2 && (
                        <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-2 block">
                            Sponsored
                          </span>
                          <GoogleAd format="horizontal" responsive={true} />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* Infinite Scroll Sentinel & Loading Indicator */}
            {posts.length > 0 && (
              <div ref={observerTarget} className="py-6 text-center">
                {loadingMore ? (
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-xs animate-pulse">
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading more thoughts...</span>
                  </div>
                ) : hasMore ? (
                  <button
                    onClick={loadMorePosts}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full text-xs font-bold border border-slate-200/80 dark:border-slate-700 transition cursor-pointer"
                  >
                    <span>Load more thoughts ↓</span>
                  </button>
                ) : (
                  <div className="py-4 text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
                    <span>🌿</span>
                    <span>You're all caught up with community thoughts!</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ======================================================================= */}
          {/* RIGHT COLUMN: POPULAR ADDAS, TRENDING NEWS & FOOTER                    */}
          {/* ======================================================================= */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            {/* 1. POPULAR ADDAS CARD (Fully Interactive Join/Leave & Filter) */}
            <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Popular Addas
                </h3>
                <Link
                  href="/addas"
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  All ({addasList.length})
                </Link>
              </div>

              <div className="space-y-3">
                {addasList.slice(0, 6).map((comm) => {
                  const isJoined = joinedAddas.includes(comm.name);
                  const isFiltered = selectedAdda === comm.name;

                  return (
                    <div
                      key={comm.name}
                      onClick={() => handleSelectAdda(comm.name)}
                      className={`flex items-center justify-between gap-3 p-2 rounded-2xl transition cursor-pointer ${
                        isFiltered
                          ? "bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/60"
                          : "hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm shrink-0">
                          {comm.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition truncate">
                            {comm.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {comm.count ? `${comm.count.toLocaleString()} members` : ""}
                            </span>
                            {comm.count ? <span>•</span> : null}
                            <span className="truncate">{comm.tag}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isJoined) {
                            handleSelectAdda(comm.name);
                          } else {
                            handleToggleJoinAdda(comm.name, e);
                          }
                        }}
                        className={`px-3 py-1 text-xs font-bold rounded-full transition cursor-pointer shrink-0 shadow-xs ${
                          isJoined
                            ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40"
                            : "bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                        }`}
                        title={isJoined ? "View adda feed" : "Click to join"}
                      >
                        {isJoined ? "View" : "Join"}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/addas"
                  className="w-full py-2 bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-full border border-slate-200 dark:border-slate-700 transition cursor-pointer block text-center"
                >
                  See more addas &rarr;
                </Link>
              </div>
            </div>

            {/* 2. MAKE FRIENDS CARD (Sidebar Recommended Explorers) */}
            {topExplorers.filter((exp: any) => exp.id !== currentUser?.id && !friendRequestsSent[exp.id]).length > 0 && (
              <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-1.5">
                    <span>👥</span>
                    <h3 className="font-extrabold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Make Friends
                    </h3>
                  </div>
                  <Link
                    href="/leaderboard"
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    All &rarr;
                  </Link>
                </div>

                <div className="space-y-3">
                  {topExplorers
                    .filter((exp: any) => exp.id !== currentUser?.id && !friendRequestsSent[exp.id])
                    .slice(0, 4)
                    .map((explorer: any) => {
                      const isSent = friendRequestsSent[explorer.id];
                      return (
                        <div key={explorer.id} className="flex items-center justify-between gap-3">
                          <Link href={`/profile/${explorer.username}`} className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={
                                explorer.profileImageUrl ||
                                `https://api.dicebear.com/7.x/bottts/svg?seed=${explorer.username}`
                              }
                              alt={explorer.username}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-600 transition truncate">
                                {explorer.fullName || explorer.username}
                              </h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                                📍 {explorer.city || explorer.state || "Assam"}
                              </p>
                            </div>
                          </Link>

                          <button
                            onClick={(e) => handleSendFriendRequest(explorer.id, explorer.username, e)}
                            disabled={isSent}
                            className={`px-3 py-1 text-xs font-bold rounded-full transition cursor-pointer shrink-0 shadow-xs ${
                              isSent
                                ? "bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white"
                            }`}
                          >
                            {isSent ? "Sent ✓" : "+ Connect"}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* 2. Northeast News Highlights (Glossy) */}
            <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-1.5">
                  <span>📰</span>
                  <h3 className="font-extrabold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Trending News
                  </h3>
                </div>
                <Link
                  href="/news"
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  All News &rarr;
                </Link>
              </div>

              <div className="space-y-3">
                {latestNews.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    href={`/news/${item.id}`}
                    className="block group"
                  >
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 block">
                      {timeAgo(item.publishedDate || item.createdAt)} • {item.category || "News"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 3. Minimal Footer */}
            <div className="p-2 text-[11px] text-slate-500 space-y-2">
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <Link href="/" className="hover:text-slate-800 dark:hover:text-slate-300">Home</Link>
                <Link href="/news" className="hover:text-slate-800 dark:hover:text-slate-300">News</Link>
                <Link href="/directory" className="hover:text-slate-800 dark:hover:text-slate-300">Directory</Link>
                <Link href="/culture" className="hover:text-slate-800 dark:hover:text-slate-300">Culture</Link>
                <Link href="/wildlife" className="hover:text-slate-800 dark:hover:text-slate-300">Wildlife</Link>
                <Link href="/adventure" className="hover:text-slate-800 dark:hover:text-slate-300">Adventure</Link>
                <Link href="/marketplace" className="hover:text-slate-800 dark:hover:text-slate-300">Marketplace</Link>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
                <Link href="/contact" className="hover:text-slate-800 dark:hover:text-slate-300">Privacy Policy</Link>
                <Link href="/contact" className="hover:text-slate-800 dark:hover:text-slate-300">User Agreement</Link>
                <Link href="/contact" className="hover:text-slate-800 dark:hover:text-slate-300">Guidelines</Link>
              </div>
              <div className="pt-2 text-[10px] text-slate-400 dark:text-slate-600">
                North East Connect - A Brand of Webotapp Private Limited
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* "DISCOVER & JOIN ADDAS" MODAL                                             */}
      {/* ========================================================================= */}
      {showAddasModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddasModal(false);
          }}
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">
                  Discover Northeast Addas
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Join state communities, city groups, wildlife hubs, and topic addas.
                </p>
              </div>
              <button
                onClick={() => setShowAddasModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <input
                type="text"
                placeholder="Search addas (e.g. guwahati, food, travel, kaziranga)..."
                value={addaSearchQuery}
                onChange={(e) => setAddaSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* List */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {addasList
                .filter(
                  (a) =>
                    a.name.toLowerCase().includes(addaSearchQuery.toLowerCase()) ||
                    a.title.toLowerCase().includes(addaSearchQuery.toLowerCase()) ||
                    a.desc.toLowerCase().includes(addaSearchQuery.toLowerCase())
                )
                .map((adda) => {
                  const isJoined = joinedAddas.includes(adda.name);

                  return (
                    <div
                      key={adda.name}
                      className="p-4 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-4 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-xl shrink-0">
                          {adda.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                              {adda.name}
                            </h4>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              • {adda.count ? `${adda.count.toLocaleString()} members` : adda.tag} • {adda.state}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {adda.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            handleSelectAdda(adda.name);
                            setShowAddasModal(false);
                          }}
                          className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-full transition cursor-pointer"
                        >
                          Visit Feed
                        </button>
                        <button
                          onClick={(e) => handleToggleJoinAdda(adda.name, e)}
                          className={`px-4 py-1.5 text-xs font-bold rounded-full transition cursor-pointer shadow-xs ${
                            isJoined
                              ? "bg-emerald-600 hover:bg-rose-600 text-white"
                              : "bg-emerald-600 hover:bg-emerald-500 text-white"
                          }`}
                        >
                          {isJoined ? "Joined ✓" : "+ Join"}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        defaultTab="login"
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => fetchMe()}
      />

      {/* Global Repost to Platform Modal */}
      <RepostModal
        isOpen={repostModalOpen}
        post={repostModalPost}
        currentUser={currentUser}
        onClose={() => {
          setRepostModalOpen(false);
          setRepostModalPost(null);
        }}
        onRepostSuccess={(newPost) => {
          setPosts((prev) => [newPost, ...prev]);
          setToastMessage("Thought reposted to your feed! 🎉");
          setTimeout(() => setToastMessage(null), 3500);
        }}
      />
    </div>
  );
}
