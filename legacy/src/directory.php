<?php
require_once 'config.php';
require_once 'includes/header.php';

// Get filter parameters
$category = isset($_GET['category']) ? $_GET['category'] : '';
$district = isset($_GET['district']) ? $_GET['district'] : '';

// Allow SEO-friendly slugs passed via RewriteRule (e.g., Yoga-Studio => Yoga Studio)
$category = str_replace('-', ' ', $category);
$district = str_replace('-', ' ', $district);


$term = isset($_GET['term']) ? $_GET['term'] : '';

// Pagination
$perPage = 12; // items per page
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$offset = ($page - 1) * $perPage;

try {
  
    // Fetch all districts for filter
    $districts = $pdo->query("SELECT DISTINCT district FROM directory ORDER BY district")->fetchAll(PDO::FETCH_COLUMN);

    // Build query with filters
    $where_conditions = [];
    $params = [];

    if ($category) {
        $where_conditions[] = "category = :category";
        $params[':category'] = $category;
    }

    if ($district) {
        $where_conditions[] = "district = :district";
        $params[':district'] = $district;
    }

    if ($term) {
        $where_conditions[] = "(
            business_name LIKE :term OR 
            description LIKE :term OR 
            category LIKE :term OR 
            subcategory LIKE :term OR 
            district LIKE :term OR 
            address LIKE :term
        )";
        $params[':term'] = "%$term%";
    }

    $where_clause = $where_conditions ? 'WHERE ' . implode(' AND ', $where_conditions) : '';
    
    // Count total results for this search
    $count_sql = "SELECT COUNT(*) as total FROM directory $where_clause";
    $count_stmt = $pdo->prepare($count_sql);
    $count_stmt->execute($params);
    $total_results = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Fetch directory listings
    $sql = "SELECT * FROM directory $where_clause ORDER BY id DESC LIMIT :limit OFFSET :offset";
    $stmt = $pdo->prepare($sql);

    // Bind params first
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v);
    }
    $stmt->bindValue(':limit',  $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset,  PDO::PARAM_INT);

    $stmt->execute();
    $directory_listings = $stmt->fetchAll();

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    $error_message = "Database connection failed. Please try again later.";
}
?>

