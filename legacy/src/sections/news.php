<?php
// sections/news.php - Latest News section for homepage
// Assumes parent has required config.php to provide $pdo and includes header/footer.
if (!isset($pdo)) {
  require_once __DIR__ . '/../config.php';
}

try {
  $stmt = $pdo->prepare("SELECT id, title, url, category, content, image_urls, published_date FROM news WHERE status = 'Published' ORDER BY published_date DESC, id DESC LIMIT 3");
  $stmt->execute();
  $latestNews = $stmt->fetchAll();
} catch (Throwable $e) {
  $latestNews = [];
}
?>
<section class="section-news">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">Exclusive Updates</span>
      <h2>Latest News & Stories</h2>
      <p class="subtitle">Discover what’s happening across Assam right now</p>
    </div>

    <div class="news-grid deals-3">
      <?php if (!$latestNews): ?>
        <p style="grid-column: span 12; color:#6b7280;">No news available yet.</p>
      <?php else: ?>
        <?php foreach ($latestNews as $n):
          $img = '';
          if (!empty($n['image_urls'])) {
            $parts = explode(',', $n['image_urls']);
            $img = trim($parts[0]);
            
          }
          $href = '/news/' . urlencode($n['url'] ?: $n['id']);
          $excerpt = trim(strip_tags($n['content'] ?? ''));
          if (strlen($excerpt) > 140) { $excerpt = substr($excerpt, 0, 140) . '…'; }
        ?>
          <article class="news-card big">
            <?php if ($img): ?>
              <a href="<?php echo htmlspecialchars($href); ?>" aria-label="Open: <?php echo htmlspecialchars($n['title']); ?>">
                <img src="<?php echo htmlspecialchars($img); ?>" alt="<?php echo htmlspecialchars($n['title']); ?>" />
              </a>
            <?php endif; ?>
            <div class="body">
              <div class="meta"><?php echo htmlspecialchars($n['category']); ?> · <?php echo htmlspecialchars(date('M j, Y', strtotime($n['published_date'] ?? 'now'))); ?></div>
              <h3 class="title"><?php echo htmlspecialchars($n['title']); ?></h3>
              <p class="excerpt"><?php echo htmlspecialchars($excerpt); ?></p>
              <div class="actions">
                <a class="more" href="<?php echo htmlspecialchars($href); ?>">Read more →</a>
              </div>
            </div>
          </article>
        <?php endforeach; ?>
      <?php endif; ?>
    </div>
  </div>
</section>

<style>
  .section-news { width:100%; margin: 72px 0; }
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
</style>