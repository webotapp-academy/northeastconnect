<?php
require __DIR__ . '/auth.php';
admin_require_auth();

$page_title = 'News';
$active = 'news';

// Config for Google News RSS and Gemini API
$DEFAULT_QUERY = isset($_GET['q']) ? trim($_GET['q']) : 'Assam';
$GOOGLE_NEWS_RSS = function(string $q) {
  // Google News RSS by search query
  $encoded = urlencode($q);
  return "https://news.google.com/rss/search?q={$encoded}&hl=en-IN&gl=IN&ceid=IN:en";
};

// FIXED GEMINI API KEY (provided)
const GEMINI_API_KEY = 'AIzaSyAOrd8aV0xEcns5EDx9P9SP4nUAvvHJNtc';

// Load DB
$pdo = db();

// State holders
$messages = [];
$errors = [];
$articles = [];
$preview = null;
$should_scroll_preview = false;

// Helpers
function http_get(string $url, int $timeout = 10): string {
  $ctx = stream_context_create([
    'http' => [
      'method' => 'GET',
      'timeout' => $timeout,
      'header' => "User-Agent: DiscoverAssamAdmin/1.0\r\n",
    ],
    'ssl' => [
      'verify_peer' => true,
      'verify_peer_name' => true,
    ]
  ]);
  $res = @file_get_contents($url, false, $ctx);
  if ($res === false) {
    throw new RuntimeException('Failed to fetch: ' . $url);
  }
  return $res;
}

function parse_rss_items(string $xml): array {
  $items = [];
  try {
    $feed = @simplexml_load_string($xml);
    if (!$feed) return [];
    foreach ($feed->channel->item as $item) {
      $items[] = [
        'title' => (string)$item->title,
        'link' => (string)$item->link,
        'pubDate' => (string)$item->pubDate,
        'source' => (string)$item->source,
        'description' => (string)$item->description,
      ];
    }
  } catch (Throwable $e) {
    // ignore
  }
  return $items;
}

function sanitize_markdown_labels(string $text): string {
  // Remove markdown bold/italic markers and clean label lines
  $text = preg_replace('/\*\*(.*?)\*\*/s', '$1', $text); // **bold**
  $text = preg_replace('/__(.*?)__/s', '$1', $text); // __bold__
  $text = preg_replace('/\*(.*?)\*/s', '$1', $text); // *italic*
  $text = preg_replace('/_(.*?)_/s', '$1', $text); // _italic_
  // Normalize Title: and SEO Tags: labels if present
  $text = preg_replace('/(?im)^\s*\*?\*?\s*title\s*:\s*/', 'Title: ', $text);
  $text = preg_replace('/(?im)^\s*\*?\*?\s*seo\s*tags\s*:\s*/', 'SEO Tags: ', $text);
  return trim($text);
}

