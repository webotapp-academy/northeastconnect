<?php
require __DIR__ . '/config.php';

header('Content-Type: application/xml; charset=UTF-8');
// Basic caching (10 minutes)
header('Cache-Control: max-age=600, public');

echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
$host = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'];

// Fetch latest published news
$rows = [];
try {
  $stmt = $pdo->query("SELECT id, url, published_date FROM news WHERE status='Published' ORDER BY COALESCE( published_date) DESC, id DESC LIMIT 1000");
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $e) {
  $rows = [];
}

// Helper to format date
function fmtDate($d) {
  if (empty($d)) return date('c');
  $ts = strtotime($d);
  if ($ts === false) return date('c');
  return date('c', $ts);
}

?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<?php foreach ($rows as $r):
  $slug = trim($r['url'] ?? '');
  // Prefer pretty route /news/{slug} if slug available and looks valid
  if ($slug !== '') {
    $loc = $host . '/news/' . rawurlencode($slug);
  } else {
    $loc = $host . '/discoverassam/article.php?news=' . urlencode((string)($r['id'] ?? ''));
  }
  $lastmod = fmtDate($r['updated_at'] ?? $r['published_date'] ?? '');
?>
  <url>
    <loc><?= htmlspecialchars($loc, ENT_XML1 | ENT_QUOTES, 'UTF-8') ?></loc>
    <lastmod><?= htmlspecialchars($lastmod, ENT_XML1 | ENT_QUOTES, 'UTF-8') ?></lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
<?php endforeach; ?>
</urlset>