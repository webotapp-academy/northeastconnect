<?php
require __DIR__ . '/auth.php';
admin_require_auth();

$page_title = 'Add News';
$active = 'all-news';
$pdo = db();

$messages = [];
$errors = [];

// Check if editing existing article
$edit_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$is_edit = $edit_id > 0;

if ($is_edit) {
    $page_title = 'Edit News';
    try {
        $stmt = $pdo->prepare("SELECT * FROM news WHERE id = ?");
        $stmt->execute([$edit_id]);
        $existing = $stmt->fetch();
        if (!$existing) {
            $errors[] = "Article not found.";
            $is_edit = false;
        }
    } catch (PDOException $e) {
        $errors[] = "Error loading article: " . $e->getMessage();
        $is_edit = false;
    }
}

// Handle async image generation request
if (($_POST['action'] ?? '') === 'generate_image') {
  $genTitle = trim($_POST['gen_title'] ?? '');
  $genSlug = slugify($genTitle ?: ('news-' . time()));
  $path = $genTitle ? generate_feature_image($genTitle, $genSlug) : null;
  header('Content-Type: application/json');
  echo json_encode([
    'ok' => (bool)$path,
    'path' => $path,
    'slug' => $genSlug,
    'error' => $path ? null : 'Image generation failed. Ensure GD is enabled.'
  ]);
  exit;
}

// If editing, use existing values; if arriving from rewrite, accept values via GET to prefill; otherwise defaults
if ($is_edit && isset($existing)) {
    $title = $existing['title'];
    $content = $existing['content'];
    $tags = $existing['tags'] ?? '';
    $source = $existing['source'] ?? 'Manual';
    $link = '';
    $category = $existing['category'] ?? 'News';
    $image_urls = $existing['image_urls'] ?? '';
    $status = $existing['status'] ?? 'Draft';
} else {
    $title = isset($_GET['title']) ? trim($_GET['title']) : '';
    $content = isset($_GET['content']) ? trim($_GET['content']) : '';
    $tags = isset($_GET['tags']) ? trim($_GET['tags']) : '';
    // Default source for manual articles is 'Manual' instead of 'Google News'
    $source = isset($_GET['source']) ? trim($_GET['source']) : 'Manual';
    $link = isset($_GET['link']) ? trim($_GET['link']) : '';
    $category = isset($_GET['category']) ? trim($_GET['category']) : 'News';
    $image_urls = '';
    $status = 'Draft';
}

// Allowed categories – update to match your DB enum exactly
$ALLOWED_CATEGORIES = ['News','Tourism','Culture','Events','Government'];
if (!in_array($category, $ALLOWED_CATEGORIES, true)) { $category = 'News'; }

// Slug function for URL
function slugify($text) {
  $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
  $text = preg_replace('~[\p{Pd}\s_]+~u', '-', $text); // spaces/underscores to dash
  $text = @iconv('UTF-8','ASCII//TRANSLIT',$text);
  $text = preg_replace('~[^A-Za-z0-9-]+~', '', $text);
  $text = preg_replace('~-+~', '-', $text);
  $text = trim($text, '-');
  $text = strtolower($text);
  return $text ?: 'news-item';
}