function gemini_rewrite(string $apiKey, string $title, string $summary, string $link): array {
  // Updated endpoint to use gemini-2.0-flash
  $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . urlencode($apiKey);
  
  // Detailed logging
  $logFile = __DIR__ . '/../logs/gemini_api_debug.log';
  $timestamp = date('Y-m-d H:i:s');

  // Prepare logging context
  $logContext = [
    'title' => $title,
    'summary_length' => strlen($summary),
    'link' => $link,
    'api_key_length' => strlen($apiKey),
    'api_key_starts_with' => substr($apiKey, 0, 5)
  ];

  try {
    // Prepare payload with more robust error handling
    $payload = [
      'contents' => [[
        'parts' => [['text' => "You are a news editor highly experienced in writing SEO articles for North East Connect. 

Rewrite the following Google News article into an original, concise post in 600-1000 words, in English, neutral tone, suitable for a regional portal.

Guidelines:
- Decide on a long-tailed keyword for ranking
- Use the keyword in title, description, and URL
- Keep factual details, do not fabricate
- Avoid direct quotes unless essential
- Provide: title, body, and 5-8 comma-separated SEO tags
- Title should have positive or negative sentiment plus include a number 
- Include a short intro and structured paragraphs

Original Title: {$title}
Summary: {$summary}
Source Link: {$link}"]]
      ]]
    ];

    // Detailed cURL request with extensive logging
    $ch = curl_init($endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
      'Content-Type: application/json',
      'X-goog-api-key: ' . $apiKey,
      'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_VERBOSE, true);

    // Capture verbose output
    $verboseLog = fopen('php://temp', 'w+');
    curl_setopt($ch, CURLOPT_STDERR, $verboseLog);

    $raw = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);

    // Capture verbose output details
    rewind($verboseLog);
    $verboseOutput = stream_get_contents($verboseLog);
    fclose($verboseLog);

    // Comprehensive logging
    $fullLogContext = array_merge($logContext, [
      'http_code' => $httpCode,
      'curl_error' => $curlError,
      'verbose_output' => $verboseOutput,
      'raw_response' => $raw
    ]);

    // Log the full context
    file_put_contents($logFile, 
      "[{$timestamp}] Gemini API Debug\n" . 
      print_r($fullLogContext, true) . 
      "\n---\n", 
      FILE_APPEND
    );

    // Throw exception for non-200 responses
    if ($raw === false || $httpCode !== 200) {
      throw new RuntimeException(
        "Gemini API request failed. " . 
        "HTTP Code: {$httpCode}, " . 
        "CURL Error: {$curlError}"
      );
    }

    // Parse response
    $data = json_decode($raw, true);

    // Validate JSON decoding
    if (json_last_error() !== JSON_ERROR_NONE) {
      throw new RuntimeException(
        'Failed to parse Gemini API response: ' . 
        json_last_error_msg()
      );
    }

    // Extract text from response
    $text = '';
    if (!empty($data['candidates'][0]['content']['parts'])) {
      foreach ($data['candidates'][0]['content']['parts'] as $p) {
        if (!empty($p['text'])) { 
          $text .= $p['text'] . "\n"; 
        }
      }
    }

    // Sanitize and process text
    $text = sanitize_markdown_labels(trim($text));

    // Fallback if no text extracted
    if (empty($text)) {
      throw new RuntimeException('No text extracted from Gemini API response');
    }

    // Extract title, tags, and body
    $outTitle = $title;
    $tags = '';
    $body = $text;

    // Title extraction
    if (preg_match('/(?i)^\s*title\s*:\s*(.+)$/m', $text, $m)) {
      $outTitle = trim($m[1]);
    }

    // Tags extraction
    if (preg_match('/(?i)^\s*tags?\s*:\s*(.+)$/m', $text, $m)) {
      $tags = trim($m[1]);
    } elseif (preg_match('/(?i)^\s*seo\s*tags?\s*:\s*(.+)$/m', $text, $m)) {
      $tags = trim($m[1]);
    }

    // Remove metadata lines
    $body = preg_replace('/(?i)^\s*(title|tags?|seo\s*tags?)\s*:.+$/m', '', $text);
    $body = trim($body);

    // Fallbacks
    if ($outTitle === '' || $outTitle === $title) {
      $lines = preg_split('/\r?\n/', $text);
      if (!empty($lines[0])) $outTitle = trim($lines[0]);
    }

    if ($body === '') {
      $body = "No body generated by the model. Please try again or edit before publishing.";
    }

    return [
      'title' => $outTitle,
      'content' => $body,
      'tags' => $tags,
    ];

  } catch (Throwable $e) {
    // Log full exception details
    file_put_contents($logFile, 
      "[{$timestamp}] Exception Details\n" . 
      "Message: " . $e->getMessage() . "\n" .
      "Trace: " . $e->getTraceAsString() . "\n" .
      "Context: " . print_r($logContext, true) . 
      "\n---\n", 
      FILE_APPEND
    );

    throw $e;
  }
}

// Handle actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $action = $_POST['action'] ?? '';

  if ($action === 'fetch_rss') {
    $query = trim($_POST['query'] ?? $DEFAULT_QUERY);
    try {
      $xml = http_get($GOOGLE_NEWS_RSS($query));
      $articles = parse_rss_items($xml);
      if (!$articles) $messages[] = 'No items found for query: ' . htmlspecialchars($query);
    } catch (Throwable $e) {
      $errors[] = 'Error fetching RSS: ' . $e->getMessage();
    }
  }

  if ($action === 'rewrite') {
    // Use fixed API key
    $apiKey = GEMINI_API_KEY;
    $title = trim($_POST['title'] ?? '');
    $summary = trim($_POST['summary'] ?? '');
    $link = trim($_POST['link'] ?? '');
    try {
      $preview = gemini_rewrite($apiKey, $title, $summary, $link);
      $GLOBALS['preview'] = $preview; // ensure availability
      $messages[] = 'Rewrite generated. Review and then Publish to DB.';
      $GLOBALS['should_scroll_preview'] = true;
      $should_scroll_preview = true;
    } catch (Throwable $e) {
      $errors[] = 'Gemini rewrite failed: ' . $e->getMessage();
    }
  }

  if ($action === 'publish') {
    $title = trim($_POST['p_title'] ?? '');
    $content = trim($_POST['p_content'] ?? '');
    $tags = trim($_POST['p_tags'] ?? '');
    $category = trim($_POST['p_category'] ?? 'News');
    $author = admin_current_user()['name'] ?? 'Admin';
    $source = trim($_POST['p_source'] ?? 'Google News');
    $status = 'Published';
    $image_urls = trim($_POST['p_image_urls'] ?? '');

    if ($title === '' || $content === '') {
      $errors[] = 'Title and content are required to publish.';
    } else {
      try {
        $stmt = $pdo->prepare('INSERT INTO news (title, category, content, author, source, image_urls, tags, status) VALUES (:title, :category, :content, :author, :source, :image_urls, :tags, :status)');
        $stmt->execute([
          ':title' => $title,
          ':category' => $category,
          ':content' => $content,
          ':author' => $author,
          ':source' => $source,
          ':image_urls' => $image_urls,
          ':tags' => $tags,
          ':status' => $status,
        ]);
        $messages[] = 'Article published to DB.';
      } catch (Throwable $e) {
        $errors[] = 'DB insert failed: ' . $e->getMessage();
      }
    }
  }
}

function render_content() {
  global $DEFAULT_QUERY, $messages, $errors, $articles, $preview, $should_scroll_preview;
  // Build link to news-add.php with prefilled fields if preview exists
  $add_link = '';
  if (is_array($preview)) {
    $params = http_build_query([
      'title' => $preview['title'] ?? '',
      'content' => $preview['content'] ?? '',
      'tags' => $preview['tags'] ?? '',
      'source' => 'Google News',
    ]);
    $add_link = '/admin/news-add.php?' . $params;
  }
?>
  <section class="panel">
    <h3 style="margin:0 0 12px;">Fetch Google News RSS</h3>
    <?php foreach ($messages as $m): ?><div class="alert" style="background:#ecfeff;color:#155e75;margin-bottom:8px;">&nbsp;<?php echo htmlspecialchars($m); ?></div><?php endforeach; ?>
    <?php foreach ($errors as $e): ?><div class="alert" style="background:#fef2f2;color:#991b1b;margin-bottom:8px;">&nbsp;<?php echo htmlspecialchars($e); ?></div><?php endforeach; ?>

    <form class="form" method="post">
      <input type="hidden" name="action" value="fetch_rss" />
      <div class="grid-3">
        <div>
          <label class="label">Query</label>
          <input class="input" name="query" placeholder="Assam tourism" value="<?php echo htmlspecialchars($DEFAULT_QUERY); ?>" />
        </div>
        <div class="actions" style="align-items:end;">
          <button class="btn" type="submit">Fetch RSS</button>
          <a class="btn outline" href="https://news.google.com/" target="_blank">Google News</a>
          <?php if ($add_link) { ?>
            <a class="btn" href="<?php echo htmlspecialchars($add_link); ?>">Open in Editor</a>
          <?php } ?>
        </div>
      </div>
    </form>
  </section>

  <?php if ($articles) { ?>
    <section class="panel mt-16">
      <h3 style="margin:0 0 12px;">RSS Results</h3>
      <div class="grid-2">
        <div>
          <table class="table">
            <thead><tr><th>Title</th><th>Published</th><th>Actions</th></tr></thead>
            <tbody>
              <?php foreach ($articles as $i => $a): ?>
              <tr>
                <td><?php echo htmlspecialchars($a['title']); ?></td>
                <td style="white-space:nowrap;">&nbsp;<?php echo htmlspecialchars($a['pubDate']); ?></td>
                <td>
                  <form method="post" style="display:inline;" id="rewrite-form-<?php echo $i; ?>">
                    <input type="hidden" name="action" value="rewrite" />
                    <input type="hidden" name="title" value="<?php echo htmlspecialchars($a['title']); ?>" />
                    <input type="hidden" name="summary" value="<?php echo htmlspecialchars(strip_tags($a['description'])); ?>" />
                    <input type="hidden" name="link" value="<?php echo htmlspecialchars($a['link']); ?>" />
                    <button class="btn rewrite-btn" type="submit" data-form-id="<?php echo $i; ?>">Rewrite</button>
                    <a class="btn outline" href="<?php echo htmlspecialchars($a['link']); ?>" target="_blank">Open</a>
                    <?php if ($add_link) { ?>
                      <a class="btn outline" href="<?php echo htmlspecialchars($add_link); ?>">Open in Editor</a>
                    <?php } ?>
                  </form>
                </td>
              </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>

        <div>
          <?php if ($preview !== null) { ?>
            <div id="rewrite-preview" class="panel" style="margin:0; border:2px solid rgba(37,99,235,0.3); box-shadow: 0 0 0 3px rgba(37,99,235,0.08);">
              <h4 style="margin:0 0 8px;">Rewrite Preview</h4>
              <div class="actions" style="margin-bottom:8px;">
                <?php if ($add_link) { ?><a class="btn" href="<?php echo htmlspecialchars($add_link); ?>">Open in Editor</a><?php } ?>
              </div>
              <form class="form" method="post">
                <input type="hidden" name="action" value="publish" />
                <div class="field">
                  <label class="label">Title</label>
                  <input class="input" name="p_title" value="<?php echo htmlspecialchars($preview['title'] ?? ''); ?>" placeholder="Generated title will appear here" />
                </div>
                <div class="field">
                  <label class="label">Content</label>
                  <textarea class="textarea" name="p_content" placeholder="Generated content will appear here" ><?php echo htmlspecialchars($preview['content'] ?? ''); ?></textarea>
                  <div class="help">Characters: <?php echo isset($preview['content']) ? strlen($preview['content']) : 0; ?></div>
                </div>
                <div class="grid-2">
                  <div>
                    <label class="label">Category</label>
                    <select class="select" name="p_category">
                      <option>News</option>
                      <option>Tourism</option>
                      <option>Culture</option>
                      <option>Events</option>
                      <option>Government</option>
                    </select>
                  </div>
                  <div>
                    <label class="label">Tags (comma separated)</label>
                    <input class="input" name="p_tags" value="<?php echo htmlspecialchars($preview['tags'] ?? ''); ?>" placeholder="e.g. Assam, tourism, culture" />
                  </div>
                </div>
                <div class="field">
                  <label class="label">Image URLs (comma separated)</label>
                  <input class="input" name="p_image_urls" />
                </div>
                <div class="field">
                  <label class="label">Source</label>
                  <input class="input" name="p_source" value="Google News" />
                </div>
                <div class="actions">
                  <button class="btn" type="submit">Publish to DB</button>
                </div>
              </form>
            </div>
            <?php if ($should_scroll_preview) { ?>
              <script>
              window.addEventListener('DOMContentLoaded', function(){
                var el = document.getElementById('rewrite-preview');
                if (el && el.scrollIntoView) { el.scrollIntoView({behavior:'smooth', block:'center'}); }
              });
              </script>
            <?php } ?>
          <?php } else { ?>
            <div class="panel" style="margin:0;">
              <p style="color:var(--muted);">Select an article and click Rewrite to generate a preview.</p>
            </div>
          <?php } ?>
        </div>
      </div>
    </section>
  <?php } ?>
<?php
}

include __DIR__ . '/partials/layout.php';
?>
<script>
document.addEventListener('DOMContentLoaded', function() {
  // Add debug console for Gemini API rewrite
  const debugConsole = document.createElement('div');
  debugConsole.id = 'gemini-debug-console';
  debugConsole.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 400px;
    max-height: 300px;
    overflow-y: auto;
    background: rgba(0,0,0,0.8);
    color: #0f0;
    padding: 10px;
    border-radius: 5px;
    font-family: monospace;
    z-index: 9999;
    display: none;
  `;
  document.body.appendChild(debugConsole);

  // Debug logging function
  function debugLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.style.marginBottom = '5px';
    logEntry.style.color = type === 'error' ? '#f00' : '#0f0';
    logEntry.textContent = `[${timestamp}] ${message}`;
    debugConsole.appendChild(logEntry);
    debugConsole.style.display = 'block';
    debugConsole.scrollTop = debugConsole.scrollHeight;
  }

  // Toggle debug console
  const debugToggle = document.createElement('button');
  debugToggle.textContent = '🐞 Debug';
  debugToggle.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    background: #333;
    color: #0f0;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
  `;
  document.body.appendChild(debugToggle);

  debugToggle.addEventListener('click', function() {
    const console = document.getElementById('gemini-debug-console');
    console.style.display = console.style.display === 'none' ? 'block' : 'none';
  });

  // Intercept form submissions for rewrite
  const rewriteForms = document.querySelectorAll('form[id^="rewrite-form-"]');
  rewriteForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const formId = this.querySelector('.rewrite-btn').dataset.formId;
      debugLog(`Attempting to rewrite article #${formId}`, 'info');

      // Capture form data
      const title = this.querySelector('input[name="title"]').value;
      const summary = this.querySelector('input[name="summary"]').value;
      const link = this.querySelector('input[name="link"]').value;

      debugLog(`Title: ${title}`, 'info');
      debugLog(`Summary Length: ${summary.length} chars`, 'info');
      debugLog(`Source Link: ${link}`, 'info');
    });
  });

  // Capture PHP errors and warnings
  <?php 
  // Collect any PHP errors or messages
  $phpErrors = array_merge($errors, $messages);
  if (!empty($phpErrors)) {
    echo "debugLog('PHP Errors/Messages:', 'error');";
    foreach ($phpErrors as $error) {
      echo "debugLog('" . addslashes($error) . "', 'error');";
    }
  }
  ?>

  // Capture AJAX/fetch errors (if implemented later)
  window.addEventListener('error', function(event) {
    debugLog(`Uncaught Error: ${event.message} at ${event.filename}:${event.lineno}`, 'error');
  });
});
</script>