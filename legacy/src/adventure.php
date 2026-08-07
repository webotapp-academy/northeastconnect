<?php
require_once 'config.php';
require_once 'includes/header.php';

// Get filter parameters
$district = isset($_GET['district']) ? $_GET['district'] : '';
$type = isset($_GET['type']) ? $_GET['type'] : '';
$term = isset($_GET['term']) ? $_GET['term'] : '';

// Pagination
$perPage = 12; // items per page
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$offset = ($page - 1) * $perPage;

try {
    // Use the PDO connection from config.php
    // $pdo is already defined by require_once 'config.php';

    // Fetch all districts for filter
    $districts = $pdo->query("SELECT DISTINCT district FROM adventure ORDER BY district")->fetchAll(PDO::FETCH_COLUMN);
    
    // Fetch all types for filter
    $types = $pdo->query("SELECT DISTINCT type FROM adventure ORDER BY type")->fetchAll(PDO::FETCH_COLUMN);

    // Build query with filters
    $where_conditions = [];
    $params = [];

    if ($district) {
        $where_conditions[] = "district = :district";
        $params[':district'] = $district;
    }

    if ($type) {
        $where_conditions[] = "type = :type";
        $params[':type'] = $type;
    }

    if ($term) {
        $where_conditions[] = "(name LIKE :term OR description LIKE :term)";
        $params[':term'] = "%$term%";
    }

    $where_clause = $where_conditions ? 'WHERE ' . implode(' AND ', $where_conditions) : '';
    
    // Count total results for this search
    $count_sql = "SELECT COUNT(*) as total FROM adventure $where_clause";
    $count_stmt = $pdo->prepare($count_sql);
    $count_stmt->execute($params);
    $total_results = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Fetch adventure listings
    $sql = "SELECT * FROM adventure $where_clause ORDER BY name LIMIT :limit OFFSET :offset";
    $stmt = $pdo->prepare($sql);
    
    // Bind params first
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v);
    }
    $stmt->bindValue(':limit',  $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset,  PDO::PARAM_INT);
    
    $stmt->execute();
    $adventure_listings = $stmt->fetchAll();

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    $error_message = "Database connection failed. Please try again later.";
}
?>

<!-- Full-screen Hero Section -->
<header class="relative min-h-[70vh] flex items-center justify-center">
    <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 opacity-80"></div>
        <img 
            src="assets/images/hero.jpg" 
            alt="Adventures in Assam" 
            class="w-full h-full object-cover"
        >
    </div>

    <div class="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Adventure Experiences
        </h1>
        <p class="text-xl md:text-2xl text-gray-200 mb-12">
            Explore thrilling adventures across the landscapes of Assam
        </p>

        <!-- Search Bar -->
        <div class="max-w-3xl mx-auto relative group">
            <form action="" method="GET" class="relative">
                <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
                <input 
                    type="text" 
                    name="term"
                    value="<?= htmlspecialchars($term) ?>"
                    placeholder="Search adventure activities..." 
                    class="w-full pl-12 pr-24 py-5 rounded-full text-lg border-2 border-transparent focus:border-orange-500 focus:outline-none shadow-2xl bg-white/95 backdrop-blur-sm transition duration-300"
                >
                <button type="submit" class="absolute right-3 top-1/2 transform -translate-y-1/2 bg-orange-600 text-white px-8 py-3 rounded-full hover:bg-orange-700 transition duration-300">
                    Search
                </button>
            </form>
        </div>

        <!-- Quick Stats -->
        <?php
        try {
            // Count unique types
            $type_count = $pdo->query("SELECT COUNT(DISTINCT type) AS count FROM adventure")->fetch(PDO::FETCH_ASSOC)['count'];
            
            // Count unique districts
            $district_count = $pdo->query("SELECT COUNT(DISTINCT district) AS count FROM adventure")->fetch(PDO::FETCH_ASSOC)['count'];
            
            // Total listings count
            $total_listings_count = $pdo->query("SELECT COUNT(*) AS count FROM adventure")->fetch(PDO::FETCH_ASSOC)['count'];
        } catch (PDOException $e) {
            $type_count = 20;
            $district_count = 50;
            $total_listings_count = 100;
        }
        ?>
        <div class="mt-12 flex flex-wrap justify-center gap-8">
            <div class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
                <span class="font-bold"><?= $type_count ?>+</span> Adventure Types
            </div>
            <div class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
                <span class="font-bold"><?= $district_count ?>+</span> Locations
            </div>
            <div class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
                <span class="font-bold"><?= $total_listings_count ?>+</span> Experiences
            </div>
        </div>
    </div>
</header>

