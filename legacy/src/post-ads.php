<?php 
// Include header
require_once 'includes/header.php'; 
require_once 'config.php';
?>
<!-- Full-screen Hero Section with Search -->
<header class="relative min-h-screen flex items-center justify-center">
    <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-90"></div>
        <img 
            src="assets/images/hero.jpg" 
            alt="Classified Ads in Assam" 
            class="w-full h-full object-cover"
        >
    </div>

    <!-- Hero Content -->
    <div class="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Post Your Ads
        </h1>
        <p class="text-xl md:text-2xl text-gray-200 mb-12">
            Buy and sell everything from used cars to mobile phones and computers, or search for property, jobs and more in Assam
        </p>

        <!-- Search Bar -->
        <div class="max-w-3xl mx-auto relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
            </div>
            <input 
                type="search" 
                id="search-input"
                name="search_term"
                placeholder="Search for cars, mobile phones, real estate, jobs, services..." 
                class="w-full pl-12 pr-4 py-5 rounded-full text-lg border-2 border-transparent focus:border-blue-500 focus:outline-none shadow-2xl bg-white/95 backdrop-blur-sm transition duration-300"
            >
            <div class="absolute right-3 top-1/2 -translate-y-1/2 flex space-x-2">
                <button class="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition duration-300">
                    Search
                </button>
            </div>
        </div>

        <!-- Quick Links -->
        <div class="mt-12 flex flex-wrap justify-center gap-4">
            <a href="#categories" class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition duration-300">
                All Categories
            </a>
            <a href="#recent" class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition duration-300">
                Recent Ads
            </a>
            <a href="#post" class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition duration-300">
                Post an Ad
            </a>
        </div>
    </div>

    <!-- Scroll Indicator -->
    <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
    </div>
</header>

<!-- Featured Categories -->
<section id="categories" class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
        <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">Browse Categories</h2>
            <p class="text-xl text-gray-600">Find what you're looking for or sell your items</p>
        </div>

        <div class="grid md:grid-cols-4 gap-6">
            <?php 
            $categories = [
                [
                    'title' => 'Vehicles',
                    'description' => 'Cars, bikes, scooters, commercial vehicles',
                    'icon' => '🚗',
                    'count' => '1,245 ads'
                ],
                [
                    'title' => 'Property',
                    'description' => 'For sale: houses, plots, commercial property',
                    'icon' => '🏠',
                    'count' => '892 ads'
                ],
                [
                    'title' => 'Electronics',
                    'description' => 'Mobiles, laptops, TVs, cameras, games',
                    'icon' => '📱',
                    'count' => '3,456 ads'
                ],
                [
                    'title' => 'Jobs',
                    'description' => 'Find jobs or hire in Assam',
                    'icon' => '💼',
                    'count' => '567 ads'
                ],
                [
                    'title' => 'Mobiles',
                    'description' => 'Mobile phones, tablets, accessories',
                    'icon' => '📱',
                    'count' => '2,341 ads'
                ],
                [
                    'title' => 'Furniture',
                    'description' => 'Sofas, beds, tables, chairs, wardrobes',
                    'icon' => '🪑',
                    'count' => '789 ads'
                ],
                [
                    'title' => 'Fashion',
                    'description' => 'Clothes, shoes, watches, accessories',
                    'icon' => '👕',
                    'count' => '1,876 ads'
                ],
                [
                    'title' => 'Services',
                    'description' => 'Electronics, home, education, transport',
                    'icon' => '🔧',
                    'count' => '1,234 ads'
                ]
            ];

            foreach ($categories as $category) {
                echo '<div class="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition duration-500 text-center">';
                echo '<div class="text-4xl mb-4">' . $category['icon'] . '</div>';
                echo '<h3 class="text-xl font-bold text-gray-900 mb-2">' . $category['title'] . '</h3>';
                echo '<p class="text-gray-600 mb-3">' . $category['description'] . '</p>';
                echo '<p class="text-sm text-blue-600 font-medium">' . $category['count'] . '</p>';
                echo '<a href="#" class="inline-block mt-4 text-blue-600 hover:text-blue-800 font-semibold">';
                echo 'Browse';
                echo '<svg class="w-5 h-5 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">';
                echo '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>';
                echo '</svg>';
                echo '</a>';
                echo '</div>';
            }
            ?>
        </div>
    </div>
