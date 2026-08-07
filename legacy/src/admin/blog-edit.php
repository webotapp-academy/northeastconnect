<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/auth.php';

$page_title = 'Edit Blog';
$active = 'blogs';

$blog_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if (!$blog_id) {
    $page_title = 'Create Blog';
}
$blog = [
    'id' => '',
    'title' => '',
    'slug' => '',
    'content' => '',
    'excerpt' => '',
    'author' => 'Admin',
    'featured_image' => '',
    'category' => '',
    'status' => 'Draft',
    'meta_description' => '',
    'meta_keywords' => ''
];
$error_message = '';
$success_message = '';

// Load existing blog if editing
if ($blog_id) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM blogs WHERE id = ?");
        $stmt->execute([$blog_id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($existing) {
            $blog = $existing;
            $page_title = 'Edit Blog: ' . $blog['title'];
        } else {
            $error_message = "Blog not found.";
        }
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        $error_message = "Failed to load blog.";
    }
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'] ?? '';
    $content = $_POST['content'] ?? '';
    $excerpt = $_POST['excerpt'] ?? '';
    $author = $_POST['author'] ?? 'Admin';
    $featured_image = $_POST['featured_image'] ?? '';
    $category = $_POST['category'] ?? '';
    $status = $_POST['status'] ?? 'Draft';
    $meta_description = $_POST['meta_description'] ?? '';
    $meta_keywords = $_POST['meta_keywords'] ?? '';

    if (!$title || !$content) {
        $error_message = "Title and content are required.";
    } else {
        // Generate slug from title
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title), '-'));

        try {
            if ($blog_id) {
                // Update existing blog
                $stmt = $pdo->prepare("
                    UPDATE blogs SET 
                        title = ?, 
                        slug = ?, 
                        content = ?, 
                        excerpt = ?, 
                        author = ?, 
                        featured_image = ?, 
                        category = ?, 
                        status = ?, 
                        meta_description = ?, 
                        meta_keywords = ?,
                        published_at = IF(? = 'Published' AND status != 'Published', NOW(), published_at)
                    WHERE id = ?
                ");
                $stmt->execute([$title, $slug, $content, $excerpt, $author, $featured_image, $category, $status, $meta_description, $meta_keywords, $status, $blog_id]);
                $success_message = "Blog updated successfully!";
            } else {
                // Create new blog
                $stmt = $pdo->prepare("
                    INSERT INTO blogs 
                        (title, slug, content, excerpt, author, featured_image, category, status, meta_description, meta_keywords, published_at)
                    VALUES 
                        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, IF(? = 'Published', NOW(), NULL))
                ");
                $stmt->execute([$title, $slug, $content, $excerpt, $author, $featured_image, $category, $status, $meta_description, $meta_keywords, $status]);
                $blog_id = $pdo->lastInsertId();
                $success_message = "Blog created successfully!";
            }

            // Reload blog data
            $stmt = $pdo->prepare("SELECT * FROM blogs WHERE id = ?");
            $stmt->execute([$blog_id]);
            $blog = $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            $error_message = "Failed to save blog: " . $e->getMessage();
        }
    }
}