<!-- Listings Section -->
<div class="bg-gray-50 py-16">
    <div class="container mx-auto px-4">
        <!-- Mobile Filter Toggle -->
        <button class="md:hidden mobile-filter-toggle" id="mobileFilterToggle">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
            </svg>
            Open Filters
        </button>

        <div class="flex flex-col md:flex-row">
            <!-- Sidebar Filters for Desktop -->
            <div class="hidden md:block w-1/4 pr-8">
                <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                    <h3 class="text-xl font-bold text-gray-800 mb-6 border-b pb-3">Filters</h3>
                    <form action="" method="GET">
                        <!-- Type Filter -->
                        <div class="mb-6">
                            <label class="block text-gray-700 font-semibold mb-2">Adventure Type</label>
                            <select name="type" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500">
                                <option value="">All Types</option>
                                <?php foreach ($types as $t): ?>
                                    <option value="<?= htmlspecialchars($t) ?>" <?= $type === $t ? 'selected' : '' ?>>
                                        <?= htmlspecialchars($t) ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <!-- District Filter -->
                        <div class="mb-6">
                            <label class="block text-gray-700 font-semibold mb-2">District</label>
                            <select name="district" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500">
                                <option value="">All Districts</option>
                                <?php foreach ($districts as $dist): ?>
                                    <option value="<?= htmlspecialchars($dist) ?>" <?= $district === $dist ? 'selected' : '' ?>>
                                        <?= htmlspecialchars($dist) ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <!-- Apply Filters Button -->
                        <div class="flex flex-col space-y-2">
                            <button type="submit" class="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition duration-300">
                                Apply Filters
                            </button>
                            <?php if ($type || $district || $term): ?>
                                <a href="adventure.php" class="text-center text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-lg">
                                    Clear Filters
                                </a>
                            <?php endif; ?>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Listings -->
            <div class="w-full md:w-3/4">
                <?php if (isset($error_message)): ?>
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
                        <?= htmlspecialchars($error_message) ?>
                    </div>
                <?php else: ?>
                    <?php if (empty($adventure_listings)): ?>
                        <div class="text-center py-12 bg-white rounded-2xl shadow-lg">
                            <div class="text-gray-400 text-6xl mb-4">🏔️</div>
                            <p class="text-gray-600 text-xl">No adventure activities found matching your criteria.</p>
                            <a href="adventure.php" class="inline-block mt-4 text-orange-600 hover:text-orange-700">View all adventures →</a>
                        </div>
                    <?php else: ?>
                        <div class="mb-6">
                            <h2 class="text-xl font-bold text-gray-800">
                                <?= $total_results ?> 
                                <?= $total_results == 1 ? 'Adventure' : 'Adventures' ?> 
                                <?= $term ? "matching \"" . htmlspecialchars($term) . "\"" : '' ?>
                            </h2>
                            <?php if ($type): ?>
                                <span class="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs mr-2 mt-2">
                                    Type: <?= htmlspecialchars($type) ?>
                                </span>
                            <?php endif; ?>
                            <?php if ($district): ?>
                                <span class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs mt-2">
                                    District: <?= htmlspecialchars($district) ?>
                                </span>
                            <?php endif; ?>
                        </div>
                        <div class="space-y-6">
                            <?php foreach ($adventure_listings as $listing): ?>
                                <div class="bg-white rounded-2xl shadow-lg overflow-hidden flex hover:shadow-xl transition-all duration-300">
                                    <!-- Image -->
                                    <div class="w-1/3 relative">
                                        <?php 
                                        $images = explode(',', $listing['image_urls'] ?? '');
                                        $main_image = trim($images[0] ?? '');
                                        
                                        if (empty($main_image) || $main_image === 'null') {
                                            $main_image = 'assets/images/default-adventure.jpg';
                                        } else {
                                            $main_image = "assets/images/{$main_image}";
                                        }
                                        ?>
                                        <img 
                                            src="<?= htmlspecialchars($main_image) ?>" 
                                            alt="<?= htmlspecialchars($listing['name']) ?>" 
                                            class="w-full h-48 object-cover"
                                        >
                                    </div>

                                    <!-- Content -->
                                    <div class="w-2/3 p-4 flex flex-col justify-between">
                                        <div>
                                            <div class="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 class="text-xl font-bold text-gray-800 mb-1">
                                                        <?php
                                                            $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $listing['name']), '-'));
                                                            $detailUrl = "/adventure/{$slug}-{$listing['id']}";
                                                        ?>
                                                        <a href="<?= htmlspecialchars($detailUrl) ?>" class="hover:underline text-orange-600 hover:text-orange-700">
                                                            <?= htmlspecialchars($listing['name']) ?>
                                                        </a>
                                                    </h3>
                                                    <div class="flex items-center text-yellow-500 mb-1">
                                                        <?php 
                                                        $rating = 4.5; // Hardcoded for now
                                                        $full_stars = floor($rating);
                                                        $half_star = $rating - $full_stars >= 0.5;
                                                        for ($i = 1; $i <= 5; $i++) {
                                                            if ($i <= $full_stars) {
                                                                echo '<svg class="w-4 h-4 fill-current" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
                                                            } elseif ($half_star && $i == $full_stars + 1) {
                                                                echo '<svg class="w-4 h-4 fill-current" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292zM9.5 10.5c0 .414.336.75.75.75H11c.414 0 .75-.336.75-.75V7.5h2.25a.75.75 0 000-1.5h-3a.75.75 0 00-.75.75v4z"/></svg>';
                                                            } else {
                                                                echo '<svg class="w-4 h-4 fill-current text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
                                                            }
                                                        }
                                                        ?>
                                                        <span class="ml-1 text-gray-600 text-xs">(<?= $rating ?> / 5)</span>
                                                    </div>
                                                </div>
                                                <div class="flex gap-1">
                                                    <span class="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                                                        <?= htmlspecialchars($listing['type']) ?>
                                                    </span>
                                                    <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                        ₹<?= htmlspecialchars($listing['price']) ?>
                                                    </span>
                                                </div>
                                            </div>

                                            <div class="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                                                <div>
                                                    <div class="flex items-center text-gray-700 mb-1">
                                                        <svg class="w-4 h-4 mr-1 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                        </svg>
                                                        <span class="text-xs font-medium">Duration:</span>
                                                    </div>
                                                    <p class="pl-5 text-gray-600 text-xs">
                                                        <?= htmlspecialchars($listing['duration']) ?>
                                                    </p>
                                                </div>
                                                <div>
                                                    <div class="flex items-center text-gray-700 mb-1">
                                                        <svg class="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                        </svg>
                                                        <span class="text-xs font-medium">Location:</span>
                                                    </div>
                                                    <p class="pl-5 text-gray-600 text-xs truncate">
                                                        <?= htmlspecialchars($listing['district']) ?>
                                                    </p>
                                                </div>
                                                <?php if (!empty($listing['difficulty_level'])): ?>
                                                <div>
                                                    <div class="flex items-center text-gray-700 mb-1">
                                                        <svg class="w-4 h-4 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                                        </svg>
                                                        <span class="text-xs font-medium">Difficulty:</span>
                                                    </div>
                                                    <p class="pl-5 text-gray-600 text-xs">
                                                        <?= htmlspecialchars($listing['difficulty_level']) ?>
                                                    </p>
                                                </div>
                                                <?php endif; ?>
                                                <?php if (!empty($listing['best_season'])): ?>
                                                <div>
                                                    <div class="flex items-center text-gray-700 mb-1">
                                                        <svg class="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
                                                        </svg>
                                                        <span class="text-xs font-medium">Best Season:</span>
                                                    </div>
                                                    <p class="pl-5 text-gray-600 text-xs truncate">
                                                        <?= htmlspecialchars($listing['best_season']) ?>
                                                    </p>
                                                </div>
                                                <?php endif; ?>
                                            </div>
                                        </div>

                                        <div class="flex justify-between items-center">
                                            <div class="flex items-center text-gray-600 text-xs">
                                                <!-- Description snippet -->
                                                <span class="line-clamp-1"><?= htmlspecialchars($listing['description']) ?></span>
                                            </div>
                                             <?php
                                                $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $listing['name']), '-'));
                                             ?>
                                             <a 
                                                href="/adventure/<?= $slug . '-' . $listing['id'] ?>" 
                                                class="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold text-xs"
                                            >
                                                View Details
                                                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                
                <!-- Pagination -->
                <?php if (!$error_message && $total_results > $perPage): ?>
                    <?php
                        $totalPages = (int)ceil($total_results / $perPage);
                        function buildPageUrl($pageNum) {
                            $query = $_GET;
                            $query['page'] = $pageNum;
                            return 'adventure.php?' . http_build_query($query);
                        }
                    ?>
                    <div class="mt-10 flex justify-center space-x-2 text-sm">
                        <?php if ($page > 1): ?>
                            <a href="<?= htmlspecialchars(buildPageUrl($page-1)) ?>" class="px-3 py-2 rounded-lg border bg-white hover:bg-gray-100">Prev</a>
                        <?php endif; ?>

                        <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                            <a href="<?= htmlspecialchars(buildPageUrl($i)) ?>" class="px-3 py-2 rounded-lg border <?= $i==$page ? 'bg-orange-600 text-white' : 'bg-white hover:bg-gray-100' ?>"><?= $i ?></a>
                        <?php endfor; ?>

                        <?php if ($page < $totalPages): ?>
                            <a href="<?= htmlspecialchars(buildPageUrl($page+1)) ?>" class="px-3 py-2 rounded-lg border bg-white hover:bg-gray-100">Next</a>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<!-- Mobile Filter Toggle Styles -->