// Generate featured image with title text, return relative web path on success or null
function generate_feature_image($title, $slug) {
  if (!function_exists('imagecreatetruecolor')) {
    return null; // GD not available
  }

  $width = 1200; $height = 630; // OpenGraph size
  $im = imagecreatetruecolor($width, $height);
  if (!$im) return null;
  // Ensure blending behaves as expected
  imagealphablending($im, true);
  imagesavealpha($im, true);

  // Strong vertical gradient (top black to bottom dark green)
  $topBlack = [0, 0, 0];    // black at top
  $bottomGreen = [6, 95, 70]; // emerald-800 at bottom
  for ($y = 0; $y < $height; $y++) {
    $t = $y / $height;
    $r = (int)($topBlack[0] * (1-$t) + $bottomGreen[0] * $t);
    $g = (int)($topBlack[1] * (1-$t) + $bottomGreen[1] * $t);
    $b = (int)($topBlack[2] * (1-$t) + $bottomGreen[2] * $t);
    $col = imagecolorallocate($im, $r, $g, $b);
    imageline($im, 0, $y, $width, $y, $col);
  }

  // Colors
  $white = imagecolorallocate($im, 255, 255, 255);
  $shadow = imagecolorallocatealpha($im, 0, 0, 0, 70);

  // Try TrueType for scalable font if available
  $ttfPath = __DIR__ . '/assets/fonts/Poppins-SemiBold.ttf';
  $useTTF = file_exists($ttfPath) && function_exists('imagettftext');
 
  // Increase side margins for better breathing room
  $marginX = (int)($width * 0.15);   // 15% margins left/right
  $usableW = (int)($width - 2 * $marginX); // ~70% usable width
 
  if ($useTTF) {
    // Adaptive font sizing with max 2 lines
    $maxFont = 90; // starting guess
    $minFont = 18;
    $fontSize = $maxFont;

    // Word wrap into up to 2 lines based on measured width
    $lines = [];
    $wrapAndMeasure = function($size, $maxLines = 2) use ($title, $ttfPath, $usableW) {
      $words = preg_split('/\s+/', trim($title));
      $lines = [];
      $line = '';
      foreach ($words as $w) {
        $test = trim($line === '' ? $w : ($line . ' ' . $w));
        $bbox = imagettfbbox($size, 0, $ttfPath, $test);
        $textW = $bbox[2] - $bbox[0];
        if ($textW > $usableW && $line !== '') {
          $lines[] = $line;
          $line = $w;
          if (count($lines) >= $maxLines - 1) {
            // Force the rest into the last line (up to 2 lines total)
            $line = trim($line . ' ' . implode(' ', array_slice($words, array_search($w, $words) + 1)));
            break;
          }
        } else {
          $line = $test;
        }
      }
      if ($line !== '') $lines[] = $line;
      // If more than maxLines, merge extras into the second line
      if (count($lines) > $maxLines) {
        $lines = array_slice($lines, 0, $maxLines);
      }
      // Measure max width
      $maxW = 0; $totalH = 0; $lineHeights = [];
      foreach ($lines as $ln) {
        $bbox = imagettfbbox($size, 0, $ttfPath, $ln);
        $w = $bbox[2] - $bbox[0];
        $h = ($bbox[1] - $bbox[7]);
        $maxW = max($maxW, $w);
        $lineHeights[] = $h;
      }
      foreach ($lineHeights as $h) { $totalH += (int)($h * 1.38); }
      return [$lines, $maxW, $totalH, $lineHeights];
    };

    // Binary search font size to maximize width without exceeding usableW
    while ($minFont <= $maxFont) {
      $mid = (int)(($minFont + $maxFont) / 2);
      [$testLines, $mw] = $wrapAndMeasure($mid, 2);
      if ($mw <= $usableW && count($testLines) <= 2) {
        $fontSize = $mid; $minFont = $mid + 2; // try larger
      } else {
        $maxFont = $mid - 2; // too big
      }
    }

    // Final wrap and draw
    [$lines, $maxW, $totalH, $lineHeights] = $wrapAndMeasure($fontSize, 2);
    // If still too wide or >2 lines, nudge down size a bit
    $tries = 0;
    while (($maxW > $usableW || count($lines) > 2) && $fontSize > $minFont && $tries < 5) {
      $fontSize -= 2; $tries++;
      [$lines, $maxW, $totalH, $lineHeights] = $wrapAndMeasure($fontSize, 2);
    }
    $startY = (int)max(($height - $totalH) / 2, $height * 0.18);

    foreach ($lines as $i => $ln) {
      $bbox = imagettfbbox($fontSize, 0, $ttfPath, $ln);
      $w = $bbox[2] - $bbox[0];
      $h = ($bbox[1] - $bbox[7]);
      $x = (int)max($marginX, ($width - $w) / 2);
      $y = (int)($startY + ($i+1) * (int)($lineHeights[$i] * 1.50));
      // shadow
      imagettftext($im, $fontSize, 0, $x+2, $y+2, $shadow, $ttfPath, $ln);
      // main
      imagettftext($im, $fontSize, 0, $x, $y, $white, $ttfPath, $ln);
    }
  } else {
    // Fallback: built-in font; adjust wrapping to approach 80% width
    $font = 5; // largest built-in
    $charW = imagefontwidth($font);
    $charH = imagefontheight($font);

    $wrapW = $usableW;
    $maxCharsPerLine = max(8, (int)floor($wrapW / $charW));

    $words = preg_split('/\s+/', trim($title));
    $lines = [];
    $line = '';
    foreach ($words as $w) {
      $test = trim($line === '' ? $w : ($line . ' ' . $w));
      if (strlen($test) > $maxCharsPerLine && $line !== '') {
        $lines[] = $line;
        $line = $w;
      } else {
        $line = $test;
      }
    }
    if ($line !== '') $lines[] = $line;

    $lineSpacing = (int)max(28, $charH * 2.2);
    $textBlockH = count($lines) * $lineSpacing;
    $startY = (int)max(($height - $textBlockH) / 2, $height * 0.15);

    foreach ($lines as $i => $ln) {
      $textW = $charW * strlen($ln);
      $x = (int)max($marginX, ($width - $textW) / 2);
      $y = (int)($startY + $i * $lineSpacing);
      // Outline
      imagestring($im, $font, $x-1, $y, $ln, $shadow);
      imagestring($im, $font, $x+1, $y, $ln, $shadow);
      imagestring($im, $font, $x, $y-1, $ln, $shadow);
      imagestring($im, $font, $x, $y+1, $ln, $shadow);
      imagestring($im, $font, $x-1, $y-1, $ln, $shadow);
      imagestring($im, $font, $x+1, $y-1, $ln, $shadow);
      imagestring($im, $font, $x-1, $y+1, $ln, $shadow);
      imagestring($im, $font, $x+1, $y+1, $ln, $shadow);
      // Main
      imagestring($im, $font, $x, $y, $ln, $white);
    }
  }

  // Brand tag bottom-right
  $brand = 'North East Connect';
  $bw = imagefontwidth(3) * strlen($brand);
  $bx = $width - $bw - 24;
  $by = $height - imagefontheight(3) - 18;
  imagestring($im, 3, $bx+1, $by+1, $brand, imagecolorallocatealpha($im,0,0,0,90));
  imagestring($im, 3, $bx, $by, $brand, imagecolorallocatealpha($im,255,255,255,90));

  // Top-right large logo text using TTF if available
  if ($useTTF) {
    $logoText = 'North East Connect';
    $logoSize = 10; // adjust as needed
    $pad = 32;
    // Measure text bbox
    $bbox = imagettfbbox($logoSize, 0, $ttfPath, $logoText);
    $logoW = $bbox[2] - $bbox[0];
    $logoH = $bbox[1] - $bbox[7];
    $lx = (int)($width - $pad - $logoW);
    $ly = (int)($pad + $logoH);
    // Shadow
    imagettftext($im, $logoSize, 0, $lx+2, $ly+2, $shadow, $ttfPath, $logoText);
    // Main text (white)
    imagettftext($im, $logoSize, 0, $lx, $ly, $white, $ttfPath, $logoText);
  }

  // Save
  $relDir = '/assets/images/news';
  $absDir = $_SERVER['DOCUMENT_ROOT'] . $relDir;
  if (!is_dir($absDir)) { @mkdir($absDir, 0775, true); }
  // Use unique filename to avoid browser/CDN caching issues
  $filename = $slug . '-v' . time() . '.jpg';
  $relPath = $relDir . '/' . $filename;
  $absPath = $absDir . '/' . $filename;

  if (!imagejpeg($im, $absPath, 92)) { imagedestroy($im); return null; }
  imagedestroy($im);
  return $relPath;
}