</section>

<!-- Recent Ads -->
<section id="recent" class="py-20 bg-white">
    <div class="container mx-auto px-4">
        <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">Recent Ads</h2>
            <p class="text-xl text-gray-600">Latest listings from people in Assam</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
            <?php 
            $ads = [
                [
                    'title' => '2018 Honda City VTEC',
                    'price' => '₹ 6,50,000',
                    'location' => 'Guwahati',
                    'time' => '2 hours ago',
                    'image' => 'assets/images/1.jpg',
                    'category' => 'Vehicles'
                ],
                [
                    'title' => 'Brand New iPhone 13 Pro',
                    'price' => '₹ 85,000',
                    'location' => 'Dibrugarh',
                    'time' => '5 hours ago',
                    'image' => 'assets/images/2.jpg',
                    'category' => 'Electronics'
                ],
                [
                    'title' => '2BHK Apartment for Sale',
                    'price' => '₹ 28,00,000',
                    'location' => 'Jorhat',
                    'time' => '1 day ago',
                    'image' => 'assets/images/3.jpg',
                    'category' => 'Property'
                ]
            ];

            foreach ($ads as $ad) {
                echo '<div class="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-500">';
                echo '<div class="relative overflow-hidden h-64">';
                echo '<img src="' . $ad['image'] . '" alt="' . $ad['title'] . '" class="w-full h-full object-cover transform group-hover:scale-110 transition duration-500">';
                echo '<div class="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">';
                echo $ad['category'];
                echo '</div>';
                echo '</div>';
                echo '<div class="p-6">';
                echo '<h3 class="text-xl font-bold text-gray-900 mb-2">' . $ad['title'] . '</h3>';
                echo '<p class="text-2xl font-bold text-blue-600 mb-3">' . $ad['price'] . '</p>';
                echo '<div class="flex justify-between text-gray-600 text-sm">';
                echo '<span>' . $ad['location'] . '</span>';
                echo '<span>' . $ad['time'] . '</span>';
                echo '</div>';
                echo '<a href="#" class="inline-block mt-4 w-full text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300">';
                echo 'View Details';
                echo '</a>';
                echo '</div>';
                echo '</div>';
            }
            ?>
        </div>

        <div class="text-center mt-12">
            <a href="#" class="inline-block px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300 font-semibold">
                View All Ads
            </a>
        </div>
    </div>
</section>

<!-- Post Ad CTA -->
<section id="post" class="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
    <div class="container mx-auto px-4 text-center">
        <h2 class="text-4xl font-bold mb-6">Ready to Sell Something?</h2>
        <p class="text-xl mb-10 max-w-3xl mx-auto">
            Post your ad for free and reach thousands of potential buyers in Assam
        </p>
        <a href="#" class="inline-block px-10 py-5 bg-white text-blue-600 rounded-full hover:bg-gray-100 transition duration-300 text-xl font-bold shadow-lg">
            Post Your Ad Now
        </a>
        <div class="mt-12 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div class="p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
                <div class="text-4xl mb-4">📱</div>
                <h3 class="text-xl font-bold mb-2">Easy to Use</h3>
                <p>Post your ad in less than 2 minutes with our simple form</p>
            </div>
            <div class="p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
                <div class="text-4xl mb-4">👁️</div>
                <h3 class="text-xl font-bold mb-2">High Visibility</h3>
                <p>Your ad reaches thousands of potential buyers daily</p>
            </div>
            <div class="p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
                <div class="text-4xl mb-4">💰</div>
                <h3 class="text-xl font-bold mb-2">Free to Post</h3>
                <p>Post as many ads as you want, completely free</p>
            </div>
        </div>
    </div>
</section>

<?php 
// Include footer
require_once 'includes/footer.php'; 
?>
