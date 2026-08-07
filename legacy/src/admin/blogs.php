<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/auth.php';

$page_title = 'Blogs';
$active = 'blogs';

$blogs = [];
$error_message = '';
$success_message = '';

// Handle delete action
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete') {
    $blog_id = intval($_POST['blog_id']);
    try {
        $stmt = $pdo->prepare("DELETE FROM blogs WHERE id = ?");
        $stmt->execute([$blog_id]);
        $success_message = "Blog deleted successfully!";
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        $error_message = "Failed to delete blog.";
    }
}

try {
    // Fetch all blogs
    $stmt = $pdo->query("SELECT * FROM blogs ORDER BY created_at DESC");
    $blogs = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    $error_message = "Failed to fetch blogs.";
}

function render_content() {
    global $blogs, $error_message, $success_message;
    ?>
    <style>
        .blogs-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .blog-card {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
        }

        .blog-card:hover {
            box-shadow: 0 8px 16px rgba(0,0,0,0.15);
            transform: translateY(-4px);
        }

        .blog-card-image {
            width: 100%;
            height: 200px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            text-align: center;
            padding: 20px;
        }

        .blog-card-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .blog-card-content {
            padding: 20px;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        }

        .blog-card-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin: 0 0 8px 0;
            line-height: 1.4;
        }

        .blog-card-excerpt {
            font-size: 13px;
            color: #666;
            margin: 0 0 12px 0;
            flex-grow: 1;
            line-height: 1.5;
        }

        .blog-card-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #999;
            margin-bottom: 12px;
            flex-wrap: wrap;
            gap: 8px;
        }

        .blog-status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .blog-status.published {
            background: #d4edda;
            color: #155724;
        }

        .blog-status.draft {
            background: #fff3cd;
            color: #856404;
        }

        .blog-status.archived {
            background: #f8d7da;
            color: #721c24;
        }

        .blog-card-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #eee;
        }

        .blog-card-actions button,
        .blog-card-actions a {
            flex: 1;
            padding: 8px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            text-decoration: none;
            text-align: center;
            transition: all 0.3s ease;
        }

        .btn-edit {
            background: #007bff;
            color: white;
        }

        .btn-edit:hover {
            background: #0056b3;
        }

        .btn-delete {
            background: #dc3545;
            color: white;
            border: none;
        }

        .btn-delete:hover {
            background: #c82333;
        }

        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }

        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }

        .add-blog-btn {
            background: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 20px;
            transition: all 0.3s ease;
        }

        .add-blog-btn:hover {
            background: #218838;
        }

        .alert {
            padding: 12px 16px;
            border-radius: 4px;
            margin-bottom: 20px;
        }

        .alert-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .alert-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
    </style>

    <?php if ($success_message): ?>
        <div class="alert alert-success"><?= htmlspecialchars($success_message) ?></div>
    <?php endif; ?>

    <?php if ($error_message): ?>
        <div class="alert alert-error"><?= htmlspecialchars($error_message) ?></div>
    <?php endif; ?>

    <a href="/admin/blog-edit.php" class="add-blog-btn">+ Create New Blog</a>

    <?php if (empty($blogs)): ?>
            <div class="empty-state">
            <div class="empty-state-icon">📝</div>
            <h2>No blogs yet</h2>
            <p>Start creating your first blog post!</p>
            <a href="/admin/blog-edit.php" class="add-blog-btn" style="margin-top: 20px;">Create Blog</a>
        </div>
    <?php else: ?>
        <div class="blogs-container">
            <?php foreach ($blogs as $blog): ?>
                <div class="blog-card">
                    <div class="blog-card-image">
                        <?php if ($blog['featured_image']): ?>
                            <img src="<?= htmlspecialchars($blog['featured_image']) ?>" alt="<?= htmlspecialchars($blog['title']) ?>" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white hidden">📷 No Image</div>
                        <?php else: ?>
                            <span>📷 No Image</span>
                        <?php endif; ?>
                    </div>
                    <div class="blog-card-content">
                        <h3 class="blog-card-title"><?= htmlspecialchars($blog['title']) ?></h3>
                        <p class="blog-card-excerpt"><?php 
                        $excerpt = $blog['excerpt'] ?? $blog['content'];
                        $plain_text = strip_tags(html_entity_decode($excerpt, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
                        echo htmlspecialchars(substr($plain_text, 0, 100));
                        ?>...</p>
                        <div class="blog-card-meta">
                            <span class="blog-status <?= strtolower($blog['status']) ?>"><?= htmlspecialchars($blog['status']) ?></span>
                            <span><?= date('M d, Y', strtotime($blog['created_at'])) ?></span>
                            <span><?= $blog['views'] ?> views</span>
                        </div>
                        <div class="blog-card-actions">
                            <a href="/admin/blog-edit.php?id=<?= $blog['id'] ?>" class="btn-edit">Edit</a>
                            <form method="POST" style="flex: 1; margin: 0;" onsubmit="return confirm('Are you sure you want to delete this blog?');">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="blog_id" value="<?= $blog['id'] ?>">
                                <button type="submit" class="btn-delete" style="width: 100%;">Delete</button>
                            </form>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
    <?php
}

include __DIR__ . '/partials/layout.php';
?>
