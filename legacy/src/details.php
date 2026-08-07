<?php
require_once 'config.php';
require_once 'includes/header.php';

// Validate and get ID
$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($id <= 0) {
    http_response_code(404);
    echo '<div class="container mx-auto px-4 py-24 text-center"><h1 class="text-3xl font-semibold">Invalid or missing item.</h1><a href="culture.php" class="inline-block mt-6 text-blue-600 hover:text-blue-700">Back to Culture</a></div>';
    require_once 'includes/footer.php';
    exit;
}

try {
    // Use $pdo from config.php (already connected)
    $stmt = $pdo->prepare('SELECT * FROM culture WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $item = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$item) {
        http_response_code(404);
        echo '<div class="container mx-auto px-4 py-24 text-center"><h1 class="text-3xl font-semibold">Item not found.</h1><a href="culture.php" class="inline-block mt-6 text-blue-600 hover:text-blue-700">Back to Culture</a></div>';
        require_once 'includes/footer.php';
        exit;
    }

    // Prepare images: comma-separated list
    $images = array_filter(array_map('trim', explode(',', (string)($item['image_urls'] ?? ''))));
    $primaryRaw = $images[0] ?? '';

    // Build hero image src with Unsplash fallback (culture-themed)
    $hero_fallback = 'https://images.unsplash.com/photo-1505764706515-aa95265c5abc?q=80&w=1600&auto=format&fit=crop';
    if ($primaryRaw === '' || strtolower($primaryRaw) === 'null') {
        $hero_src = $hero_fallback;
    } else {
        if (preg_match('/^https?:\/\//i', $primaryRaw)) {
            $hero_src = $primaryRaw;
        } else {
            $hero_src = 'assets/images/' . ltrim($primaryRaw, '/');
        }
    }

    // Prepare gallery items (limit to 6) and auto-fill with Unsplash placeholders
    $gallery = [];
    foreach ($images as $idx => $raw) {
        if ($idx > 5) break;
        if ($raw === '' || strtolower($raw) === 'null') continue;
        if (preg_match('/^https?:\/\//i', $raw)) {
            $gallery[] = $raw;
        } else {
            $gallery[] = 'assets/images/' . ltrim($raw, '/');
        }
    }
    // Curated Unsplash placeholders
    $gallery_placeholders = [
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1520975922284-8b456906c813?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=1200&auto=format&fit=crop'
    ];
    while (count($gallery) < 3 && !empty($gallery_placeholders)) {
        $gallery[] = array_shift($gallery_placeholders);
    }
    // If still less than 6, fill up to 6 for balance
    while (count($gallery) < 6 && !empty($gallery_placeholders)) {
        $gallery[] = array_shift($gallery_placeholders);
    }

    // Helpers for safe fields
    $name = htmlspecialchars($item['name'] ?? '');
    $type = htmlspecialchars($item['type'] ?? '');
    $district = htmlspecialchars($item['district'] ?? '');
    $location = htmlspecialchars($item['location'] ?? '');
    $desc = htmlspecialchars($item['description'] ?? '');
    $cultural = htmlspecialchars($item['cultural_importance'] ?? '');
    $historical = htmlspecialchars($item['historical_significance'] ?? '');
    $contact = htmlspecialchars($item['contact_info'] ?? '');
    $start = !empty($item['start_date']) ? date('d M Y', strtotime($item['start_date'])) : '';
    $end = !empty($item['end_date']) ? date('d M Y', strtotime($item['end_date'])) : '';
} catch (PDOException $e) {
    error_log('Details fetch error: ' . $e->getMessage());
    echo '<div class="container mx-auto px-4 py-24 text-center"><h1 class="text-3xl font-semibold">Something went wrong.</h1><a href="culture.php" class="inline-block mt-6 text-blue-600 hover:text-blue-700">Back to Culture</a></div>';
    require_once 'includes/footer.php';
    exit;
}
?>

<!-- Hero Section -->
<header class="relative min-h-[60vh] flex items-end">
  <div class="absolute inset-0">
    <img src="<?= htmlspecialchars($hero_src) ?>" alt="<?= $name ?>" class="w-full h-full object-cover">
    <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent"></div>
  </div>
  <div class="relative z-10 container mx-auto px-4 py-14">
    <a href="culture.php" class="inline-flex items-center text-white/90 hover:text-white mb-6">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      Back to Culture
    </a>
    <div class="max-w-4xl">
      <div class="flex flex-wrap items-center gap-3 mb-4">
        <?php if ($type): ?><span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"><?= $type ?></span><?php endif; ?>
        <?php if ($district): ?><span class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium"><?= $district ?></span><?php endif; ?>
        <?php if ($start || $end): ?><span class="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"><?= $start ?><?= $end ? ' – ' . $end : '' ?></span><?php endif; ?>
      </div>
      <h1 class="text-4xl md:text-6xl font-bold text-white leading-tight mb-3"><?= $name ?></h1>
      <?php if ($location): ?><p class="text-white/90 text-lg">Location: <?= $location ?></p><?php endif; ?>
    </div>
  </div>
</header>

