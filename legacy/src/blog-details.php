<?php
require_once 'config.php';

// Get blog ID from URL
$blog_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$blog = null;
$error_message = '';
$related_blogs = [];

try {
    // Fetch blog details
    $stmt = $pdo->prepare("SELECT * FROM blogs WHERE id = ? AND status = 'Published'");
    $stmt->execute([$blog_id]);
    $blog = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$blog) {
        $error_message = "Blog not found.";
    } else {
        // Increment views
        $stmt = $pdo->prepare("UPDATE blogs SET views = views + 1 WHERE id = ?");
        $stmt->execute([$blog_id]);

        // Fetch related blogs from same category
        if ($blog['category']) {
            $stmt = $pdo->prepare("
                SELECT id, title, slug, featured_image, category, published_at, views, excerpt, content
                FROM blogs 
                WHERE id != ? 
                AND category = ? 
                AND status = 'Published'
                ORDER BY published_at DESC
                LIMIT 3
            ");
            $stmt->execute([$blog_id, $blog['category']]);
            $related_blogs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    }
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    $error_message = "Failed to load blog.";
}

$site_title = $blog ? htmlspecialchars($blog['title']) : 'Blog';
require_once 'includes/header.php';
?>

<!-- Hero Section -->
<?php if ($blog): ?>
<header class="relative min-h-[60vh] flex items-center justify-center">
    <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-r from-purple-900 to-purple-600 opacity-80 z-10"></div>
        <?php if ($blog['featured_image']): ?>
            <img 
                src="<?= htmlspecialchars($blog['featured_image']) ?>" 
                alt="<?= htmlspecialchars($blog['title']) ?>"
                class="w-full h-full object-cover"
                onerror="this.style.display='none';"
            >
        <?php endif; ?>
    </div>

    <div class="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div class="mb-4">
            <?php if ($blog['category']): ?>
                <span class="inline-block px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-semibold">
                    <?= htmlspecialchars($blog['category']) ?>
                </span>
            <?php endif; ?>
        </div>
        <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            <?= htmlspecialchars($blog['title']) ?>
        </h1>
        <div class="flex justify-center items-center text-white/90 space-x-6 text-sm md:text-base">
            <span>📝 By <?= htmlspecialchars($blog['author']) ?></span>
            <span>📅 <?= date('M d, Y', strtotime($blog['published_at'])) ?></span>
            <span>👁️ <?= $blog['views'] ?> views</span>
        </div>
    </div>
</header>
<?php endif; ?>

<!-- Blog Content Section -->
<div class="bg-white py-16">
    <div class="container mx-auto px-4 max-w-4xl">
        <?php if ($error_message): ?>
            <div class="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8 text-center">
                <p><?= htmlspecialchars($error_message) ?></p>
                <a href="/blogs" class="inline-block mt-4 text-red-700 font-semibold hover:underline">← Back to Blogs</a>
            </div>
        <?php elseif ($blog): ?>
            <!-- Meta Information -->
            <div class="mb-12 pb-8 border-b border-gray-200">
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            <?= substr($blog['author'], 0, 1) ?>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-800"><?= htmlspecialchars($blog['author']) ?></p>
                            <p class="text-sm text-gray-600"><?= date('F d, Y', strtotime($blog['published_at'])) ?></p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-gray-600">Reading time: ~<?= ceil(str_word_count(strip_tags($blog['content'])) / 200) ?> min</p>
                    </div>
                </div>
            </div>

            <!-- Blog Content -->
            <article class="prose prose-lg max-w-none mb-12">
                <div class="blog-content text-gray-700 leading-relaxed">
                    <?php 
                    // Decode HTML entities and render content properly
                    $content = html_entity_decode($blog['content'], ENT_QUOTES | ENT_HTML5, 'UTF-8');
                    
                    // Basic XSS protection while allowing safe HTML tags
                    $allowed_tags = '<p><br><strong><b><em><i><u><h1><h2><h3><h4><h5><h6><ul><ol><li><blockquote><pre><code><a><img><table><thead><tbody><tr><th><td><span><div>';
                    $content = strip_tags($content, $allowed_tags);
                    
                    // Remove dangerous attributes
                    $content = preg_replace('/(<[^>]+)(\son\w+\s*=\s*["\'][^"\']*["\'])/i', '$1', $content);
                    $content = preg_replace('/(<[^>]+)(javascript:[^"\'>\s]*)/i', '$1', $content);
                    
                    echo $content;
                    ?>
                </div>
            </article>

            <!-- Share Section -->
            <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-8 mb-12">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Share this blog</h3>
                <div class="flex flex-wrap gap-4">
                    <a href="https://www.facebook.com/sharer/sharer.php?u=<?= urlencode('https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']) ?>" target="_blank" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        <span>f</span> Facebook
                    </a>
                    <a href="https://twitter.com/intent/tweet?url=<?= urlencode('https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']) ?>&text=<?= urlencode($blog['title']) ?>" target="_blank" class="inline-flex items-center px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition">
                        𝕏 Twitter
                    </a>
                    <a href="https://www.linkedin.com/sharing/share-offsite/?url=<?= urlencode('https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']) ?>" target="_blank" class="inline-flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition">
                        in LinkedIn
                    </a>
                    <a href="mailto:?subject=<?= urlencode($blog['title']) ?>&body=<?= urlencode('Check out this blog: https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']) ?>" class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
                        ✉️ Email
                    </a>
                </div>
            </div>

            <!-- Back to Blogs -->
            <div class="mb-12 pb-12 border-b border-gray-200">
                <a href="/blogs" class="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700 transition">
                    ← Back to all blogs
                </a>
            </div>

            <!-- Related Blogs -->
            <?php if (!empty($related_blogs)): ?>
                <div class="mt-16">
                    <h2 class="text-3xl font-bold text-gray-800 mb-8">Related Articles</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <?php foreach ($related_blogs as $related): ?>
                            <?php
                                $related_slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $related['title']), '-'));
                            ?>
                            <a href="/blog/<?= $related_slug . '-' . $related['id'] ?>" class="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all">
                                <div class="relative h-48 overflow-hidden bg-gradient-to-br from-purple-400 to-purple-600">
                                    <?php if ($related['featured_image']): ?>
                                        <img 
                                            src="<?= htmlspecialchars($related['featured_image']) ?>" 
                                            alt="<?= htmlspecialchars($related['title']) ?>"
                                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        >
                                    <?php endif; ?>
                                </div>
                                <div class="p-4">
                                    <h3 class="font-semibold text-gray-800 line-clamp-2 mb-2"><?= htmlspecialchars($related['title']) ?></h3>
                                    <p class="text-sm text-gray-600 line-clamp-1"><?= date('M d, Y', strtotime($related['published_at'])) ?></p>
                                </div>
                            </a>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endif; ?>

        <?php else: ?>
            <div class="text-center py-12">
                <div class="text-gray-400 text-6xl mb-4">📝</div>
                <p class="text-gray-600 text-xl">Blog not found.</p>
                <a href="/blogs" class="inline-block mt-4 text-purple-600 hover:text-purple-700">← Back to Blogs</a>
            </div>
        <?php endif; ?>
    </div>
</div>

<style>
    .blog-content {
        font-size: 18px;
        line-height: 1.8;
    }

    .blog-content h2 {
        font-size: 28px;
        font-weight: 700;
        margin: 32px 0 16px 0;
        color: #1f2937;
    }

    .blog-content h3 {
        font-size: 22px;
        font-weight: 600;
        margin: 24px 0 12px 0;
        color: #374151;
    }

    .blog-content p {
        margin-bottom: 16px;
    }

    .blog-content ul,
    .blog-content ol {
        margin-bottom: 16px;
        margin-left: 24px;
    }

    .blog-content li {
        margin-bottom: 8px;
    }

    .blog-content blockquote {
        border-left: 4px solid #9333ea;
        padding-left: 16px;
        margin: 24px 0;
        font-style: italic;
        color: #666;
    }

    .blog-content img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 24px 0;
    }

    .blog-content code {
        background: #f3f4f6;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        color: #dc2626;
    }

    .blog-content pre {
        background: #1f2937;
        color: #f3f4f6;
        padding: 16px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 24px 0;
    }

    .blog-content pre code {
        background: none;
        color: #f3f4f6;
        padding: 0;
    }
</style>

<?php require_once 'includes/footer.php'; ?>
