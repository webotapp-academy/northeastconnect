<?php
require_once 'config.php';
require_once 'includes/header.php';

// Get filter parameters
$type = isset($_GET['type']) ? $_GET['type'] : '';
$term = isset($_GET['term']) ? $_GET['term'] : '';

try {
     
    // Fetch all types for filter
    $types = $pdo->query("SELECT DISTINCT type FROM culture WHERE type IS NOT NULL AND type != '' ORDER BY type")->fetchAll(PDO::FETCH_COLUMN);

    // Build query with filters
    $where_conditions = [];
    $params = [];

    if ($type) {
        $where_conditions[] = "type = :type";
        $params[':type'] = $type;
    }

    if ($term) {
        $where_conditions[] = "(name LIKE :term OR description LIKE :term)";
        $params[':term'] = "%$term%";
    }

    $where_clause = $where_conditions ? 'WHERE ' . implode(' AND ', $where_conditions) : '';
    
    // Fetch culture listings
    $sql = "SELECT * FROM culture $where_clause ORDER BY start_date DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $culture_listings = $stmt->fetchAll();

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    $error_message = "Database connection failed. Please try again later.";
}
?>

<!-- Full-screen Hero Section -->
<header class="relative min-h-[70vh] flex items-center justify-center">
    <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-r from-green-900 to-green-600 opacity-80"></div>
        <img 
            src="assets/images/hero.jpg" 
            alt="Culture of Assam" 
            class="w-full h-full object-cover"
        >
    </div>

    <div class="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Cultural Heritage
        </h1>
        <p class="text-xl md:text-2xl text-gray-200 mb-12">
            Experience the vibrant traditions and festivals of Assam
        </p>

        <!-- Search Bar -->
        <div class="max-w-3xl mx-auto relative group">
            <form action="" method="GET" class="relative">
                <input 
                    type="text" 
                    name="term"
                    value="<?= htmlspecialchars($term) ?>"
                    placeholder="Search cultural events and festivals..." 
                    class="w-full pl-12 pr-4 py-5 rounded-full text-lg border-2 border-transparent focus:border-blue-500 focus:outline-none shadow-2xl bg-white/95 backdrop-blur-sm transition duration-300"
                >
                <button type="submit" class="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition duration-300">
                    Search
                </button>
            </form>
        </div>

        <!-- Quick Stats -->
        <div class="mt-12 flex flex-wrap justify-center gap-8">
            <div class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
                <span class="font-bold">50+</span> Festivals
            </div>
            <div class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
                <span class="font-bold">20+</span> Dance Forms
            </div>
            <div class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
                <span class="font-bold">100+</span> Cultural Events
            </div>
        </div>
    </div>
</header>

<!-- Filters Section with Glassmorphism -->
<div class="sticky top-0 z-20 bg-white/80 backdrop-blur-md shadow-md py-6 border-b border-gray-200/50">
    <div class="container mx-auto px-4">
        <form action="" method="GET" class="flex flex-wrap gap-4 items-center">
            <!-- Type Filter -->
            <div class="flex-1 min-w-[200px]">
                <select name="type" class="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm">
                    <option value="">All Types</option>
                    <?php foreach ($types as $t): ?>
                        <option value="<?= htmlspecialchars($t) ?>" <?= $type === $t ? 'selected' : '' ?>>
                            <?= htmlspecialchars($t) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <!-- Apply Filters Button -->
            <button type="submit" class="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition duration-300 min-w-[120px]">
                Filter
            </button>

            <!-- Clear Filters Link -->
            <?php if ($type || $term): ?>
                <a href="culture.php" class="text-gray-600 hover:text-gray-800 px-4 py-3">
                    Clear All
                </a>
            <?php endif; ?>
        </form>
    </div>
</div>

<!-- Listings Section -->
<div class="bg-gray-50 py-16">
    <div class="container mx-auto px-4">
        <?php if (isset($error_message)): ?>
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
                <?= htmlspecialchars($error_message) ?>
            </div>
        <?php else: ?>
            <?php if (empty($culture_listings)): ?>
                <div class="text-center py-12">
                    <div class="text-gray-400 text-6xl mb-4">🎭</div>
                    <p class="text-gray-600 text-xl">No cultural events found matching your criteria.</p>
                    <a href="culture.php" class="inline-block mt-4 text-blue-600 hover:text-blue-700">View all events →</a>
                </div>
            <?php else: ?>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <?php foreach ($culture_listings as $listing): ?>
                        <div class="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                            <div class="relative h-64 overflow-hidden">
                                <?php 
                                $images = explode(',', $listing['image_urls']);
                                $raw = trim($images[0] ?? '');
                                // Decide image source: Unsplash placeholder if empty, else local or absolute URL
                                if ($raw === '' || strtolower($raw) === 'null') {
                                    $img_src = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop';
                                } else {
                                    // If it looks like an absolute URL (http/https), use as-is; otherwise serve from assets/images/
                                    if (preg_match('/^https?:\/\//i', $raw)) {
                                        $img_src = $raw;
                                    } else {
                                        $img_src = 'assets/images/' . ltrim($raw, '/');
                                    }
                                }
                                ?>
                                <img 
                                    src="<?= htmlspecialchars($img_src) ?>" 
                                    alt="<?= htmlspecialchars($listing['name']) ?>" 
                                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                >
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                                <div class="absolute bottom-0 left-0 right-0 p-6">
                                    <h3 class="text-white text-2xl font-bold mb-2">
                                        <a href="details.php?id=<?= $listing['id'] ?>" class="hover:underline text-blue-200 hover:text-blue-400">
                                            <?= htmlspecialchars($listing['name']) ?>
                                        </a>
                                    </h3>
                                    <p class="text-white/90 flex items-center">
                                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        </svg>
                                        <?= htmlspecialchars($listing['district']) ?>
                                    </p>
                                </div>
                            </div>
                            <div class="p-6">
                                <div class="flex gap-2 mb-4">
                                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                        <?= htmlspecialchars($listing['type']) ?>
                                    </span>
                                    <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                        <?= date('d M Y', strtotime($listing['start_date'])) ?>
                                    </span>
                                </div>
                                <p class="text-gray-600 mb-4 line-clamp-2">
                                    <?= htmlspecialchars($listing['description']) ?>
                                </p>
                                <div class="flex items-center justify-between">
                                    <div class="text-sm text-gray-600">
                                        <svg class="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                        </svg>
                                        <?= date('d M', strtotime($listing['start_date'])) ?> - <?= date('d M', strtotime($listing['end_date'])) ?>
                                    </div>
                                    <a 
                                        href="details.php?id=<?= $listing['id'] ?>" 
                                        class="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
                                    >
                                        Learn More
                                        <svg class="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        <?php endif; ?>
    </div>
</div>

<?php 
// Include footer
require_once 'includes/footer.php'; 
?>