function render_content() {
    global $blog, $error_message, $success_message, $blog_id;
    ?>
    <style>
        .blog-editor {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .form-group {
            margin-bottom: 24px;
        }

        .form-group label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #333;
        }

        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group input[type="url"],
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            font-family: inherit;
        }

        .form-group textarea {
            min-height: 300px;
            resize: vertical;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .button-group {
            display: flex;
            gap: 12px;
            margin-top: 30px;
            padding-top: 24px;
            border-top: 1px solid #eee;
        }

        .button-group button {
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
        }

        .btn-save {
            background: #28a745;
            color: white;
        }

        .btn-save:hover {
            background: #218838;
        }

        .btn-draft {
            background: #6c757d;
            color: white;
        }

        .btn-draft:hover {
            background: #5a6268;
        }

        .btn-cancel {
            background: white;
            color: #6c757d;
            border: 1px solid #ddd;
        }

        .btn-cancel:hover {
            background: #f8f9fa;
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

        .form-hint {
            font-size: 12px;
            color: #666;
            margin-top: 4px;
        }
    </style>

    <?php if ($success_message): ?>
        <div class="alert alert-success"><?= htmlspecialchars($success_message) ?></div>
    <?php endif; ?>

    <?php if ($error_message): ?>
        <div class="alert alert-error"><?= htmlspecialchars($error_message) ?></div>
    <?php endif; ?>

    <div class="blog-editor">
        <form method="POST">
            <div class="form-group">
                <label for="title">Blog Title *</label>
                <input 
                    type="text" 
                    id="title" 
                    name="title" 
                    value="<?= htmlspecialchars($blog['title']) ?>" 
                    placeholder="Enter blog title"
                    required
                >
                <div class="form-hint">The title will be used to generate a URL-friendly slug</div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="author">Author</label>
                    <input 
                        type="text" 
                        id="author" 
                        name="author" 
                        value="<?= htmlspecialchars($blog['author']) ?>" 
                        placeholder="Author name"
                    >
                </div>
                <div class="form-group">
                    <label for="category">Category</label>
                    <input 
                        type="text" 
                        id="category" 
                        name="category" 
                        value="<?= htmlspecialchars($blog['category']) ?>" 
                        placeholder="e.g., Travel, Culture, Tips"
                    >
                </div>
            </div>

            <div class="form-group">
                <label for="excerpt">Excerpt (Short Summary)</label>
                <textarea 
                    id="excerpt" 
                    name="excerpt" 
                    placeholder="Brief summary for listing page (optional)"
                    style="min-height: 80px;"
                ><?= htmlspecialchars($blog['excerpt']) ?></textarea>
                <div class="form-hint">If not provided, first 100 characters of content will be used</div>
            </div>

            <div class="form-group">
                <label for="featured_image">Featured Image URL</label>
                <input 
                    type="text" 
                    id="featured_image" 
                    name="featured_image" 
                    value="<?= htmlspecialchars($blog['featured_image']) ?>" 
                    placeholder="https://example.com/image.jpg"
                >
                <div class="form-hint">URL to the featured image for this blog post</div>
            </div>

            <div class="form-group">
                <label for="content">Blog Content *</label>
                <div id="editor" style="min-height: 400px; background: white; border: 1px solid #ddd; border-radius: 4px;"></div>
                <textarea 
                    id="content" 
                    name="content" 
                    style="display: none;"
                    required
                ><?= htmlspecialchars($blog['content']) ?></textarea>
                <div class="form-hint">Use the rich text editor above to format your content</div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="meta_description">Meta Description (SEO)</label>
                    <input 
                        type="text" 
                        id="meta_description" 
                        name="meta_description" 
                        value="<?= htmlspecialchars($blog['meta_description']) ?>" 
                        placeholder="Brief description for search engines (160 chars)"
                        maxlength="160"
                    >
                    <div class="form-hint">Character count: <?= strlen($blog['meta_description']) ?>/160</div>
                </div>
                <div class="form-group">
                    <label for="meta_keywords">Meta Keywords (SEO)</label>
                    <input 
                        type="text" 
                        id="meta_keywords" 
                        name="meta_keywords" 
                        value="<?= htmlspecialchars($blog['meta_keywords']) ?>" 
                        placeholder="Comma-separated keywords"
                    >
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="status">Status</label>
                    <select id="status" name="status">
                        <option value="Draft" <?= $blog['status'] === 'Draft' ? 'selected' : '' ?>>Draft</option>
                        <option value="Published" <?= $blog['status'] === 'Published' ? 'selected' : '' ?>>Published</option>
                        <option value="Archived" <?= $blog['status'] === 'Archived' ? 'selected' : '' ?>>Archived</option>
                    </select>
                </div>
            </div>

            <div class="button-group">
                <button type="submit" name="action" value="save" class="btn-save">
                    <?= $blog_id ? '✓ Update Blog' : '✓ Publish Blog' ?>
                </button>
                <button type="submit" name="status" value="Draft" class="btn-draft">Save as Draft</button>
                <a href="/admin/blogs.php" class="btn-cancel" style="text-decoration: none; display: flex; align-items: center;">Cancel</a>
            </div>
        </form>
    </div>

    <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
    <script>
        // Initialize Quill editor
        var quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'header': 1 }, { 'header': 2 }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'script': 'sub'}, { 'script': 'super' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    [{ 'size': ['small', false, 'large', 'huge'] }],
                    [{ 'header': [false, 1, 2, 3, 4, 5, 6] }],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'align': [] }],
                    ['link', 'image', 'video'],
                    ['clean']
                ]
            },
            placeholder: 'Write your blog content here...'
        });

        // Set initial content from textarea
        var contentField = document.getElementById('content');
        if (contentField.value) {
            // Decode HTML entities for proper display in editor
            var decodedContent = contentField.value
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#x27;/g, "'");
            quill.root.innerHTML = decodedContent;
        }

        // Before form submission, update the textarea with editor content
        document.querySelector('form').addEventListener('submit', function(e) {
            contentField.value = quill.root.innerHTML;
        });

        // Optional: Auto-save to textarea on changes
        quill.on('text-change', function() {
            contentField.value = quill.root.innerHTML;
        });
    </script>
    <?php
}

include __DIR__ . '/partials/layout.php';
?>
