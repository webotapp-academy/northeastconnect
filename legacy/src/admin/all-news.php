<?php
require __DIR__ . '/auth.php';
admin_require_auth();

$page_title = 'All News';
$active = 'all-news';

$pdo = db();
$messages = [];
$errors = [];

// Handle Delete
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'delete') {
        $id = $_POST['id'] ?? 0;
        if ($id) {
            try {
                $stmt = $pdo->prepare("DELETE FROM news WHERE id = ?");
                $stmt->execute([$id]);
                $messages[] = "News article deleted successfully.";
            } catch (PDOException $e) {
                $errors[] = "Error deleting article: " . $e->getMessage();
            }
        }
    } elseif ($_POST['action'] === 'update_status') {
        $id = $_POST['id'] ?? 0;
        $status = $_POST['status'] ?? 'Draft';
        if ($id) {
            try {
                $stmt = $pdo->prepare("UPDATE news SET status = ? WHERE id = ?");
                $stmt->execute([$status, $id]);
                $messages[] = "Article status updated successfully.";
            } catch (PDOException $e) {
                $errors[] = "Error updating status: " . $e->getMessage();
            }
        }
    }
}

// Pagination
$perPage = 20;
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$offset = ($page - 1) * $perPage;

// Filters
$source_filter = $_GET['source'] ?? ''; // 'ai' or 'manual'
$status_filter = $_GET['status'] ?? '';
$category_filter = $_GET['category'] ?? '';
$search = trim($_GET['s'] ?? '');

$where_conditions = [];
$params = [];

// Source filter (AI vs Manual)
if ($source_filter === 'ai') {
    $where_conditions[] = "(source LIKE '%Google News%' OR source LIKE '%Gemini%' OR source LIKE '%AI%')";
} elseif ($source_filter === 'manual') {
    $where_conditions[] = "(source NOT LIKE '%Google News%' AND source NOT LIKE '%Gemini%' AND source NOT LIKE '%AI%' OR source IS NULL OR source = '')";
}

if ($status_filter) {
    $where_conditions[] = "status = :status";
    $params[':status'] = $status_filter;
}

if ($category_filter) {
    $where_conditions[] = "category = :category";
    $params[':category'] = $category_filter;
}

if ($search) {
    $where_conditions[] = "(title LIKE :search OR content LIKE :search OR author LIKE :search)";
    $params[':search'] = "%$search%";
}

$where_clause = $where_conditions ? 'WHERE ' . implode(' AND ', $where_conditions) : '';

// Count total
$count_sql = "SELECT COUNT(*) FROM news $where_clause";
$count_stmt = $pdo->prepare($count_sql);
$count_stmt->execute($params);
$total = $count_stmt->fetchColumn();
$totalPages = (int)ceil($total / $perPage);

// Fetch news
$sql = "SELECT id, title, category, author, source, status, published_date, created_at 
        FROM news 
        $where_clause 
        ORDER BY created_at DESC, id DESC 
        LIMIT :limit OFFSET :offset";
$stmt = $pdo->prepare($sql);
foreach ($params as $k => $v) {
    $stmt->bindValue($k, $v);
}
$stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$news_items = $stmt->fetchAll();

// Get statistics
$stats = [
    'total' => $pdo->query("SELECT COUNT(*) FROM news")->fetchColumn(),
    'published' => $pdo->query("SELECT COUNT(*) FROM news WHERE status = 'Published'")->fetchColumn(),
    'draft' => $pdo->query("SELECT COUNT(*) FROM news WHERE status = 'Draft'")->fetchColumn(),
    'ai_generated' => $pdo->query("SELECT COUNT(*) FROM news WHERE source LIKE '%Google News%' OR source LIKE '%Gemini%' OR source LIKE '%AI%'")->fetchColumn(),
    'manual' => $pdo->query("SELECT COUNT(*) FROM news WHERE (source NOT LIKE '%Google News%' AND source NOT LIKE '%Gemini%' AND source NOT LIKE '%AI%') OR source IS NULL OR source = ''")->fetchColumn(),
];

// Get categories
$categories = $pdo->query("SELECT DISTINCT category FROM news WHERE category IS NOT NULL AND category != '' ORDER BY category")->fetchAll(PDO::FETCH_COLUMN);

