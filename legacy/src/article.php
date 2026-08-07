<?php
require __DIR__ . '/config.php';

// Resolve article by slug in `url` or numeric id via ?news=
$param = trim($_GET['news'] ?? '');
$article = null;

try {
  if ($param !== '') {
    if (ctype_digit($param)) {
      $stmt = $pdo->prepare("SELECT * FROM news WHERE id = :id AND status='Published' LIMIT 1");
      $stmt->execute([':id' => (int)$param]);
    } else {
      $stmt = $pdo->prepare("SELECT * FROM news WHERE url = :slug AND status='Published' LIMIT 1");
      $stmt->execute([':slug' => $param]);
    }
    $article = $stmt->fetch();
  }
} catch (Throwable $e) {}

if (!$article) {
  http_response_code(404);
  $article = [
    'title' => 'Article not found',
    'content' => '<p>Sorry, the article you are looking for does not exist.</p>',
    'category' => 'News',
    'published_date' => date('Y-m-d H:i:s'),
    'image_urls' => '',
    'tags' => '',
  ];
}

   
$firstImage = '';
if (!empty($article['image_urls'])) {
$parts = array_filter(array_map('trim', explode(',', $article['image_urls'])));
$firstImage = $parts[0] ?? '';
}
 

// Featured image (first of image_urls)
$featured = '';
 

// Build meta
$metaTitle = $article['title'] . ' • Discover Assam';
$plain = trim(strip_tags($article['content'] ?? ''));
$metaDesc = mb_substr($plain, 0, 160);
$metaImage = $featured ?: "$firstImage";

// Canonical URL (adjust if using pretty routes)
$host = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'];
$slugOrId = $article['url'] ?? ($param ?: ($article['id'] ?? ''));
$canonical = $host . '/news/' . urlencode($slugOrId);

// Prepare content: if no HTML paragraph tags, convert double newlines into paragraphs
$renderContent = $article['content'] ?? '';
if (!preg_match('/<\s*p\b/i', $renderContent)) {
  // Sanitize and convert newlines to paragraphs
  $text = str_replace(["\r\n", "\r"], "\n", $renderContent);
  $parts = array_filter(array_map('trim', preg_split('/\n{2,}/', $text)));
  if (!empty($parts)) {
    $html = '';
    foreach ($parts as $p) {
      // preserve single line breaks inside a paragraph
      $p = nl2br($p);
      $html .= '<p>' . $p . '</p>' . "\n";
    }
    $renderContent = $html;
  }
}

