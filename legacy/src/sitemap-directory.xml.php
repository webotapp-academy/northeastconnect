<?php
require __DIR__ . '/config.php';

header('Content-Type: application/xml; charset=UTF-8');
// Basic caching (10 minutes)
header('Cache-Control: max-age=600, public');

echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
$host = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'];

// Fetch latest active directory listings
$rows = [];
try {
  $stmt = $pdo->query("SELECT * FROM directory WHERE status='Active' ORDER BY id DESC LIMIT 5000");
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

// Helper to generate clean slug
function generateSlug($name, $id) {
  // Remove special characters, convert to lowercase, replace spaces with hyphens
  $slug = preg_replace('/[^a-z0-9\s]/', '', strtolower($name));
  $slug = str_replace(' ', '-', trim($slug));
  return $slug . '-' . $id;
}

?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<?php foreach ($rows as $r):
  $slug = generateSlug($r['business_name'], $r['id']);
  
  // Generate single URL format
  $loc = $host . '/listing/' . rawurlencode($slug);

  $lastmod = fmtDate($r['updated_at'] ?? $r['created_at'] ?? '');
?>
  <url>
    <loc><?= htmlspecialchars($loc, ENT_XML1 | ENT_QUOTES, 'UTF-8') ?></loc>
    <lastmod><?= htmlspecialchars($lastmod, ENT_XML1 | ENT_QUOTES, 'UTF-8') ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
<?php endforeach; ?>
</urlset>
