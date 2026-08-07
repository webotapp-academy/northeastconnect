<?php
require __DIR__ . '/config.php';

// Pagination settings
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$itemsPerPage = 9; // 3 rows of 3 cards
$offset = ($page - 1) * $itemsPerPage;

try {
  // Count total published news
  $countStmt = $pdo->prepare("SELECT COUNT(*) FROM news WHERE status = 'Published'");
  $countStmt->execute();
  $totalNews = $countStmt->fetchColumn();
  $totalPages = ceil($totalNews / $itemsPerPage);

  // Fetch paginated news
  $stmt = $pdo->prepare("
    SELECT id, title, url, category, content, image_urls, published_date 
    FROM news 
    WHERE status = 'Published' 
    ORDER BY published_date DESC, id DESC 
    LIMIT :limit OFFSET :offset
  ");
  $stmt->bindValue(':limit', $itemsPerPage, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();
  $newsList = $stmt->fetchAll();
} catch (Throwable $e) {
  $newsList = [];
  $totalPages = 0;
  error_log("News page error: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>News • Discover Assam</title>
  <link rel="stylesheet" href="/assets/css/main.css">
  <style>
    /* Hero styles */
    .hero { position:relative; min-height: 50vh; display:flex; align-items:center; justify-content:center; }
    .hero .bg { position:absolute; inset:0; }
    .hero .bg img { width:100%; height:100%; object-fit:cover; display:block; filter: brightness(0.6); }
    .hero .overlay { position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,.4), rgba(0,0,0,.35)); }
    .hero .inner { position:relative; z-index:1; text-align:center; padding: 0 16px; max-width: 900px; }
    .hero h1 { margin:0 0 8px; color:#fff; font-size: clamp(32px, 6vw, 56px); font-weight:800; }
    .hero p { margin:0; color:#e5e7eb; font-size: clamp(14px, 2.2vw, 20px); }

    /* Shared news card styles (matched with sections/news.php) */
    .section-news { width:100%; margin: 48px 0; }
    .section-news .container { width:100%; max-width: 1280px; margin:0 auto; padding: 0 20px; }
    .section-header { text-align: center; margin-bottom: 28px; }
    .section-header .eyebrow { color:#16a34a; font-weight: 700; font-size:14px; letter-spacing:.04em; text-transform: uppercase; }
    .section-header h2 { margin: 8px 0 6px; font-size: clamp(26px, 5vw, 36px); font-weight:800; }
    .section-header .subtitle { margin:0; color:#6b7280; font-size: 16px; }

    .news-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 24px; }
    .news-grid.deals-3 > .news-card { grid-column: span 4; }
    .news-card { background:#fff; border:1px solid #e5e7eb; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 12px 28px rgba(0,0,0,.08); transition: transform .25s ease, box-shadow .25s ease; }
    .news-card:hover { transform: translateY(-6px); box-shadow: 0 20px 36px rgba(0,0,0,.10); }
    .news-card img { width:100%; height:240px; object-fit: cover; display:block; }
    .news-card .body { padding: 20px; display:flex; flex-direction:column; gap:14px; }
    .news-card .title { font-weight:800; font-size: 20px; line-height:1.3; margin:0; }
    .news-card .meta { color:#6b7280; font-size:13px; }
    .news-card .excerpt { color:#374151; font-size:15px; margin:0; }
    .news-card .actions { margin-top:auto; }
    .news-card a.more { display:inline-block; color:#2563eb; font-weight:700; text-decoration:none; padding: 10px 0; }
    .news-card a.more:hover { text-decoration: underline; }
    @media (max-width: 1024px) { .news-grid.deals-3 > .news-card { grid-column: span 6; } .section-news .container { padding: 0 16px; } }
    @media (max-width: 640px) { .news-grid.deals-3 > .news-card { grid-column: span 12; } .section-news .container { padding: 0 12px; } }

    /* Pagination Styles */
    .news-pagination { 
      margin-top: 32px; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
    }
    .pagination-controls {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .pagination-controls a {
      text-decoration: none;
      padding: 8px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      color: #374151;
      transition: all 0.3s ease;
    }
    .pagination-controls a:hover {
      background-color: #f3f4f6;
      border-color: #d1d5db;
    }
    .pagination-controls a.active {
      background-color: #2563eb;
      color: white;
      border-color: #2563eb;
    }
    .pagination-controls a.page-prev,
    .pagination-controls a.page-next {
      font-weight: bold;
    }
  </style>
</head>
<body>
  <?php if (file_exists(__DIR__ . '/includes/header.php')) { include __DIR__ . '/includes/header.php'; } ?>

  <header class="hero">
    <div class="bg">
      <img src="/assets/images/hero.jpg" alt="Assam News Hero">
    </div>
    <div class="overlay"></div>
    <div class="inner">
      <h1>Latest News</h1>
      <p>Stay informed about culture, tourism, and events across Assam.</p>
    </div>
  </header>

  <section class="section-news">
    <div class="container">
      <div class="section-header">
        <span class="eyebrow">Exclusive Updates</span>
        <h2>Latest News & Stories</h2>
        <p class="subtitle">Discover what's happening across Assam right now</p>
      </div>

      <div class="news-grid deals-3">
        <?php if (!$newsList): ?>
          <p style="grid-column: span 12; color:#6b7280;">No news available.</p>
        <?php else: ?>
          <?php foreach ($newsList as $n):
            $img = '';
            if (!empty($n['image_urls'])) {
              $parts = explode(',', $n['image_urls']);
              $img = trim($parts[0]);
              // Robust normalization same as sections/news.php
              if (!preg_match('#^https?://#i', $img)) {
                if (strpos($img, '/assets/images/news/') === 0) {
                  // as-is
                } elseif (strpos($img, '/assets/images/news/') === 0) {
                  $img = '' . $img;
                } elseif (strpos($img, 'assets/images/news/') === 0) {
                  $img = '/' . $img;
                } else {
                  $img = '/assets/images/news/' . ltrim($img, '/');
                }
              }
            }
            $news_slug = $n['url'] ?: $n['id'];
            $href = '/news/' . urlencode($news_slug);
            $excerpt = trim(strip_tags($n['content'] ?? ''));
            if (strlen($excerpt) > 140) { $excerpt = substr($excerpt, 0, 140) . '…'; }
          ?>
            <article class="news-card">
              <?php if ($img): ?>
                <a href="<?php echo htmlspecialchars($href); ?>" aria-label="Open: <?php echo htmlspecialchars($n['title']); ?>">
                  <img src="<?php echo htmlspecialchars($img); ?>" alt="<?php echo htmlspecialchars($n['title']); ?>" />
                </a>
              <?php endif; ?>
              <div class="body">
                <div class="meta"><?php echo htmlspecialchars($n['category']); ?> · <?php echo htmlspecialchars(date('M j, Y', strtotime($n['published_date'] ?? 'now'))); ?></div>
                <div class="title"><?php echo htmlspecialchars($n['title']); ?></div>
                <div class="excerpt"><?php echo htmlspecialchars($excerpt); ?></div>
                <div class="actions">
                  <a class="more" href="<?php echo htmlspecialchars($href); ?>">Read more →</a>
                </div>
              </div>
            </article>
          <?php endforeach; ?>
        <?php endif; ?>
      </div>

      <?php if ($totalPages > 1): ?>
        <div class="news-pagination">
          <div class="pagination-controls">
            <?php if ($page > 1): ?>
              <a href="?page=<?php echo $page - 1; ?>" class="page-prev">← Previous</a>
            <?php endif; ?>

            <?php 
            // Show page numbers
            $startPage = max(1, $page - 2);
            $endPage = min($totalPages, $page + 2);
            
            for ($i = $startPage; $i <= $endPage; $i++): ?>
              <a href="?page=<?php echo $i; ?>" class="page-num <?php echo $i == $page ? 'active' : ''; ?>">
                <?php echo $i; ?>
              </a>
            <?php endfor; ?>

            <?php if ($page < $totalPages): ?>
              <a href="?page=<?php echo $page + 1; ?>" class="page-next">Next →</a>
            <?php endif; ?>
          </div>
        </div>
      <?php endif; ?>
    </div>
  </section>

  <?php if (file_exists(__DIR__ . '/includes/footer.php')) { include __DIR__ . '/includes/footer.php'; } ?>
</body>
</html>