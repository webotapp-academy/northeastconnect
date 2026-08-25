import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getRankFromXp } from "@/lib/gamification";
import { MASTER_ADDAS } from "@/lib/addas";
import RankBadge from "@/components/profile/RankBadge";
import CommentSection from "@/components/comments/CommentSection";
import PostMediaCarousel from "@/components/common/PostMediaCarousel";
import PostReactionsBar from "@/components/community/PostReactionsBar";
import ShareButton from "@/components/common/ShareButton";
import { renderRichPostContent } from "@/lib/postFormatting";
import PostLinkPreview from "@/components/common/PostLinkPreview";
import { parseEntityId, getCommunityPostSlugUrl } from "@/lib/slugs";

interface PageProps {
  params: Promise<{ id: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const postId = parseEntityId(id);
  if (!postId) return { title: "Post Not Found | NorthEast Connect" };

  const post = await db.communityPost.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: { username: true, fullName: true },
      },
    },
  });

  if (!post) return { title: "Post Not Found | NorthEast Connect" };

  const authorName = post.user.fullName || `@${post.user.username}`;
  const excerpt = post.content.slice(0, 150).replace(/\n/g, " ");
  const addaTag = post.taggedLocation || "community";
  const canonicalUrl = `${siteUrl}${getCommunityPostSlugUrl(post)}`;

  return {
    title: `${authorName} on ${addaTag}: "${excerpt}" | NorthEast Connect`,
    description: post.content.slice(0, 200),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${authorName} on NorthEast Connect`,
      description: excerpt,
      url: canonicalUrl,
      type: "article",
      images: post.mediaUrls ? post.mediaUrls.split(",")[0] : undefined,
    },
  };
}

export default async function SingleCommunityPostPage({ params }: PageProps) {
  const { id } = await params;
  const postId = parseEntityId(id);
  if (!postId) notFound();

  const [post, currentUser] = await Promise.all([
    db.communityPost.findUnique({
      where: { id: postId, status: "Active" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImageUrl: true,
            rankTier: true,
            xpPoints: true,
            state: true,
            city: true,
            bio: true,
          },
        },
        originalPost: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profileImageUrl: true,
                rankTier: true,
                xpPoints: true,
              },
            },
          },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!post) notFound();

  // Fetch comments count & user reaction
  const [commentCount, userReaction] = await Promise.all([
    db.universalComment.count({
      where: { entityType: "post", entityId: postId, status: "Active" },
    }),
    currentUser
      ? (db as any).postReaction.findUnique({
          where: {
            postId_userId: {
              postId,
              userId: currentUser.id,
            },
          },
          select: { type: true },
        })
      : null,
  ]);

  const authorRank = getRankFromXp(post.user.xpPoints || 0);

  // Find Adda metadata
  const addaName = post.taggedLocation || "n:community";
  const cleanAdda = addaName.replace(/^n:/, "").toLowerCase();
  const addaDef = MASTER_ADDAS.find(
    (a) => a.id === cleanAdda || a.name.toLowerCase() === addaName.toLowerCase()
  );

  const postSlugUrl = getCommunityPostSlugUrl(post);
  const fullPostUrl = `${siteUrl}${postSlugUrl}`;

  const jsonLdDiscussion = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: post.content.slice(0, 110),
    text: post.content,
    url: fullPostUrl,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.user.fullName || `@${post.user.username}`,
      url: `${siteUrl}/profile/${post.user.username}`,
    },
    interactionStatistic: [
      { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: post.likesCount },
      { "@type": "InteractionCounter", interactionType: "https://schema.org/CommentAction", userInteractionCount: commentCount },
    ],
    publisher: {
      "@type": "Organization",
      name: "North East Connect",
      logo: { "@type": "ImageObject", url: `${siteUrl}/assets/images/logo.png` },
    },
    isPartOf: addaDef
      ? { "@type": "CollectionPage", name: addaDef.title, url: `${siteUrl}/addas/${addaDef.id}` }
      : { "@type": "WebSite", name: "North East Connect", url: siteUrl },
  };

  // Helper to render markdown formatting, hashtags and mentions
  function renderContent(content: string) {
    return renderRichPostContent(content);
  }

  function formatTimeAgo(date: Date) {
    const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 pt-4 sm:pt-6 pb-24 px-3 sm:px-6 transition-colors">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdDiscussion) }} />
      {/* Canonical Slug Sync for Browser Address Bar */}
      <script
        dangerouslySetInnerHTML={{
          __html: `if (typeof window !== 'undefined' && window.location.pathname === '/community/${post.id}') { window.history.replaceState(null, '', '${postSlugUrl}'); }`,
        }}
      />
      <div className="container mx-auto max-w-5xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4 overflow-x-auto whitespace-nowrap py-1">
          <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/#community" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
            Community
          </Link>
          <span>/</span>
          <Link
            href={addaDef ? `/addas/${addaDef.id}` : `/?adda=${encodeURIComponent(addaName)}`}
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {addaName}
          </Link>
          <span>/</span>
          <span className="text-slate-400 dark:text-slate-500 truncate max-w-[180px]">
            Post #{postId}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* MAIN COLUMN: Reddit-style Post Card & Comments */}
          <main className="lg:col-span-8 space-y-6">
            <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm">
              {/* Post Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Link href={`/profile/${post.user.username}`} className="shrink-0 group">
                    <img
                      src={
                        post.user.profileImageUrl ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${post.user.username}`
                      }
                      alt={post.user.username}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition"
                    />
                  </Link>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link
                        href={addaDef ? `/addas/${addaDef.id}` : `/?adda=${encodeURIComponent(addaName)}`}
                        className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        {addaName}
                      </Link>
                      <span className="text-slate-400 dark:text-slate-600">•</span>
                      <Link
                        href={`/profile/${post.user.username}`}
                        className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 hover:underline truncate"
                      >
                        u/{post.user.username}
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{formatTimeAgo(post.createdAt)}</span>
                      {post.user.state && (
                        <>
                          <span>•</span>
                          <span>📍 {post.user.state}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Author Rank Badge */}
                <div className="shrink-0 hidden sm:block">
                  <RankBadge
                    rankTier={post.user.rankTier}
                    xpPoints={post.user.xpPoints}
                    size="sm"
                    showLevel={false}
                  />
                </div>
              </div>

              {/* Post Content */}
              <div className="text-slate-900 dark:text-slate-100 text-base sm:text-lg font-medium leading-relaxed whitespace-pre-wrap mb-4">
                {renderContent(post.content)}
              </div>

              {/* Link Previews (Facebook-Style & YouTube) */}
              <PostLinkPreview content={post.content} />

              {/* Embedded Repost Preview */}
              {post.originalPost && (
                <div className="mb-4 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 bg-slate-100/90 dark:bg-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/profile/${post.originalPost.user?.username}`}
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
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 line-clamp-3 leading-relaxed">
                      {post.originalPost.content}
                    </p>
                  </Link>

                  {post.originalPost.mediaUrls && (
                    <PostMediaCarousel mediaUrls={post.originalPost.mediaUrls} />
                  )}
                </div>
              )}

              {/* Media Carousel Attachment */}
              {post.mediaUrls && (
                <div className="mb-4">
                  <PostMediaCarousel mediaUrls={post.mediaUrls} />
                </div>
              )}

              {/* Reactions & Action Bar */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                <PostReactionsBar
                  postId={post.id}
                  initialLikesCount={post.likesCount || 0}
                  initialUserReaction={userReaction?.type || null}
                  currentUser={currentUser}
                />

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    💬 {commentCount} {commentCount === 1 ? "Thought" : "Thoughts"}
                  </span>
                  <ShareButton
                    url={postSlugUrl}
                    title={`Thought by u/${post.user.username} on NorthEast Connect`}
                    text={post.content.slice(0, 100)}
                  />
                </div>
              </div>
            </article>

            {/* Comments Thread Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span>💬</span> Discussion & Community Thoughts
              </h2>
              <CommentSection
                entityType="post"
                entityId={post.id}
                entityTitle={`Post by @${post.user.username}`}
                entityUrl={postSlugUrl}
                hideHeader={true}
              />
            </div>
          </main>

          {/* SIDEBAR: Adda Details & Author Info */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Adda Info Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-2xl">{addaDef?.icon || "🏙️"}</span>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {addaDef?.title || addaName}
                  </h3>
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {addaName}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {addaDef?.desc || "Regional community hub for local discussions, road trips, culture, and events."}
              </p>
              <Link
                href={addaDef ? `/addas/${addaDef.id}` : `/?adda=${encodeURIComponent(addaName)}`}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold text-center block transition shadow-xs"
              >
                View all in {addaName} &rarr;
              </Link>
            </div>

            {/* Author Profile Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">
                About the Author
              </span>
              <div className="flex items-center gap-3 mb-3">
                <Link href={`/profile/${post.user.username}`}>
                  <img
                    src={
                      post.user.profileImageUrl ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${post.user.username}`
                    }
                    alt={post.user.username}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                </Link>
                <div className="min-w-0">
                  <Link
                    href={`/profile/${post.user.username}`}
                    className="font-extrabold text-sm text-slate-900 dark:text-slate-100 hover:underline block truncate"
                  >
                    {post.user.fullName || post.user.username}
                  </Link>
                  <p className="text-xs text-slate-500 font-mono">@{post.user.username}</p>
                </div>
              </div>

              {post.user.bio && (
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3 italic">
                  "{post.user.bio}"
                </p>
              )}

              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <span className="font-semibold">{post.user.rankTier}</span>
                <span className="font-bold text-amber-500 font-mono">{post.user.xpPoints || 0} XP</span>
              </div>

              <Link
                href={`/profile/${post.user.username}`}
                className="mt-3 w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold text-center block transition border border-slate-200/60 dark:border-slate-700/60"
              >
                View Full Profile
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
