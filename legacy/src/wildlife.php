<?php
require_once 'config.php';
require_once 'includes/header.php';

// Get filter parameters
$district = isset($_GET['district']) ? $_GET['district'] : '';
$season = isset($_GET['season']) ? $_GET['season'] : '';
$term = isset($_GET['term']) ? $_GET['term'] : '';

try {
    // Use $pdo from config.php

    // Fetch all districts for filter
    $districts = $pdo->query("SELECT DISTINCT district FROM wildlife ORDER BY district")->fetchAll(PDO::FETCH_COLUMN);
    // Fetch all seasons for filter
    $seasons = $pdo->query("SELECT DISTINCT best_season FROM wildlife ORDER BY best_season")->fetchAll(PDO::FETCH_COLUMN);

    // Build query with filters
    $where_conditions = [];
    $params = [];

    if ($district) {
        $where_conditions[] = "district = :district";
        $params[':district'] = $district;
    }

    if ($season) {
        $where_conditions[] = "best_season = :season";
        $params[':season'] = $season;
    }

    if ($term) {
        $where_conditions[] = "(name LIKE :term OR description LIKE :term)";
        $params[':term'] = "%$term%";
    }

    $where_clause = $where_conditions ? 'WHERE ' . implode(' AND ', $where_conditions) : '';
    
    // Fetch wildlife listings
    $sql = "SELECT * FROM wildlife $where_clause ORDER BY name";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $wildlife_listings = $stmt->fetchAll();

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    $error_message = "Database connection failed. Please try again later.";
}
?>

<!-- Full-screen Hero Section -->
<header class="relative min-h-[70vh] flex items-center justify-center">
    <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-black opacity-50"></div>
        <img 
            src="assets/images/hero.jpg" 
            alt="Wildlife in Assam" 
            class="w-full h-full object-cover"
        >
    </div>

    <div class="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Wildlife Sanctuaries
        </h1>
        <p class="text-xl md:text-2xl text-gray-200 mb-12">
            Discover Assam's rich biodiversity and majestic wildlife
        </p>

        <!-- Search Bar -->
        <div class="max-w-3xl mx-auto relative group">
            <form action="" method="GET" class="relative">
                <input 
                    type="text" 
                    name="term"
                    value="<?= htmlspecialchars($term) ?>"
                    placeholder="Search wildlife sanctuaries..." 
                    class="w-full pl-12 pr-4 py-5 rounded-full text-lg border-2 border-transparent focus:border-green-500 focus:outline-none shadow-2xl bg-white/95 backdrop-blur-sm transition duration-300"
                >
                <button type="submit" class="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition duration-300">
                    Search
                </button>
            </form>
        </div>

        <!-- Quick Stats -->
        <div class="mt-12 flex flex-wrap justify-center gap-8">
            <div class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
                <span class="font-bold">5+</span> National Parks
            </div>
            <div class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
                <span class="font-bold">2000+</span> Species
            </div>
            <div class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
                <span class="font-bold">15+</span> Wildlife Sanctuaries
            </div>
        </div>
    </div>
</header>

<!-- Filters Section with Glassmorphism -->
<div class="sticky top-0 z-20 bg-white/80 backdrop-blur-md shadow-md py-6 border-b border-gray-200/50">
    <div class="container mx-auto px-4">
        <form action="" method="GET" class="flex flex-wrap gap-4 items-center">
            <!-- District Filter -->
            <div class="flex-1 min-w-[200px]">
                <select name="district" class="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-green-500 bg-white/80 backdrop-blur-sm">
                    <option value="">All Districts</option>
                    <?php foreach ($districts as $d): ?>
                        <option value="<?= htmlspecialchars($d) ?>" <?= $district === $d ? 'selected' : '' ?>>
                            <?= htmlspecialchars($d) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <!-- Season Filter -->
            <div class="flex-1 min-w-[200px]">
                <select name="season" class="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-green-500 bg-white/80 backdrop-blur-sm">
                    <option value="">All Seasons</option>
                    <?php foreach ($seasons as $s): ?>
                        <option value="<?= htmlspecialchars($s) ?>" <?= $season === $s ? 'selected' : '' ?>>
                            <?= htmlspecialchars($s) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <!-- Apply Filters Button -->
            <button type="submit" class="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition duration-300 min-w-[120px]">
                Filter
            </button>

            <!-- Clear Filters Link -->
            <?php if ($district || $season || $term): ?>
                <a href="wildlife.php" class="text-gray-600 hover:text-gray-800 px-4 py-3">
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
            <?php if (empty($wildlife_listings)): ?>
                <div class="text-center py-12">
                    <div class="text-gray-400 text-6xl mb-4">🦁</div>
                    <p class="text-gray-600 text-xl">No wildlife locations found matching your criteria.</p>
                    <a href="wildlife.php" class="inline-block mt-4 text-green-600 hover:text-green-700">View all locations →</a>
                </div>
            <?php else: ?>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <?php foreach ($wildlife_listings as $listing): ?>
                        <div class="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                            <div class="relative h-64 overflow-hidden">
                                <?php 
                                $images = explode(',', $listing['image_urls']);
                                $main_image = $images[0] ?? 'default-wildlife.jpg';
                                ?>
                                <img 
                                    src="assets/images/<?= htmlspecialchars($main_image) ?>" 
                                    alt="<?= htmlspecialchars($listing['name']) ?>" 
                                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                >
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                                <div class="absolute bottom-0 left-0 right-0 p-6">
                                    <?php
                                        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $listing['name']), '-'));
                                        $detailUrl = "/wildlife/{$slug}-{$listing['id']}";
                                    ?>
                                    <h3 class="text-white text-2xl font-bold mb-2">
                                        <a href="<?= htmlspecialchars($detailUrl) ?>" class="hover:underline text-green-200 hover:text-green-400">
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
                                    <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                        <?= htmlspecialchars($listing['best_season']) ?>
                                    </span>
                                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                        ₹<?= htmlspecialchars($listing['entry_fee']) ?>
                                    </span>
                                </div>
                                <p class="text-gray-600 mb-4 line-clamp-2">
                                    <?= htmlspecialchars($listing['description']) ?>
                                </p>
                                <div class="flex items-center justify-between">
                                    <div class="text-sm text-gray-600">
                                        <svg class="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        <?= htmlspecialchars($listing['opening_hours']) ?>
                                    </div>
                                    <?php
                                    // Create slug from name
                                    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $listing['name']), '-'));
                                    ?>
                                    <a 
                                        href="/wildlife/<?= $slug . '-' . $listing['id'] ?>" 
                                        class="inline-flex items-center text-green-600 hover:text-green-700 font-semibold"
                                    >
                                        Explore
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

<?php require_once 'includes/footer.php'; ?>