<style>
    @media (max-width: 767px) {
        .mobile-filter-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .mobile-filter-overlay.open {
            opacity: 1;
            visibility: visible;
        }
        .mobile-filter-popup {
            background: white;
            width: 92vw;
            max-width: 370px;
            border-radius: 18px;
            padding: 36px 20px 28px 20px;
            transform: scale(0.7);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            position: relative;
            text-align: center;
        }
        .mobile-filter-overlay.open .mobile-filter-popup {
            transform: scale(1);
            opacity: 1;
        }
        .mobile-filter-popup .filter-title {
            font-size: 1.6rem;
            font-weight: 700;
            margin-bottom: 22px;
            color: #1f2937;
        }
        .mobile-filter-popup .filter-close-btn {
            position: absolute;
            top: 18px;
            right: 18px;
            cursor: pointer;
            color: #6b7280;
            background: none;
            border: none;
            font-size: 2rem;
            transition: color 0.2s;
        }
        .mobile-filter-popup .filter-close-btn:hover {
            color: #ea580c; /* Orange-600 */
        }
        .mobile-filter-popup select {
            width: 100%;
            padding: 13px;
            background-color: #f3f4f6;
            color: #111827;
            border-radius: 10px;
            margin-bottom: 16px;
            border: 1px solid #e5e7eb;
            font-size: 1rem;
        }
        .mobile-filter-popup button[type="submit"] {
            width: 100%;
            padding: 13px;
            background-color: #ea580c; /* Orange-600 */
            color: white;
            border-radius: 10px;
            font-weight: 500;
            transition: background-color 0.2s;
        }
        .mobile-filter-popup button[type="submit"]:hover {
            background-color: #c2410c; /* Orange-700 */
        }
        .mobile-filter-toggle {
            display: flex !important;
            align-items: center;
            background-color: #ea580c !important; /* Orange-600 */
            color: white !important;
            padding: 10px 15px !important;
            border-radius: 50px !important;
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            z-index: 1000 !important;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
            transition: transform 0.2s !important;
        }
        .mobile-filter-toggle:active {
            transform: scale(0.95) !important;
        }
        .mobile-filter-toggle svg {
            width: 24px !important;
            height: 24px !important;
            margin-right: 8px !important;
        }
    }
    @media (min-width: 768px) {
        .mobile-filter-overlay { display: none !important; }
        .mobile-filter-toggle { display: none !important; }
    }