<!-- Content -->
<main class="bg-white">
  <div class="container mx-auto px-4 py-12 grid lg:grid-cols-3 gap-10">
    <!-- Left: Main content -->
    <section class="lg:col-span-2 space-y-10">
      <?php if ($desc): ?>
      <div class="bg-white rounded-2xl shadow-lg/40 shadow-sm border border-gray-100 p-7 md:p-8">
        <h2 class="text-2xl font-semibold mb-1">About</h2>
        <p class="text-sm text-gray-500 mb-5">Overview</p>
        <p class="text-gray-700 leading-relaxed"><?= nl2br($desc) ?></p>
      </div>
      <?php endif; ?>

      <?php if ($cultural || $historical): ?>
      <div class="grid md:grid-cols-2 gap-6">
        <?php if ($cultural): ?>
        <div class="bg-white rounded-2xl shadow-lg/40 shadow-sm border border-gray-100 p-7 md:p-8">
          <h3 class="text-xl font-semibold mb-1">Cultural Importance</h3>
          <p class="text-sm text-gray-500 mb-5">Traditions & Values</p>
          <p class="text-gray-700 leading-relaxed"><?= nl2br($cultural) ?></p>
        </div>
        <?php endif; ?>
        <?php if ($historical): ?>
        <div class="bg-white rounded-2xl shadow-lg/40 shadow-sm border border-gray-100 p-7 md:p-8">
          <h3 class="text-xl font-semibold mb-1">Historical Significance</h3>
          <p class="text-sm text-gray-500 mb-5">Legacy & Heritage</p>
          <p class="text-gray-700 leading-relaxed"><?= nl2br($historical) ?></p>
        </div>
        <?php endif; ?>
      </div>
      <?php endif; ?>

      <!-- Gallery -->
      <div class="bg-white rounded-2xl shadow-lg/40 shadow-sm border border-gray-100 p-7 md:p-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-2xl font-semibold mb-1">Gallery</h2>
            <p class="text-sm text-gray-500">Photos from the event</p>
          </div>
          <?php if (!empty($gallery)): ?>
          <span class="text-sm text-gray-500"><?= count($gallery) ?> photos</span>
          <?php endif; ?>
        </div>
        <?php if (!empty($gallery)): ?>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <?php foreach ($gallery as $g): ?>
          <img src="<?= htmlspecialchars($g) ?>" alt="<?= $name ?> photo" class="w-full h-40 md:h-48 object-cover rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
          <?php endforeach; ?>
        </div>
        <?php else: ?>
        <img src="<?= htmlspecialchars($hero_fallback) ?>" alt="<?= $name ?>" class="w-full h-64 object-cover rounded-2xl shadow-sm">
        <p class="text-gray-500 text-sm mt-3">No additional photos available.</p>
        <?php endif; ?>
      </div>
    </section>

    <!-- Right: Info card -->
    <aside class="space-y-6">
      <div class="bg-white rounded-2xl shadow-lg/40 shadow-sm border border-gray-100 p-7 md:p-8">
        <h3 class="text-xl font-semibold mb-4">Event Details</h3>
        <ul class="space-y-3 text-gray-700">
          <?php if ($type): ?><li><span class="text-gray-500">Type:</span> <span class="font-medium"><?= $type ?></span></li><?php endif; ?>
          <?php if ($district): ?><li><span class="text-gray-500">District:</span> <span class="font-medium"><?= $district ?></span></li><?php endif; ?>
          <?php if ($location): ?><li><span class="text-gray-500">Location:</span> <span class="font-medium"><?= $location ?></span></li><?php endif; ?>
          <?php if ($start || $end): ?><li><span class="text-gray-500">Dates:</span> <span class="font-medium"><?= $start ?><?= $end ? ' – ' . $end : '' ?></span></li><?php endif; ?>
          <?php if (!empty($item['status'])): ?><li><span class="text-gray-500">Status:</span> <span class="font-medium"><?= htmlspecialchars($item['status']) ?></span></li><?php endif; ?>
        </ul>
        <?php if ($contact): ?>
        <div class="mt-6 p-4 bg-blue-50 rounded-xl">
          <p class="text-sm text-gray-600">Contact</p>
          <p class="font-medium text-gray-800 break-words mt-1"><?= $contact ?></p>
        </div>
        <?php endif; ?>
        <a href="culture.php" class="mt-6 inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          Back to Culture
        </a>
      </div>
    </aside>
  </div>

  <!-- Detailed Description Section -->
  <div class="container mx-auto px-4 pb-14">
    <section class="bg-white rounded-2xl shadow-lg/40 shadow-sm border border-gray-100 p-7 md:p-8">
      <h2 class="text-2xl font-semibold mb-1">Detailed Description</h2>
      <p class="text-sm text-gray-500 mb-5">In-depth information</p>
      <?php if (!empty($desc)): ?>
        <div class="prose max-w-none prose-p:leading-7 prose-headings:mt-6 prose-headings:mb-3">
          <?= nl2br($desc) ?>
        </div>
      <?php else: ?>
        <p class="text-gray-600">No detailed description is available for this listing yet.</p>
      <?php endif; ?>
    </section>
  </div>
</main>

<?php require_once 'includes/footer.php'; ?>