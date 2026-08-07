<?php
function fetchHtml($url)
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; Googlebot/2.1)',
        CURLOPT_TIMEOUT => 20,
    ]);
    $html = curl_exec($ch);
    curl_close($ch);
    return $html ?: '';
}

function extractTOIContent($html)
{
    if (!preg_match_all('/<script type="application\/ld\+json">(.*?)<\/script>/s', $html, $matches)) {
        return '';
    }

    foreach ($matches[1] as $json) {
        $data = json_decode(trim($json), true);
        if (!$data) continue;

        // TOI articleBody exists here
        if (isset($data['articleBody'])) {
            return trim($data['articleBody']);
        }
    }
    return '';
}

function extractGenericContent($html)
{
    libxml_use_internal_errors(true);
    $dom = new DOMDocument();
    $dom->loadHTML($html);
    libxml_clear_errors();

    $xpath = new DOMXPath($dom);
    $nodes = $xpath->query('//article//p | //main//p');

    $text = '';
    foreach ($nodes as $p) {
        $t = trim($p->textContent);
        if (strlen($t) > 40) {
            $text .= $t . "\n\n";
        }
    }
    return trim($text);
}

$result = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $url = trim($_POST['url'] ?? '');

    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        $result = 'Invalid URL';
    } else {
        $html = fetchHtml($url);

        if (strpos($url, 'timesofindia.indiatimes.com') !== false) {
            $result = extractTOIContent($html);
        }

        if (!$result) {
            $result = extractGenericContent($html);
        }

        if (!$result) {
            $result = 'Article content blocked by publisher.';
        }
    }
}
?>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Extract Webpage Content</title>
<style>
body { font-family: Arial; margin: 40px; }
input, button { padding: 10px; width: 100%; margin-top: 10px; }
textarea { width: 100%; height: 400px; margin-top: 20px; }
</style>
</head>
<body>

<h2>Extract Webpage Content</h2>

<form method="post">
    <input type="url" name="url" required
           value="<?= htmlspecialchars($_POST['url'] ?? '') ?>">
    <button type="submit">Extract Content</button>
</form>

<?php if ($result): ?>
<h3>Extracted Content</h3>
<textarea readonly><?= htmlspecialchars($result) ?></textarea>
<?php endif; ?>

</body>
</html>