<!-- Full-screen Hero Section -->
<header class="relative min-h-[70vh] flex items-center justify-center">
    <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 opacity-80"></div>
        <img 
            src="/assets/images/hero.jpg" 
            alt="Business Directory of Assam" 
            class="w-full h-full object-cover"
        >
    </div>

    <div class="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Business Directory
        </h1>
        <p class="text-xl md:text-2xl text-gray-200 mb-12">
            Discover local businesses, services, and opportunities in Assam
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
                    id="search-input"
                    value="<?= htmlspecialchars($term) ?>"
                    placeholder="Search businesses, services, or locations..." 
                    class="w-full pl-12 pr-24 py-5 rounded-full text-lg border-2 border-transparent focus:border-green-500 focus:outline-none shadow-2xl bg-white/95 backdrop-blur-sm transition duration-300"
                >
                <button type="submit" class="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition duration-300">
                    Search
                </button>
            </form>
            <div 
                id="search-suggestions" 
                style="
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 100%;
                    max-height: 300px;
                    overflow-y: auto;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.75rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    margin-top: 0.5rem;
                    z-index: 50;
                "
            ></div>
        </div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('search-suggestions');

    // Utility function to create URL-friendly string
    function createUrlFriendlyString(str) {
        return str
            .toLowerCase()           // Convert to lowercase
            .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
            .trim()                  // Remove leading/trailing whitespace
            .replace(/\s+/g, '-')    // Replace spaces with hyphens
            .replace(/-+/g, '-');    // Replace multiple hyphens with single hyphen
    }

    // Debounce function to limit API calls
    function debounce(func, delay) {
        let timeoutId;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    }

    // Fetch search suggestions
    function fetchDirectorySuggestions(query) {
        // Minimum query length
        if (query.length < 2) {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = 'none';
            return;
        }

        // Create XMLHttpRequest
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `/sections/directory_search.php?term=${encodeURIComponent(query)}`, true);

        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    const suggestions = JSON.parse(xhr.responseText);

                    // Clear previous suggestions
                    suggestionsContainer.innerHTML = '';

                    // No suggestions
                    if (!suggestions || suggestions.length === 0) {
                        suggestionsContainer.style.display = 'none';
                        return;
                    }

                    // Create suggestion items
                    suggestions.forEach(suggestion => {
                        const suggestionItem = document.createElement('div');
                        suggestionItem.textContent = suggestion.search_term;
                        suggestionItem.style.padding = '10px';
                        suggestionItem.style.cursor = 'pointer';
                        suggestionItem.style.borderBottom = '1px solid #eee';

                        suggestionItem.addEventListener('click', () => {
                            // Create URL-friendly business name
                            const urlFriendlyName = createUrlFriendlyString(suggestion.search_term);
                            
                            // Redirect to business details
                            window.location.href = `/listing/${urlFriendlyName}-${suggestion.id || ''}`;
                        });

                        suggestionsContainer.appendChild(suggestionItem);
                    });

                    // Show suggestions
                    suggestionsContainer.style.display = 'block';
                } catch (error) {
                    console.error('Error parsing suggestions:', error);
                    suggestionsContainer.style.display = 'none';
                }
            } else {
                console.error('Error fetching suggestions:', xhr.statusText);
                suggestionsContainer.style.display = 'none';
            }
        };

        xhr.onerror = function() {
            console.error('Network error');
            suggestionsContainer.style.display = 'none';
        };

        xhr.send();
    }

    // Attach debounced event listener
    const debouncedFetchSuggestions = debounce(fetchDirectorySuggestions, 300);
    
    // Add input event listener
    searchInput.addEventListener('input', function() {
        debouncedFetchSuggestions(this.value);
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', function(event) {
        if (!suggestionsContainer.contains(event.target) && event.target !== searchInput) {
            suggestionsContainer.style.display = 'none';
        }
    });
});
</script>

        <!-- Quick Stats -->
        <?php
        try {
            // Count unique categories
            $category_count = $pdo->query("SELECT COUNT(DISTINCT category) AS count FROM directory")->fetch(PDO::FETCH_ASSOC)['count'];
            
            // Count unique districts
            $district_count = $pdo->query("SELECT COUNT(DISTINCT district) AS count FROM directory")->fetch(PDO::FETCH_ASSOC)['count'];
            
            // Total listings count
            $total_listings = $pdo->query("SELECT COUNT(*) AS count FROM directory")->fetch(PDO::FETCH_ASSOC)['count'];
        } catch (PDOException $e) {
            // Fallback to default values if query fails
            $category_count = 100;
            $district_count = 50;
            $total_listings = 1000;
        }
        ?>
        <div class="mt-12 flex flex-wrap justify-center gap-8">
            <div class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
                <span class="font-bold"><?= $category_count ?>+</span> Business Categories
            </div>
            <div class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
                <span class="font-bold"><?= $district_count ?>+</span> Districts
            </div>
            <div class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
                <span class="font-bold"><?= $total_listings ?>+</span> Listings
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
                        <!-- Category Filter -->
                        <div class="mb-6">
                            <label class="block text-gray-700 font-semibold mb-2">Category</label>
                            <select name="category" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500">
                                <option value="">All Categories</option>
                                <option value="Hospitality" <?= $category === 'Hospitality' ? 'selected' : '' ?>>Hospitality</option>
                                <option value="Healthcare" <?= $category === 'Healthcare' ? 'selected' : '' ?>>Healthcare</option>
                                <option value="Education" <?= $category === 'Education' ? 'selected' : '' ?>>Education</option>
                                <option value="Professional Services" <?= $category === 'Professional Services' ? 'selected' : '' ?>>Professional Services</option>
                                <option value="Retail" <?= $category === 'Retail' ? 'selected' : '' ?>>Retail</option>
                                <option value="Arts" <?= $category === 'Arts' ? 'selected' : '' ?>>Arts</option>
                                <option value="Agriculture" <?= $category === 'Agriculture' ? 'selected' : '' ?>>Agriculture</option>
                                <option value="Technology" <?= $category === 'Technology' ? 'selected' : '' ?>>Technology</option>
                                <option value="Food" <?= $category === 'Food' ? 'selected' : '' ?>>Food</option>
                                <option value="Travel" <?= $category === 'Travel' ? 'selected' : '' ?>>Travel</option>
                            </select>
                        </div>

                        <!-- District Filter -->
                        <div class="mb-6">
                            <label class="block text-gray-700 font-semibold mb-2">District</label>
                            <select name="district" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500">
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
                            <button type="submit" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-300">
                                Apply Filters
                            </button>
                            <?php if ($category || $district || $term): ?>
                                <a href="directory.php" class="text-center text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-lg">
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
                    <?php if (empty($directory_listings)): ?>
                        <div class="text-center py-12 bg-white rounded-2xl shadow-lg">
                            <div class="text-gray-400 text-6xl mb-4">🏢</div>
                            <p class="text-gray-600 text-xl">No businesses found matching your criteria.</p>
                            <a href="/directory" class="inline-block mt-4 text-green-600 hover:text-green-700">View all listings →</a>
                        </div>
                    <?php else: ?>
                        <div class="mb-6">
                            <h2 class="text-xl font-bold text-gray-800">
                                <?= $total_results ?> 
                                <?= $total_results == 1 ? 'Business' : 'Businesses' ?> 
                                <?= $term ? "matching \"" . htmlspecialchars($term) . "\"" : '' ?>
                            </h2>
                            <?php if ($category): ?>
                                <span class="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs mr-2 mt-2">
                                    Category: <?= htmlspecialchars($category) ?>
                                </span>
                            <?php endif; ?>
                            <?php if ($district): ?>
                                <span class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs mt-2">
                                    District: <?= htmlspecialchars($district) ?>
                                </span>
                            <?php endif; ?>
                        </div>
                        <div class="space-y-6">
                            <?php foreach ($directory_listings as $listing): ?>
                            <?php
                                    // Build a clean slug: remove non-alphanumeric chars, replace spaces with hyphens
                                    $slug_raw   = strtolower($listing['business_name']);
                                    $slug_clean = preg_replace('/[^a-z0-9\s]/', '', $slug_raw); // keep letters, numbers, spaces
                                    $slug_final = str_replace(' ', '-', trim($slug_clean));
                                ?>
                                <div class="bg-white rounded-2xl shadow-lg overflow-hidden flex hover:shadow-xl transition-all duration-300">
                                    <!-- Image -->
                                    <div class="w-1/3 relative">
                                        <?php 
                                        $images = explode(',', $listing['image_urls'] ?? '');
                                        $main_image = trim($images[0] ?? '');
                                        
                                        // Placeholder image logic
                                        if (empty($main_image) || $main_image === 'null') {
                                            // Generate a professional placeholder based on business category
                                            $categories = [
                                                'Food & Beverages' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?fit=crop&w=300&h=300&q=80',
                                                'Retail' => 'https://images.unsplash.com/photo-1607349913338-fca6f7fc412d?fit=crop&w=300&h=300&q=80',
                                                'Services' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?fit=crop&w=300&h=300&q=80',
                                                'Electronics' => 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?fit=crop&w=300&h=300&q=80',
                                                'Books' => 'https://images.unsplash.com/photo-1481627834876-b7833e7e9589?fit=crop&w=300&h=300&q=80',
                                                'default' => 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?fit=crop&w=300&h=300&q=80'
                                            ];
                                            
                                            $main_image = $categories[$listing['category']] ?? $categories['default'];
                                        } else {
                                            $main_image = "assets/images/{$main_image}";
                                        }
                                        ?>
                                        <?php if (empty($images[0]) || $images[0] === 'null'): ?>
                                            <div class="w-full h-48 bg-gray-100 flex items-center justify-center">
                                                <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                                </svg>
                                            </div>
                                        <?php else: ?>
                                            <img 
                                                src="<?= htmlspecialchars($main_image) ?>" 
                                                alt="<?= htmlspecialchars($listing['business_name']) ?>" 
                                                class="w-full h-48 object-cover"
                                            >
                                        <?php endif; ?>
                                    </div>

                                    <!-- Content -->
                                    <div class="w-2/3 p-4 flex flex-col justify-between">
                                        <div>
                                            <div class="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 class="text-xl font-bold text-gray-800 mb-1">
                                                        <a href="/listing/<?= urlencode($slug_final) ?>-<?= $listing['id'] ?>" class="hover:underline text-green-700">
                                                            <?= htmlspecialchars($listing['business_name']) ?>
                                                        </a>
                                                    </h3>
                                                    <div class="flex items-center text-yellow-500 mb-1">
                                                        <?php 
                                                        // Placeholder rating (4.2 out of 5)
                                                        $rating = 4.2;
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
                                                    <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                        <?= htmlspecialchars($listing['category']) ?>
                                                    </span>
                                                    <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                        <?= htmlspecialchars($listing['subcategory']) ?>
                                                    </span>
                                                </div>
                                            </div>
                                            <!--

                                            <p class="text-gray-600 mb-2 text-sm line-clamp-2">
                                                <?= htmlspecialchars($listing['description']) ?>
                                            </p>
                                            -->

                                            <div class="grid grid-cols-2 gap-2 mb-2">
                                                <div>
                                                    <div class="flex items-center text-gray-700 mb-1">
                                                        <svg class="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7V3h-7c-.318 0-.63.014-.938.014A7.5 7.5 0 1010 15.532z"/>
                                                        </svg>
                                                        <span class="text-xs font-medium">Contact:</span>
                                                    </div>
                                                    <p class="pl-5 text-gray-600 text-xs">
                                                        <?php 
                                                        // Mask phone number
                                                        $phone = $listing['contact_number'] ?? '';
                                                        $masked_phone = strlen($phone) > 4 
                                                            ? substr($phone, 0, -4) . 'XXXX' 
                                                            : $phone;
                                                        ?>
                                                        <span class="masked-phone"><?= htmlspecialchars($masked_phone) ?></span>
                                                        <button 
                                                            class="ml-2 text-green-600 text-xs font-semibold show-number-btn"
                                                            data-business="<?= htmlspecialchars($listing['business_name']) ?>"
                                                            data-listing-id="<?= htmlspecialchars($listing['id']) ?>"
                                                            data-phone="<?= htmlspecialchars($phone) ?>"
                                                        >
                                                            Show Number
                                                        </button>
                                                    </p>
                                                </div>
                                                <div>
                                                    <div class="flex items-center text-gray-700 mb-1">
                                                        <svg class="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                                                        </svg>
                                                        <span class="text-xs font-medium">Website:</span>
                                                    </div>
                                                    <p class="pl-5 text-gray-600 text-xs truncate">
                                                        <?= $listing['website'] ? htmlspecialchars($listing['website']) : 'N/A' ?>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="flex justify-between items-center">
                                            <div class="flex items-center text-gray-600 text-xs">
                                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                </svg>
                                                <?= htmlspecialchars($listing['address']) ?>
                                            </div>
                                             <a 
                                                href="/listing/<?= urlencode($slug_final) ?>-<?= $listing['id'] ?>" 
                                                class="inline-flex items-center text-green-600 hover:text-green-700 font-semibold text-xs"
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
                            return 'directory.php?' . http_build_query($query);
                        }

                        // Compact pagination logic
                        $visiblePages = [];
                        $visiblePages[] = 1;
                        if ($page > 3) $visiblePages[] = '...';
                        for ($i = max(2, $page - 1); $i <= min($totalPages - 1, $page + 1); $i++) {
                            $visiblePages[] = $i;
                        }
                        if ($page < $totalPages - 2) $visiblePages[] = '...';
                        if ($totalPages > 1) $visiblePages[] = $totalPages;
                    ?>
                    <div class="mt-10 flex justify-center space-x-2 text-sm">
                        <?php if ($page > 1): ?>
                            <a href="<?= htmlspecialchars(buildPageUrl($page-1)) ?>" class="px-3 py-2 rounded-lg border bg-white hover:bg-gray-100">Prev</a>
                        <?php endif; ?>

                        <?php
                        $last = null;
                        foreach ($visiblePages as $p):
                            if ($p === '...') {
                        ?>
                            <span class="px-3 py-2">&hellip;</span>
                        <?php
                            } else {
                        ?>
                            <a href="<?= htmlspecialchars(buildPageUrl($p)) ?>" class="px-3 py-2 rounded-lg border <?= $p==$page ? 'bg-green-600 text-white' : 'bg-white hover:bg-gray-100' ?>"><?= $p ?></a>
                        <?php
                            }
                            $last = $p;
                        endforeach;
                        ?>

                        <?php if ($page < $totalPages): ?>
                            <a href="<?= htmlspecialchars(buildPageUrl($page+1)) ?>" class="px-3 py-2 rounded-lg border bg-white hover:bg-gray-100">Next</a>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<!-- Mobile Filter Toggle -->
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
            color: #2563eb;
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
            background-color: #22c55e;
            color: white;
            border-radius: 10px;
            font-weight: 500;
            transition: background-color 0.2s;
        }
        .mobile-filter-popup button[type="submit"]:hover {
            background-color: #15803d;
        }
    }
    @media (min-width: 768px) {
        .mobile-filter-overlay { display: none !important; }
    }
  </style>

  <!-- Mobile Filter Toggle -->
  <style>
    /* Ensure mobile filter toggle is visible */
    @media (max-width: 767px) {
        .mobile-filter-toggle {
            display: flex !important;
            align-items: center;
            background-color: #22c55e !important;
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
  </style>

  <!-- Mobile Filter Toggle -->
  <div class="sticky top-0 z-20 bg-white/80 backdrop-blur-md shadow-md py-4 border-b border-gray-200/50">
      <div class="container mx-auto px-4 flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-800">Listings</h3>
          <button class="md:hidden mobile-filter-toggle" id="mobileFilterToggle" style="display:none;">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
              <span class="text-white text-sm">Filters</span>
          </button>
      </div>
  </div>

  <script>
  // Debug function to check mobile filter toggle visibility
  function debugMobileFilterToggle() {
      const filterToggle = document.getElementById('mobileFilterToggle');
      if (filterToggle) {
          console.log('Mobile Filter Toggle Found');
          console.log('Window Width:', window.innerWidth);
          console.log('Is Mobile:', window.innerWidth <= 767);
          console.log('Display Style:', window.getComputedStyle(filterToggle).display);
          
          // Force display for debugging
          filterToggle.style.display = 'flex';
      } else {
          console.error('Mobile Filter Toggle NOT Found');
      }
  }

  // Run debug on page load
  window.addEventListener('load', debugMobileFilterToggle);
  window.addEventListener('resize', debugMobileFilterToggle);
  </script>

  <!-- Mobile Filter Overlay -->
  <div class="mobile-filter-overlay" role="dialog" aria-modal="true">
      <div class="mobile-filter-popup relative">
          <button class="filter-close-btn" onclick="toggleMobileFilter()" aria-label="Close filter">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
          </button>
          <div class="filter-title">Filters</div>
          <form action="" method="GET">
              <select name="category">
                  <option value="">All Categories</option>
                  <option value="Hospitality" <?= $category === 'Hospitality' ? 'selected' : '' ?>>Hospitality</option>
                  <option value="Healthcare" <?= $category === 'Healthcare' ? 'selected' : '' ?>>Healthcare</option>
                  <option value="Education" <?= $category === 'Education' ? 'selected' : '' ?>>Education</option>
                  <option value="Professional Services" <?= $category === 'Professional Services' ? 'selected' : '' ?>>Professional Services</option>
                  <option value="Retail" <?= $category === 'Retail' ? 'selected' : '' ?>>Retail</option>
                  <option value="Arts" <?= $category === 'Arts' ? 'selected' : '' ?>>Arts</option>
                  <option value="Agriculture" <?= $category === 'Agriculture' ? 'selected' : '' ?>>Agriculture</option>
                  <option value="Technology" <?= $category === 'Technology' ? 'selected' : '' ?>>Technology</option>
                  <option value="Food" <?= $category === 'Food' ? 'selected' : '' ?>>Food</option>
                  <option value="Travel" <?= $category === 'Travel' ? 'selected' : '' ?>>Travel</option>
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

<!-- Lead Capture Modal -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js"></script>

<div id="lead-capture-modal" style="
    position: fixed; 
    top: 0; 
    left: 0; 
    width: 100%; 
    height: 100%; 
    background: rgba(0,0,0,0.5); 
    display: none; 
    z-index: 9999; 
    align-items: center; 
    justify-content: center;
    opacity: 0;
">
    <div id="lead-capture-modal-content" style="
        background: white; 
        width: 90%; 
        max-width: 500px; 
        padding: 20px; 
        border-radius: 10px; 
        transform: scale(0.7);
        opacity: 0;
        position: relative;
    ">
        <button 
            id="close-lead-modal" 
            style="
                position: absolute; 
                top: 10px; 
                right: 10px; 
                background: none; 
                color: #6b7280; 
                border: none; 
                cursor: pointer;
            "
        >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
        <div class="text-center">
            <h3 class="text-xl font-bold text-gray-800 mb-4">Get Contact Details</h3>
            <p class="text-gray-600 mb-6">To view the contact number for <span id="business-name-modal" class="font-semibold"></span>, please provide your details.</p>
            
            <form id="lead-capture-form" class="space-y-4">
                <input 
                    type="text" 
                    name="name" 
                    placeholder="Your Name" 
                    required 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                <input 
                    type="tel" 
                    name="mobile" 
                    placeholder="Your Mobile Number" 
                    required 
                    pattern="[0-9]{10}"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                <input 
                    type="hidden" 
                    name="listing_id" 
                    id="lead-listing-id"
                >
                <input 
                    type="hidden" 
                    name="business_phone" 
                    id="lead-business-phone"
                >
                <button 
                    type="submit" 
                    class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-300"
                >
                    View Contact Number
                </button>
            </form>
        </div>
    </div>
</div>

<script>
(function() {
    function showLeadModal(businessName, listingId, phone) {
        const modal = document.getElementById('lead-capture-modal');
        const modalContent = document.getElementById('lead-capture-modal-content');
        const businessNameSpan = document.getElementById('business-name-modal');
        const listingIdInput = document.getElementById('lead-listing-id');
        const businessPhoneInput = document.getElementById('lead-business-phone');

        businessNameSpan.textContent = businessName || 'Business Contact';
        listingIdInput.value = listingId;
        businessPhoneInput.value = phone;

        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';

        modalContent.style.transform = 'scale(1)';
        modalContent.style.opacity = '1';

        document.body.style.overflow = 'hidden';
    }

    function attachShowNumberListeners() {
        const showNumberButtons = document.querySelectorAll('.show-number-btn');

        showNumberButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();

                const businessName = this.getAttribute('data-business');
                const listingId = this.getAttribute('data-listing-id');
                const phone = this.getAttribute('data-phone');

                showLeadModal(businessName, listingId, phone);
            });
        });
    }

    function initLeadModal() {
        attachShowNumberListeners();

        const closeButton = document.getElementById('close-lead-modal');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                const modal = document.getElementById('lead-capture-modal');
                if (modal) {
                    modal.style.display = 'none';
                    modal.style.opacity = '0';
                    document.body.style.overflow = '';
                }
            });

            // Close modal when clicking outside
            const modal = document.getElementById('lead-capture-modal');
            if (modal) {
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                        modal.style.opacity = '0';
                        document.body.style.overflow = '';
                    }
                });
            }
        }

        // Form submission
        const form = document.getElementById('lead-capture-form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const formData = new FormData(this);

                fetch('save_lead.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const showNumberBtn = document.querySelector(`.show-number-btn[data-listing-id="${formData.get('listing_id')}"]`);
                        if (showNumberBtn) {
                            const phoneSpan = showNumberBtn.previousElementSibling;
                            phoneSpan.textContent = formData.get('business_phone');
                            showNumberBtn.remove();

                            // SweetAlert for contact number reveal
                            Swal.fire({
                                icon: 'success',
                                title: 'Contact Number Revealed!',
                                text: 'Thank you! The contact number is now visible.',
                                confirmButtonColor: '#22c55e',
                                confirmButtonText: 'Great!'
                            });
                        }
                        
                        const modal = document.getElementById('lead-capture-modal');
                        modal.style.display = 'none';
                        modal.style.opacity = '0';
                        document.body.style.overflow = '';
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: data.message || 'Failed to save lead. Please try again.',
                            confirmButtonColor: '#ef4444'
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Network Error',
                        text: 'An error occurred. Please check your connection and try again.',
                        confirmButtonColor: '#ef4444'
                    });
                });
            });
        }
    }

    // Ensure initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLeadModal);
    } else {
        initLeadModal();
    }
})();
</script>

<?php require_once 'includes/footer.php'; ?>