// Load more news (exclude current id)
$more = [];
try {
  $stmt = $pdo->prepare("SELECT id, title, url, category, image_urls, published_date, content FROM news WHERE status='Published' AND id <> :id ORDER BY published_date DESC, id DESC LIMIT 6");
  $stmt->execute([':id' => (int)($article['id'] ?? 0)]);
  $more = $stmt->fetchAll();
} catch (Throwable $e) {}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?php echo htmlspecialchars($metaTitle); ?></title>
  <meta name="description" content="<?php echo htmlspecialchars($metaDesc); ?>" />
  <meta property="og:title" content="<?php echo htmlspecialchars($metaTitle); ?>" />
  <meta property="og:description" content="<?php echo htmlspecialchars($metaDesc); ?>" />
  <meta property="og:image" content="<?php echo htmlspecialchars($metaImage); ?>" />
  <link rel="stylesheet" href="/discoverassam/assets/css/main.css" />
  <style>
    .article { width:100%; max-width: 940px; margin: 24px auto; padding: 0 16px; }
    .header { margin: 24px 0; }
    .header .meta { color:#6b7280; font-size:14px; }
    .header h1 { margin:6px 0 0; color:#111827; font-size: clamp(26px, 5.5vw, 40px); font-weight:800; }
    .hero { position:relative; min-height: 15vh; display:flex; align-items:center; justify-content:center; }
    .hero .bg { position:absolute; inset:0; }
    .hero .bg img { width:100%; height:100%; object-fit:cover; display:block; filter: brightness(0.6); }
    .hero .overlay { position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,.4), rgba(0,0,0,.85)); }
    .hero .inner { position:relative; z-index:1; text-align:center; padding: 0 16px; max-width: 900px; }
    .hero h1 { margin:0 0 8px; color:#fff; font-size: clamp(32px, 6vw, 46px); font-weight:800; }
    .hero p { margin:0; color:#e5e7eb; font-size: clamp(14px, 2.2vw, 20px); }

    .content { margin: 20px 0; color:#111827; line-height:1.75; font-size:18px; }
    .content p { margin: 0 0 16px; }
    .content p + p { margin-top: 8px; }
    .content h2, .content h3 { margin-top: 20px; }
    .content ul { padding-left: 20px; margin: 12px 0 16px; }
    
    .share { display:flex; gap:10px; align-items:center; margin: 18px 0 26px; flex-wrap:wrap; }
    .share .label { color:#6b7280; font-size:14px; margin-right:6px; }
    .share a, .share button { display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:9999px; border:1px solid #e5e7eb; background:#fff; cursor:pointer; transition: box-shadow .2s, transform .05s; }
    .share a:hover, .share button:hover { box-shadow: 0 8px 20px rgba(0,0,0,.08); transform: translateY(-1px); }
    .share svg { width:18px; height:18px; }
    .share .copy-status { font-size:12px; color:#16a34a; margin-left:8px; display:none; }


    .ad { width:100%; background:#f3f4f6; border:1px dashed #d1d5db; color:#6b7280; border-radius: 12px; text-align:center; padding: 18px; margin: 18px 0; }

    .more-section { width:100%; margin: 48px 0; }
    .more-section .container { width:100%; max-width: 1100px; margin:0 auto; padding: 0 16px; }
    .more-header { text-align:center; margin-bottom: 16px; }
    .more-header .eyebrow { color:#16a34a; font-weight:700; letter-spacing:.04em; text-transform: uppercase; }
    .more-header h2 { margin:6px 0; font-size: clamp(22px, 4.5vw, 32px); font-weight:800; }

    .news-grid { display:grid; grid-template-columns: repeat(12, 1fr); gap: 20px; }
    .news-card { grid-column: span 4; background:#fff; border:1px solid #e5e7eb; border-radius: 16px; overflow: hidden; display:flex; flex-direction:column; box-shadow: 0 10px 24px rgba(0,0,0,.06); }
    .news-card img { width:100%; height: 200px; object-fit: cover; display:block; }
    .news-card .body { padding: 14px; display:flex; flex-direction:column; gap:10px; }
    .news-card .title { font-weight:800; font-size: 18px; line-height:1.25; margin:0; }
    .news-card .meta { color:#6b7280; font-size:12px; }
    .news-card .excerpt { color:#374151; font-size:14px; margin:0; }
    .news-card .actions { margin-top:auto; }
    .news-card a.more { display:inline-block; color:#2563eb; font-weight:600; text-decoration:none; }
    @media (max-width:640px){ .news-card{ grid-column: span 12; } }
  </style>
  
  <script async type="application/javascript"
        src="https://news.google.com/swg/js/v1/swg-basic.js"></script>
<script>
  (self.SWG_BASIC = self.SWG_BASIC || []).push( basicSubscriptions => {
    basicSubscriptions.init({
      type: "NewsArticle",
      isPartOfType: ["Product"],
      isPartOfProductId: "CAowqcy9DA:openaccess",
      clientOptions: { theme: "light", lang: "en-GB" },
    });
  });
</script>
  
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9957106792444386"
     crossorigin="anonymous"></script>
     
     
     
     
     <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-N02BLD55G8"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-N02BLD55G8');
</script>
</head>
<body>
  <?php if (file_exists(__DIR__ . '/includes/header.php')) { include __DIR__ . '/includes/header.php'; } ?>
  <header class="hero">
    <div class="bg">
      <img src="/assets/images/hero.jpg" alt="Assam News Hero">
    </div>
    <div class="overlay"></div>
     
</header>
  <main class="article">

  <!--
    <header class="header">
      <div class="meta"><?php echo htmlspecialchars(date('Y-m-d', strtotime($article['published_date'] ?? 'now'))); ?> · <?php echo htmlspecialchars($article['category'] ?? 'News'); ?></div>
      <h1><?php echo htmlspecialchars($article['title']); ?></h1>
    </header>
    -->
    <div class="">
     

<?php if ($firstImage): ?>
<img src="<?php echo htmlspecialchars($firstImage); ?>" alt="<?php echo htmlspecialchars($article['title'] ?? ''); ?>">
<?php endif; ?>
    </div>
    
    <div class="share">
      <span class="label">Share:</span>
      <a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo urlencode($canonical); ?>" target="_blank" rel="noopener" aria-label="Share on Facebook" title="Share on Facebook">
        <svg viewBox="0 0 24 24" fill="#1877F2"><path d="M22 12.07C22 6.48 17.52 2 11.93 2 6.35 2 1.86 6.48 1.86 12.07c0 4.97 3.64 9.09 8.39 9.93v-7.02H7.9v-2.9h2.36V9.41c0-2.33 1.39-3.62 3.52-3.62 1.02 0 2.08.18 2.08.18v2.29h-1.17c-1.15 0-1.51.72-1.51 1.46v1.75h2.57l-.41 2.9h-2.16V22c4.75-.84 8.39-4.96 8.39-9.93z"/></svg>
      </a>
      <a href="https://twitter.com/intent/tweet?url=<?php echo urlencode($canonical); ?>&text=<?php echo urlencode($article['title']); ?>" target="_blank" rel="noopener" aria-label="Share on X" title="Share on X (Twitter)">
        <svg viewBox="0 0 24 24" fill="#000"><path d="M18.244 2H21.5l-7.5 8.565L22.5 22h-7.373l-5.367-6.234L3.5 22H.244l8.258-9.43L.5 2h7.5l4.843 5.616L18.244 2zm-1.292 18h2.053L7.123 4h-2.05L16.952 20z"/></svg>
      </a>
      <a href="https://api.whatsapp.com/send?text=<?php echo urlencode(($article['title'] ?? '') . ' ' . $canonical); ?>" target="_blank" rel="noopener" aria-label="Share on WhatsApp" title="Share on WhatsApp">
        <svg viewBox="0 0 24 24" fill="#25D366"><path d="M20.52 3.48A11.79 11.79 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.09 1.52 5.81L0 24l6.34-1.66A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.21-1.3-6.11-3.48-8.52zM12 21.82c-1.91 0-3.68-.55-5.17-1.5l-.37-.22-3.77.99 1.01-3.67-.24-.38A9.82 9.82 0 1 1 12 21.82zm5.67-7.5c-.31-.15-1.82-.9-2.1-1-.28-.1-.49-.15-.7.15-.2.31-.8 1-.98 1.2-.18.2-.36.22-.67.08-.31-.15-1.3-.48-2.47-1.53-.91-.81-1.52-1.8-1.7-2.1-.18-.31-.02-.48.13-.63.13-.13.31-.36.46-.54.15-.18.2-.31.31-.51.1-.2.05-.38-.02-.53-.07-.15-.7-1.67-.96-2.29-.25-.6-.51-.52-.7-.53h-.6c-.2 0-.53.08-.82.38-.28.31-1.07 1.04-1.07 2.54 0 1.49 1.1 2.93 1.25 3.12.15.2 2.17 3.31 5.26 4.64.74.32 1.31.51 1.76.65.74.24 1.42.2 1.96.12.6-.09 1.82-.74 2.08-1.46.26-.72.26-1.34.18-1.46-.08-.12-.28-.2-.58-.35z"/></svg>
      </a>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=<?php echo urlencode($canonical); ?>" target="_blank" rel="noopener" aria-label="Share on LinkedIn" title="Share on LinkedIn">
        <svg viewBox="0 0 24 24" fill="#0A66C2"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V24h-4V8.5zM8.5 8.5h3.83v2.11h.05c.53-1 1.83-2.11 3.77-2.11 4.03 0 4.78 2.65 4.78 6.1V24h-4V15.5c0-2.02-.04-4.63-2.82-4.63-2.83 0-3.26 2.21-3.26 4.49V24h-4V8.5z"/></svg>
      </a>
      <button type="button" id="copy-link" aria-label="Copy link" title="Copy link">
        <svg viewBox="0 0 24 24" fill="#111827"><path d="M3.9 12a4.1 4.1 0 0 1 4.1-4.1h3v2h-3A2.1 2.1 0 0 0 5.9 12a2.1 2.1 0 0 0 2.1 2.1h3v2h-3A4.1 4.1 0 0 1 3.9 12zm7-1h3a2.1 2.1 0 1 1 0 4.2h-3v2h3a4.1 4.1 0 0 0 0-8.2h-3v2z"/></svg>
      </button>
      <span id="copy-status" class="copy-status">Copied!</span>
    </div>

    <div class="ad">Ad Placeholder (728x90)</div>

    <article class="content">
        <p style="font-size:10px"><?php echo htmlspecialchars(date('Y-m-d', strtotime($article['published_date'] ?? 'now'))); ?> · <?php echo htmlspecialchars($article['category'] ?? 'News'); ?></p>
    
      <?php echo $renderContent; ?>
    </article>
    
    <div class="share">
      <span class="label">Share:</span>
      <a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo urlencode($canonical); ?>" target="_blank" rel="noopener" aria-label="Share on Facebook" title="Share on Facebook">
        <svg viewBox="0 0 24 24" fill="#1877F2"><path d="M22 12.07C22 6.48 17.52 2 11.93 2 6.35 2 1.86 6.48 1.86 12.07c0 4.97 3.64 9.09 8.39 9.93v-7.02H7.9v-2.9h2.36V9.41c0-2.33 1.39-3.62 3.52-3.62 1.02 0 2.08.18 2.08.18v2.29h-1.17c-1.15 0-1.51.72-1.51 1.46v1.75h2.57l-.41 2.9h-2.16V22c4.75-.84 8.39-4.96 8.39-9.93z"/></svg>
      </a>
      <a href="https://twitter.com/intent/tweet?url=<?php echo urlencode($canonical); ?>&text=<?php echo urlencode($article['title']); ?>" target="_blank" rel="noopener" aria-label="Share on X" title="Share on X (Twitter)">
        <svg viewBox="0 0 24 24" fill="#000"><path d="M18.244 2H21.5l-7.5 8.565L22.5 22h-7.373l-5.367-6.234L3.5 22H.244l8.258-9.43L.5 2h7.5l4.843 5.616L18.244 2zm-1.292 18h2.053L7.123 4h-2.05L16.952 20z"/></svg>
      </a>
      <a href="https://api.whatsapp.com/send?text=<?php echo urlencode(($article['title'] ?? '') . ' ' . $canonical); ?>" target="_blank" rel="noopener" aria-label="Share on WhatsApp" title="Share on WhatsApp">
        <svg viewBox="0 0 24 24" fill="#25D366"><path d="M20.52 3.48A11.79 11.79 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.09 1.52 5.81L0 24l6.34-1.66A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.21-1.3-6.11-3.48-8.52zM12 21.82c-1.91 0-3.68-.55-5.17-1.5l-.37-.22-3.77.99 1.01-3.67-.24-.38A9.82 9.82 0 1 1 12 21.82zm5.67-7.5c-.31-.15-1.82-.9-2.1-1-.28-.1-.49-.15-.7.15-.2.31-.8 1-.98 1.2-.18.2-.36.22-.67.08-.31-.15-1.3-.48-2.47-1.53-.91-.81-1.52-1.8-1.7-2.1-.18-.31-.02-.48.13-.63.13-.13.31-.36.46-.54.15-.18.2-.31.31-.51.1-.2.05-.38-.02-.53-.07-.15-.7-1.67-.96-2.29-.25-.6-.51-.52-.7-.53h-.6c-.2 0-.53.08-.82.38-.28.31-1.07 1.04-1.07 2.54 0 1.49 1.1 2.93 1.25 3.12.15.2 2.17 3.31 5.26 4.64.74.32 1.31.51 1.76.65.74.24 1.42.2 1.96.12.6-.09 1.82-.74 2.08-1.46.26-.72.26-1.34.18-1.46-.08-.12-.28-.2-.58-.35z"/></svg>
      </a>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=<?php echo urlencode($canonical); ?>" target="_blank" rel="noopener" aria-label="Share on LinkedIn" title="Share on LinkedIn">
        <svg viewBox="0 0 24 24" fill="#0A66C2"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V24h-4V8.5zM8.5 8.5h3.83v2.11h.05c.53-1 1.83-2.11 3.77-2.11 4.03 0 4.78 2.65 4.78 6.1V24h-4V15.5c0-2.02-.04-4.63-2.82-4.63-2.83 0-3.26 2.21-3.26 4.49V24h-4V8.5z"/></svg>
      </a>
      <button type="button" id="copy-link" aria-label="Copy link" title="Copy link">
        <svg viewBox="0 0 24 24" fill="#111827"><path d="M3.9 12a4.1 4.1 0 0 1 4.1-4.1h3v2h-3A2.1 2.1 0 0 0 5.9 12a2.1 2.1 0 0 0 2.1 2.1h3v2h-3A4.1 4.1 0 0 1 3.9 12zm7-1h3a2.1 2.1 0 1 1 0 4.2h-3v2h3a4.1 4.1 0 0 0 0-8.2h-3v2z"/></svg>
      </button>
      <span id="copy-status" class="copy-status">Copied!</span>
    </div>

    <div class="ad">Ad Placeholder (In-article)</div>
    <div class="ad">Ad Placeholder (300x250)</div>

    <section class="more-section">
      <div class="more-header">
        <span class="eyebrow">You might also like</span>
        <h2>More News</h2>
      </div>
      <div class="container">
        <div class="news-grid">
          <?php if (!$more): ?>
            <p style="grid-column: span 12; color:#6b7280;">No more articles.</p>
          <?php else: ?>
            <?php foreach ($more as $n):
              $mimg = '';
              if (!empty($n['image_urls'])) {
                $p2 = explode(',', $n['image_urls']);
                $mimg = trim($p2[0]);
                 
              }
              $href = '/news/' . urlencode($n['url'] ?: $n['id']);
              $ex = trim(strip_tags($n['content'] ?? ''));
              if (strlen($ex) > 120) { $ex = substr($ex, 0, 120) . '…'; }
            ?>
            <article class="news-card">
              <?php if ($mimg): ?>
                <a href="<?php echo htmlspecialchars($href); ?>" aria-label="Open: <?php echo htmlspecialchars($n['title']); ?>">
                  <img src="<?php echo htmlspecialchars($mimg); ?>" alt="<?php echo htmlspecialchars($n['title']); ?>">
                </a>
              <?php endif; ?>
              <div class="body">
                <div class="meta"><?php echo htmlspecialchars($n['category']); ?> · <?php echo htmlspecialchars(date('Y-m-d', strtotime($n['published_date'] ?? 'now'))); ?></div>
                <div class="title"><?php echo htmlspecialchars($n['title']); ?></div>
                <div class="excerpt"><?php echo htmlspecialchars($ex); ?></div>
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
  </main>

  <?php if (file_exists(__DIR__ . '/includes/footer.php')) { include __DIR__ . '/includes/footer.php'; } ?>
</body>
</html>