function render_content() {
    global $news_items, $messages, $errors, $page, $totalPages, $search, $source_filter, $status_filter, $category_filter, $stats, $categories;
?>
    <style>
        .news-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 12px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: var(--panel);
            border: 2px solid var(--border);
            border-radius: 12px;
            padding: 14px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
        }
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .stat-card.active {
            border-color: var(--primary);
            background: rgba(37, 99, 235, 0.05);
        }
        .stat-card .label {
            font-size: 11px;
            color: var(--muted);
            text-transform: uppercase;
            margin-bottom: 6px;
        }
        .stat-card .value {
            font-size: 22px;
            font-weight: 700;
            color: var(--text);
        }
        
        .news-table-wrapper {
            width: 100%;
            overflow-x: auto;
        }
        .news-table-wrapper .table {
            min-width: 1000px;
        }
        
        .source-badge {
            padding: 3px 8px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .source-ai {
            background: #dbeafe;
            color: #1e40af;
        }
        .source-manual {
            background: #fef3c7;
            color: #92400e;
        }
        
        .status-badge {
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 600;
        }
        .status-published {
            background: #d1fae5;
            color: #065f46;
        }
        .status-draft {
            background: #e5e7eb;
            color: #374151;
        }
        
        .quick-actions {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
        }
        
        .filter-bar {
            background: var(--panel);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 20px;
        }
        
        .filter-row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr auto;
            gap: 10px;
            align-items: end;
        }
        
        @media (max-width: 768px) {
            .filter-row {
                grid-template-columns: 1fr;
            }
        }
    </style>

    <?php foreach ($messages as $m): ?><div class="alert" style="background:#d1fae5;color:#065f46;margin-bottom:12px;">✓ <?php echo htmlspecialchars($m); ?></div><?php endforeach; ?>
    <?php foreach ($errors as $e): ?><div class="alert" style="background:#fee2e2;color:#991b1b;margin-bottom:12px;">✗ <?php echo htmlspecialchars($e); ?></div><?php endforeach; ?>

    <!-- Stats Cards -->
    <div class="news-stats">
        <div class="stat-card">
            <div class="label">Total Articles</div>
            <div class="value"><?php echo $stats['total']; ?></div>
        </div>
        <div class="stat-card">
            <div class="label">Published</div>
            <div class="value"><?php echo $stats['published']; ?></div>
        </div>
        <div class="stat-card">
            <div class="label">Drafts</div>
            <div class="value"><?php echo $stats['draft']; ?></div>
        </div>
        <div class="stat-card">
            <div class="label">AI Generated</div>
            <div class="value"><?php echo $stats['ai_generated']; ?></div>
        </div>
        <div class="stat-card">
            <div class="label">Manual</div>
            <div class="value"><?php echo $stats['manual']; ?></div>
        </div>
    </div>

    <!-- Action Buttons -->
    <div style="margin-bottom:20px;display:flex;gap:10px;flex-wrap:wrap;">
        <a href="news-add.php" class="btn">✍️ Write New Article</a>
        <a href="news.php" class="btn outline">🤖 Generate from RSS</a>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
        <form method="get">
            <div class="filter-row">
                <div>
                    <label class="label">Search</label>
                    <input type="text" name="s" placeholder="Search title, content, author..." value="<?= htmlspecialchars($search) ?>" class="input"/>
                </div>
                <div>
                    <label class="label">Source</label>
                    <select name="source" class="select">
                        <option value="">All Sources</option>
                        <option value="ai" <?= $source_filter === 'ai' ? 'selected' : '' ?>>AI Generated</option>
                        <option value="manual" <?= $source_filter === 'manual' ? 'selected' : '' ?>>Manual</option>
                    </select>
                </div>
                <div>
                    <label class="label">Status</label>
                    <select name="status" class="select">
                        <option value="">All Status</option>
                        <option value="Published" <?= $status_filter === 'Published' ? 'selected' : '' ?>>Published</option>
                        <option value="Draft" <?= $status_filter === 'Draft' ? 'selected' : '' ?>>Draft</option>
                    </select>
                </div>
                <div>
                    <label class="label">Category</label>
                    <select name="category" class="select">
                        <option value="">All Categories</option>
                        <?php foreach ($categories as $cat): ?>
                            <option value="<?= htmlspecialchars($cat) ?>" <?= $category_filter === $cat ? 'selected' : '' ?>>
                                <?= htmlspecialchars($cat) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div>
                    <button type="submit" class="btn">Filter</button>
                    <?php if ($search || $source_filter || $status_filter || $category_filter): ?>
                        <a href="all-news.php" class="btn outline" style="margin-top:4px;">Clear</a>
                    <?php endif; ?>
                </div>
            </div>
        </form>
    </div>

    <!-- News Table -->
    <div class="panel news-table-wrapper">
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Author</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Published</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($news_items)): ?>
                    <tr><td colspan="8" style="text-align:center;padding:40px;color:var(--muted);">No news articles found.</td></tr>
                <?php else: ?>
                    <?php foreach ($news_items as $item): ?>
                        <?php
                            $is_ai = stripos($item['source'], 'Google News') !== false || 
                                     stripos($item['source'], 'Gemini') !== false || 
                                     stripos($item['source'], 'AI') !== false;
                        ?>
                        <tr>
                            <td><?= $item['id'] ?></td>
                            <td>
                                <strong><?= htmlspecialchars(substr($item['title'], 0, 60)) ?><?= strlen($item['title']) > 60 ? '...' : '' ?></strong>
                            </td>
                            <td><?= htmlspecialchars($item['category'] ?? '-') ?></td>
                            <td><?= htmlspecialchars($item['author'] ?? '-') ?></td>
                            <td>
                                <span class="source-badge <?= $is_ai ? 'source-ai' : 'source-manual' ?>">
                                    <?= $is_ai ? '🤖 AI' : '✍️ Manual' ?>
                                </span>
                            </td>
                            <td>
                                <span class="status-badge status-<?= strtolower($item['status']) ?>">
                                    <?= htmlspecialchars($item['status']) ?>
                                </span>
                            </td>
                            <td style="white-space:nowrap;">
                                <?= $item['published_date'] ? date('d M Y', strtotime($item['published_date'])) : '-' ?>
                            </td>
                            <td>
                                <div class="quick-actions">
                                    <a href="news-add.php?id=<?= $item['id'] ?>" class="btn outline sm">Edit</a>
                                    <?php if ($item['status'] === 'Draft'): ?>
                                        <form method="post" style="display:inline;">
                                            <input type="hidden" name="action" value="update_status">
                                            <input type="hidden" name="id" value="<?= $item['id'] ?>">
                                            <input type="hidden" name="status" value="Published">
                                            <button type="submit" class="btn sm" style="background:#10b981;">Publish</button>
                                        </form>
                                    <?php else: ?>
                                        <form method="post" style="display:inline;">
                                            <input type="hidden" name="action" value="update_status">
                                            <input type="hidden" name="id" value="<?= $item['id'] ?>">
                                            <input type="hidden" name="status" value="Draft">
                                            <button type="submit" class="btn outline sm">Unpublish</button>
                                        </form>
                                    <?php endif; ?>
                                    <form method="post" style="display:inline;" onsubmit="return confirm('Delete this article?');">
                                        <input type="hidden" name="action" value="delete">
                                        <input type="hidden" name="id" value="<?= $item['id'] ?>">
                                        <button type="submit" class="btn outline danger sm">Delete</button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    <?php if ($totalPages > 1): ?>
        <div style="margin-top:18px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">
            <?php if ($page > 1): ?>
                <a class="btn outline" href="?<?= http_build_query(['page' => $page-1, 's' => $search, 'source' => $source_filter, 'status' => $status_filter, 'category' => $category_filter]) ?>">Prev</a>
            <?php endif; ?>
            <?php 
            $start = max(1, $page - 2);
            $end = min($totalPages, $page + 2);
            for ($i = $start; $i <= $end; $i++): 
            ?>
                <a class="btn <?= $i == $page ? '' : 'outline' ?>" href="?<?= http_build_query(['page' => $i, 's' => $search, 'source' => $source_filter, 'status' => $status_filter, 'category' => $category_filter]) ?>"><?= $i ?></a>
            <?php endfor; ?>
            <?php if ($page < $totalPages): ?>
                <a class="btn outline" href="?<?= http_build_query(['page' => $page+1, 's' => $search, 'source' => $source_filter, 'status' => $status_filter, 'category' => $category_filter]) ?>">Next</a>
            <?php endif; ?>
        </div>
    <?php endif; ?>
<?php
}

include __DIR__ . '/partials/layout.php';
?>