</style>

<!-- Mobile Filter Overlay HTML -->
<div class="mobile-filter-overlay" role="dialog" aria-modal="true">
    <div class="mobile-filter-popup relative">
        <button class="filter-close-btn" onclick="toggleMobileFilter()" aria-label="Close filter">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
        <div class="filter-title">Filters</div>
        <form action="" method="GET">
            <select name="type">
                <option value="">All Types</option>
                <?php foreach ($types as $t): ?>
                    <option value="<?= htmlspecialchars($t) ?>" <?= $type === $t ? 'selected' : '' ?>>
                        <?= htmlspecialchars($t) ?>
                    </option>
                <?php endforeach; ?>
            </select>

            <select name="district">
                <option value="">All Districts</option>
                <?php foreach ($districts as $dist): ?>
                    <option value="<?= htmlspecialchars($dist) ?>" <?= $district === $dist ? 'selected' : '' ?>>
                        <?= htmlspecialchars($dist) ?>
                    </option>
                <?php endforeach; ?>
            </select>

            <button type="submit">Apply Filters</button>
        </form>
    </div>
</div>

<script>
function toggleMobileFilter() {
    var overlay = document.querySelector('.mobile-filter-overlay');
    if (!overlay) return;
    overlay.classList.toggle('open');
    if (overlay.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

(function() {
    var filterToggle = document.getElementById('mobileFilterToggle');
    if (filterToggle) {
        filterToggle.addEventListener('click', toggleMobileFilter);
    }

    // Close filter when a link is clicked or outside popup
    var overlay = document.querySelector('.mobile-filter-overlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) toggleMobileFilter();
        });
    }
})();
</script>

<?php require_once 'includes/footer.php'; ?>