$url = slugify($title);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['action'])) {
  $title = trim($_POST['p_title'] ?? '');
  $content = trim($_POST['p_content'] ?? '');
  $tags = trim($_POST['p_tags'] ?? '');
  $category = trim($_POST['p_category'] ?? 'News');
  if (!in_array($category, $ALLOWED_CATEGORIES, true)) { $category = 'News'; }
  $author = admin_current_user()['name'] ?? 'Admin';
  $source = trim($_POST['p_source'] ?? 'Manual');
  $status = trim($_POST['p_status'] ?? 'Published');
  $image_urls = trim($_POST['p_image_urls'] ?? '');
  $url = slugify($title);

  // Clean content labels: remove any **Title:** or **SEO Tags:** markers if present
  $content = preg_replace('/\*\*\s*Title\s*:\s*\*\*/i', 'Title: ', $content);
  $content = preg_replace('/\*\*\s*SEO\s*Tags\s*:\s*\*\*/i', 'SEO Tags: ', $content);

  // Generate featured image if not provided and not editing
  if (!$is_edit || empty($image_urls)) {
      $generated = generate_feature_image($title, $url);
      if ($generated) {
        if ($image_urls) {
          // Append to existing list
          $image_urls = $generated . ',' . $image_urls;
        } else {
          $image_urls = $generated;
        }
      }
  }

  if ($title === '' || $content === '') {
    $errors[] = 'Title and content are required to publish.';
  } else {
    try {
      if ($is_edit) {
        // Update existing article
        $stmt = $pdo->prepare('UPDATE news SET title = :title, url = :url, category = :category, content = :content, author = :author, source = :source, image_urls = :image_urls, tags = :tags, status = :status WHERE id = :id');
        $stmt->execute([
          ':title' => $title,
          ':url' => $url,
          ':category' => $category,
          ':content' => $content,
          ':author' => $author,
          ':source' => $source,
          ':image_urls' => $image_urls,
          ':tags' => $tags,
          ':status' => $status,
          ':id' => $edit_id,
        ]);
        $messages[] = 'Article updated successfully.';
      } else {
        // Insert new article
        $stmt = $pdo->prepare('INSERT INTO news (title, url, category, content, author, source, image_urls, tags, status) VALUES (:title, :url, :category, :content, :author, :source, :image_urls, :tags, :status)');
        $stmt->execute([
          ':title' => $title,
          ':url' => $url,
          ':category' => $category,
          ':content' => $content,
          ':author' => $author,
          ':source' => $source,
          ':image_urls' => $image_urls,
          ':tags' => $tags,
          ':status' => $status,
        ]);
        $messages[] = 'Article published to DB.';
        // Redirect to edit mode to prevent resubmission
        $new_id = $pdo->lastInsertId();
        header("Location: news-add.php?id=$new_id&saved=1");
        exit;
      }
    } catch (Throwable $e) {
      $errors[] = 'DB operation failed: ' . $e->getMessage();
    }
  }
}

// Check for saved parameter
if (isset($_GET['saved'])) {
    $messages[] = 'Article saved successfully.';
}

function render_content() {
  global $messages, $errors, $title, $content, $tags, $source, $link, $category, $ALLOWED_CATEGORIES, $url, $is_edit, $image_urls, $status;
?>
  <section class="panel">
    <h3 style="margin:0 0 12px;"><?php echo $is_edit ? 'Edit News Article' : 'Add New News Article'; ?></h3>
    <?php foreach ($messages as $m): ?><div class="alert" style="background:#ecfeff;color:#155e75;margin-bottom:8px;">&nbsp;<?php echo htmlspecialchars($m); ?></div><?php endforeach; ?>
    <?php foreach ($errors as $e): ?><div class="alert" style="background:#fef2f2;color:#991b1b;margin-bottom:8px;">&nbsp;<?php echo htmlspecialchars($e); ?></div><?php endforeach; ?>

    <form class="form" method="post">
      <div class="field">
        <label class="label">Title</label>
        <input class="input" id="p_title" name="p_title" value="<?php echo htmlspecialchars($title); ?>" placeholder="Article title" />
      </div>
      <div class="grid-2">
        <div>
          <label class="label">URL</label>
          <input class="input" id="p_url" name="p_url" value="<?php echo htmlspecialchars($url); ?>" placeholder="auto-generated-from-title" readonly />
          <div class="help">Auto-generated from title. Will be saved to the "url" column.</div>
        </div>
        <div>
          <label class="label">Category</label>
          <select class="select" name="p_category">
            <?php foreach ($ALLOWED_CATEGORIES as $opt): ?>
              <option <?php echo $category===$opt?'selected':''; ?>><?php echo htmlspecialchars($opt); ?></option>
            <?php endforeach; ?>
          </select>
        </div>
      </div>

      <div class="field">
        <label class="label">Content</label>
        <textarea class="textarea" id="p_content" name="p_content" placeholder="Article content" ><?php echo htmlspecialchars($content); ?></textarea>
        <div class="help">Tip: Use the editor toolbar to format text. Bold markers like **Title:** or **SEO Tags:** will be sanitized.</div>
      </div>

      <div class="field">
        <label class="label">Tags (comma separated)</label>
        <div style="display:flex; gap:8px;">
          <input class="input" id="p_tags" name="p_tags" value="<?php echo htmlspecialchars($tags); ?>" placeholder="e.g. Assam, tourism, culture" />
          <button class="btn outline" type="button" id="suggest-tags">Suggest</button>
          <button class="btn outline" type="button" id="extract-tags">Extract from Content</button>
        </div>
        <div class="help">SEO tags will be inserted here as comma-separated values.</div>
      </div>

      <div class="field">
        <label class="label">Image URLs (comma separated)</label>
        <input class="input" name="p_image_urls" id="p_image_urls" value="<?php echo htmlspecialchars($image_urls); ?>" />
        <div class="help">A featured image can be generated from title. Click the button below.</div>
        <div style="display:flex; gap:8px; align-items:center; margin-top:8px; flex-wrap:wrap;">
          <button class="btn outline" type="button" id="btn-generate-img">Generate Featured Image</button>
          <span id="gen-status" style="font-size:12px;color:#475569;"></span>
        </div>
        <div id="gen-preview-wrap" style="margin-top:10px; display:none;">
          <div style="font-size:12px;color:#475569;margin-bottom:6px;">Preview</div>
          <img id="gen-preview" src="" alt="Preview" style="max-width:100%;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 1px 2px rgba(0,0,0,.06);" />
        </div>
      </div>
      <div class="grid-3">
        <div>
          <label class="label">Source</label>
          <input class="input" name="p_source" value="<?php echo htmlspecialchars($source); ?>" />
          <div class="help">Set to "Manual" for manually written articles</div>
        </div>
        <div>
          <label class="label">Status</label>
          <select class="select" name="p_status">
            <option value="Published" <?php echo $status === 'Published' ? 'selected' : ''; ?>>Published</option>
            <option value="Draft" <?php echo $status === 'Draft' ? 'selected' : ''; ?>>Draft</option>
          </select>
        </div>
        <div>
          <label class="label">Original Link</label>
          <input class="input" value="<?php echo htmlspecialchars($link); ?>" readonly />
        </div>
      </div>
      <div class="actions">
        <button class="btn" type="submit"><?php echo $is_edit ? 'Update Article' : 'Publish Article'; ?></button>
        <a class="btn outline" href="all-news.php">Back to All News</a>
      </div>
    </form>
  </section>

  <script>
  // Slugify on title change
  (function(){
    function slugify(text){
      return text
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\s_]+/g,'-')
        .replace(/[^A-Za-z0-9-]/g,'')
        .replace(/-+/g,'-')
        .replace(/^-|-$/g,'')
        .toLowerCase() || 'news-item';
    }
    const titleEl = document.getElementById('p_title');
    const urlEl = document.getElementById('p_url');
    if (titleEl && urlEl) {
      titleEl.addEventListener('input', ()=>{ urlEl.value = slugify(titleEl.value); });
    }
  })();

  // Minimal rich text editor using contenteditable + toolbar syncing with textarea
  (function(){
    const textarea = document.getElementById('p_content');
    // Build toolbar and editor
    const wrapper = document.createElement('div');
    const toolbar = document.createElement('div');
    const editor = document.createElement('div');
    wrapper.className = 'rt-wrapper';
    toolbar.className = 'rt-toolbar';
    editor.className = 'rt-editor';
    Object.assign(toolbar.style, {display:'flex', gap:'8px', marginBottom:'8px'});
    Object.assign(editor.style, {border:'1px solid var(--border)', borderRadius:'10px', padding:'10px', minHeight:'220px', background:'#fff'});
    editor.contentEditable = true;
    editor.innerHTML = textarea.value.replace(/\n/g, '<br/>');

    const buttons = [
      {cmd:'bold', label:'B'},
      {cmd:'italic', label:'I'},
      {cmd:'underline', label:'U'},
      {cmd:'insertUnorderedList', label:'• List'},
      {cmd:'formatBlock', arg:'H3', label:'H3'},
      {cmd:'formatBlock', arg:'P', label:'P'},
      {cmd:'createLinkPrompt', label:'Link'},
      {cmd:'cleanLabels', label:'Clean Labels'},
    ];

    function syncTextarea(){
      textarea.value = editor.innerHTML
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<div>/gi, '\n')
        .replace(/<\/div>/gi, '')
        .replace(/\n{3,}/g, '\n\n');
    }

    buttons.forEach(b => {
      const bt = document.createElement('button');
      bt.type = 'button';
      bt.className = 'btn outline';
      bt.textContent = b.label;
      bt.addEventListener('click', () => {
        if (b.cmd === 'createLinkPrompt') {
          const url = prompt('Enter URL');
          if (url) document.execCommand('createLink', false, url);
        } else if (b.cmd === 'formatBlock') {
          document.execCommand('formatBlock', false, b.arg);
        } else if (b.cmd === 'cleanLabels') {
          // Replace **Title:** or **SEO Tags:** with plain labels
          editor.innerHTML = editor.innerHTML
            .replace(/\*\*\s*Title\s*:\s*\*\*/gi, 'Title: ')
            .replace(/\*\*\s*SEO\s*Tags\s*:\s*\*\*/gi, 'SEO Tags: ');
        } else {
          document.execCommand(b.cmd, false, b.arg || null);
        }
        syncTextarea();
      });
      toolbar.appendChild(bt);
    });

    textarea.style.display = 'none';
    textarea.parentNode.insertBefore(wrapper, textarea);
    wrapper.appendChild(toolbar);
    wrapper.appendChild(editor);

    // Keep textarea in sync on input
    editor.addEventListener('input', syncTextarea);

    // SEO tags suggestion: naive keyword extraction
    const suggestBtn = document.getElementById('suggest-tags');
    const extractBtn = document.getElementById('extract-tags');
    const tagsInput = document.getElementById('p_tags');
    function extractKeywords(text) {
      text = (text || '').toLowerCase();
      const words = text.match(/[a-zA-Z]{3,}/g) || [];
      const stop = new Set(['the','and','for','with','that','from','this','have','will','your','are','was','were','been','into','over','under','also','about','which','their','there','then','than','our','out','but','not','can','more','some','what','when','where','who','has','had']);
      const counts = {};
      words.forEach(w => { if (!stop.has(w)) counts[w] = (counts[w]||0)+1; });
      return Object.entries(counts)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,8)
        .map(([w])=>w)
        .join(', ');
    }
    if (suggestBtn) {
      suggestBtn.addEventListener('click', () => {
        const combined = (<?php echo json_encode($title); ?> + ' ' + editor.innerText).trim();
        const suggestion = extractKeywords(combined);
        if (suggestion) { tagsInput.value = suggestion; }
      });
    }
    if (extractBtn) {
      extractBtn.addEventListener('click', () => {
        // Look for a line starting with SEO Tags:
        const m = editor.innerText.match(/SEO\s*Tags\s*:\s*(.+)/i);
        if (m && m[1]) {
          tagsInput.value = m[1].trim();
        } else {
          const suggestion = extractKeywords(editor.innerText);
          if (suggestion) { tagsInput.value = suggestion; }
        }
      });
    }
  })();

  // Generate image button handler with preview
  (function(){
    const btn = document.getElementById('btn-generate-img');
    const titleEl = document.getElementById('p_title');
    const urlEl = document.getElementById('p_url');
    const dest = document.getElementById('p_image_urls');
    const statusEl = document.getElementById('gen-status');
    const prevWrap = document.getElementById('gen-preview-wrap');
    const prevImg = document.getElementById('gen-preview');

    if (!btn) return;
    btn.addEventListener('click', async () => {
      const t = (titleEl?.value || '').trim();
      if (!t) { statusEl.textContent = 'Please enter a Title first.'; return; }
      statusEl.textContent = 'Generating...';
      try {
        const form = new FormData();
        form.append('action', 'generate_image');
        form.append('gen_title', t);
        const resp = await fetch(window.location.href, { method: 'POST', body: form, credentials: 'same-origin' });
        const data = await resp.json();
        if (data.ok && data.path) {
          // Prepend to input
          const current = (dest?.value || '').trim();
          dest.value = current ? (data.path + ',' + current) : data.path;
          // Preview with cache-busting
          prevImg.src = data.path + '?v=' + Date.now();
          prevWrap.style.display = 'block';
          statusEl.textContent = 'Image created.';
          // Update URL from slug if empty
          if (urlEl && !urlEl.value) urlEl.value = data.slug || urlEl.value;
        } else {
          statusEl.textContent = data.error || 'Failed to generate image.';
        }
      } catch (e) {
        statusEl.textContent = 'Error: could not contact server.';
      }
    });
  })();
  </script>
<?php
}

include __DIR__ . '/partials/layout.php';
?>