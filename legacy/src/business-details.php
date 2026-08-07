<?php
require_once 'config.php';


// Get business ID
$business_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$business = null;
$similar_businesses = [];
$error_message = '';

try {
    // Fetch business details
    $stmt = $pdo->prepare("SELECT * FROM directory WHERE id = ? AND status = 'Active'");
    $stmt->execute([$business_id]);
    $business = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$business) {
        $error_message = "Business not found.";
    } else {
        // Fetch similar businesses in the same category and district
        $similar_stmt = $pdo->prepare("
            SELECT * FROM directory 
            WHERE id != ? 
            AND category = ? 
            AND district = ? 
            AND status = 'Active' 
            LIMIT 3
        ");
        $similar_stmt->execute([$business_id, $business['category'], $business['district']]);
        $similar_businesses = $similar_stmt->fetchAll(PDO::FETCH_ASSOC);
    }
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    $error_message = "Database connection failed. Please try again later.";
}


$site_title_1 = htmlspecialchars($business['business_name'] . ' | ' . $business['address']);
require_once 'includes/header.php';
?>

<!-- Full-screen Hero Section -->
<header class="relative min-h-[50vh] flex items-center justify-center">
    <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-r from-green-900 to-green-600 opacity-80"></div>
        <img 
            src="/assets/images/hero.jpg" 
            alt="Business Details" 
            class="w-full h-full object-cover"
        >
    </div>

    <div class="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            <?= htmlspecialchars($business ? $business['business_name'] : 'Business Details') ?>
        </h1>
        <p class="text-xl md:text-2xl text-gray-200 mb-12">
            <?= htmlspecialchars($business ? $business['category'] : 'Discover Local Businesses') ?>
        </p>
    </div>
</header>

<!-- Business Details Section -->
<div class="bg-gray-50 py-16">
    <div class="container mx-auto px-4">
        <?php if ($error_message): ?>
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
                <?= htmlspecialchars($error_message) ?>
            </div>
        <?php elseif ($business): ?>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Business Information Card -->
                <div class="bg-white rounded-2xl shadow-lg p-8">
                    <h2 class="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
                        Business Information
                    </h2>
                    
                    <div class="space-y-4">
                        <!-- Business Name -->
                        <div class="flex items-center">
                            <svg class="w-6 h-6 mr-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                            <div>
                                <span class="text-sm text-gray-600">Business Name</span>
                                <h3 class="text-xl font-bold text-gray-800"><?= htmlspecialchars($business['business_name']) ?></h3>
                            </div>
                        </div>

                        <!-- Category -->
                        <div class="flex items-center">
                            <svg class="w-6 h-6 mr-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                            </svg>
                            <div>
                                <span class="text-sm text-gray-600">Business Category</span>
                                <p class="text-lg font-semibold text-gray-800"><?= htmlspecialchars($business['category']) ?></p>
                            </div>
                        </div>

                        <!-- District -->
                        <div class="flex items-center">
                            <svg class="w-6 h-6 mr-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            <div>
                                <span class="text-sm text-gray-600">District</span>
                                <p class="text-lg font-semibold text-gray-800"><?= htmlspecialchars($business['district']) ?></p>
                            </div>
                        </div>

                        <!-- Address -->
                        <div class="flex items-center">
                            <svg class="w-6 h-6 mr-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"/>
                            </svg>
                            <div>
                                <span class="text-sm text-gray-600">Full Address</span>
                                <p class="text-lg font-semibold text-gray-800"><?= htmlspecialchars($business['address']) ?></p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contact Business Card -->
                <div class="bg-white rounded-2xl shadow-lg p-8">
                    <h2 class="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
                        Contact Information
                    </h2>
                    
                    <div class="space-y-4">
                        <!-- Phone Number -->
                        <?php if ($business['contact_number']): ?>
                            <div class="flex items-center">
                                <svg class="w-6 h-6 mr-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                </svg>
                                <div>
                                    <span class="text-sm text-gray-600">Phone Number</span>
                                    <p class="text-lg font-semibold text-gray-800"><?= htmlspecialchars($business['contact_number']) ?></p>
                                </div>
                            </div>
                        <?php endif; ?>

                        <!-- Email -->
                        <?php if ($business['email']): ?>
                            <div class="flex items-center">
                                <svg class="w-6 h-6 mr-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                                <div>
                                    <span class="text-sm text-gray-600">Email Address</span>
                                    <p class="text-lg font-semibold text-gray-800"><?= htmlspecialchars($business['email']) ?></p>
                                </div>
                            </div>
                        <?php endif; ?>

                        <!-- Website -->
                        <?php if ($business['website']): ?>
                            <div class="flex items-center">
                                <svg class="w-6 h-6 mr-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                                </svg>
                                <div>
                                    <span class="text-sm text-gray-600">Website</span>
                                    <p class="text-lg font-semibold text-gray-800">
                                    <a 
                                        href="<?= htmlspecialchars($business['website']) ?>" 
                                        target="_blank" 
                                        class="text-lg font-semibold text-purple-800 hover:underline"
                                    >
                                        <?= htmlspecialchars(parse_url($business['website'], PHP_URL_HOST)) ?>
                                    </a>
                                    </p>
                                </div>
                            </div>
                        <?php endif; ?>

                        <!-- Working Hours -->
                        <?php if ($business['working_hours']): ?>
                            <div class="flex items-center">
                                <svg class="w-6 h-6 mr-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <div>
                                    <span class="text-sm text-gray-600">Working Hours</span>
                                    <p class="text-lg font-semibold text-gray-800"><?= htmlspecialchars($business['working_hours']) ?></p>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>

                    <!-- Send Message Button -->
                    <div class="mt-6">
                        <style>
                            @keyframes pulse-glow {
                                0%, 100% {
                                    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
                                }
                                50% {
                                    box-shadow: 0 0 0 15px rgba(37, 99, 235, 0);
                                }
                            }
                            @keyframes float {
                                0%, 100% {
                                    transform: translateY(0px);
                                }
                                50% {
                                    transform: translateY(-3px);
                                }
                            }
                            @keyframes shine {
                                0% {
                                    left: -100%;
                                }
                                100% {
                                    left: 100%;
                                }
                            }
                            .cta-button {
                                position: relative;
                                overflow: hidden;
                                animation: pulse-glow 2s infinite, float 3s ease-in-out infinite;
                            }
                            .cta-button::before {
                                content: '';
                                position: absolute;
                                top: 0;
                                left: -100%;
                                width: 100%;
                                height: 100%;
                                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                                animation: shine 3s infinite;
                            }
                            /* Badge on the button */
                            .cta-badge {
                                position: absolute;
                                top: 5px;
                                right: 10px;
                                transform: translate(0, -0%);
                                background: linear-gradient(90deg,#ff416c,#ff4b2b);
                                color: #fff;
                                font-weight: 700;
                                font-size: 12px;
                                padding: 6px 10px;
                                border-radius: 999px;
                                box-shadow: 0 6px 18px rgba(255,75,43,0.18);
                                z-index: 40;
                                display: inline-block;
                                line-height: 1;
                                letter-spacing: 0.02em;
                            }
                            .cta-badge.small {
                                padding: 4px 8px;
                                font-size: 11px;
                            }
                            .cta-button:hover {
                                box-shadow: 0 0 30px rgba(37, 99, 235, 1) !important;
                                transform: translateY(-3px) scale(1.05) !important;
                            }
                            .cta-button:active {
                                transform: translateY(-1px) scale(0.98) !important;
                            }
                        </style>
                        <button 
                            onclick="openContactModal()" 
                            class="cta-button w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 active:bg-blue-800 transition duration-300 flex items-center justify-center font-bold text-lg relative"
                            aria-label="Get a Free Quote"
                        >
                            <span class="cta-badge" aria-hidden="true">Get Offer</span>
                            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            Contact Us
                        </button>
                    </div>
                </div>
            </div>

            <!-- Location Section -->
            <?php if ($business['address']): ?>
                <div class="mt-12 bg-white rounded-2xl shadow-lg overflow-hidden">
                    <h2 class="text-3xl font-bold text-gray-800 mb-6 p-8 pb-0">
                        Location
                    </h2>
                    <div class="w-full relative">
                        <?php 
                        // Prepare location string
                        $business_name = htmlspecialchars($business['business_name']);
                        $address = htmlspecialchars($business['address']);
                        $district = htmlspecialchars($business['district']);
                        
                        // Get latitude and longitude
                        $latitude = floatval($business['latitude']);
                        $longitude = floatval($business['longitude']);
                        
                        // URL encode the location for the iframe
                        $location_query = urlencode("{$business_name}, {$address}, {$district}");
                        ?>
                        
                        <div class="relative w-full">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d14326.510385260022!2d<?= $longitude ?>!3d<?= $latitude ?>!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1754830090901" 
                                width="100%" 
                                height="450" 
                                style="border:0;" 
                                allowfullscreen="" 
                                loading="lazy" 
                                referrerpolicy="no-referrer-when-downgrade"
                                class="relative z-10"
                            ></iframe>
                            
                            <!-- Custom Marker -->
                            <div class="absolute z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                <div class="relative w-16 h-16">
                                    <!-- Outer Pulse Ring -->
                                    <div class="absolute inset-0 bg-blue-500 bg-opacity-50 rounded-full animate-ping"></div>
                                    
                                    <!-- Main Marker -->
                                    <div class="absolute inset-2 bg-blue-600 rounded-full shadow-lg flex items-center justify-center">
                                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Location Links -->
                        <div class="flex justify-center space-x-4 py-4 bg-white">
                            <a 
                                href="https://www.google.com/maps/search/?api=1&query=<?= $latitude ?>,<?= $longitude ?>" 
                                target="_blank" 
                                class="text-blue-600 hover:text-blue-800 inline-flex items-center"
                            >
                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"/>
                                </svg>
                                Open in Google Maps
                            </a>
                            
                            <a 
                                href="https://www.google.com/maps/dir/?api=1&destination=<?= $latitude ?>,<?= $longitude ?>" 
                                target="_blank" 
                                class="text-green-600 hover:text-green-800 inline-flex items-center"
                            >
                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 13l-6-3"/>
                                </svg>
                                Get Directions
                            </a>
                        </div>
                    </div>
                </div>
            <?php endif; ?>

            <!-- Similar Businesses Section -->
            <?php if (!empty($similar_businesses)): ?>
                <div class="mt-12">
                    <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
                        Similar Businesses
                    </h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <?php foreach ($similar_businesses as $similar_business): ?>
                        <?php
                                $raw  = strtolower($similar_business['business_name']);
                                $clean = preg_replace('/[^a-z0-9\s]/', '', $raw);
                                $slug  = str_replace(' ', '-', trim($clean));
                            ?>
                            <div class="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
                                <div class="relative h-64 overflow-hidden">
                                    <?php 
                                    $images = explode(',', $similar_business['image_urls'] ?? '');
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
                                        
                                        $main_image = $categories[$similar_business['category']] ?? $categories['default'];
                                    } else {
                                        $main_image = "assets/images/{$main_image}";
                                    }
                                    ?>
                                    <?php if (empty($images[0]) || $images[0] === 'null'): ?>
                                        <div class="w-full h-64 bg-gray-100 flex items-center justify-center">
                                            <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                            </svg>
                                        </div>
                                    <?php else: ?>
                                        <img 
                                            src="<?= htmlspecialchars($main_image) ?>" 
                                            alt="<?= htmlspecialchars($similar_business['business_name']) ?>" 
                                            class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                                        >
                                    <?php endif; ?>
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                                    <div class="absolute bottom-0 left-0 right-0 p-6">
                                        <h3 class="text-white text-xl font-bold mb-2">
                                            <?= htmlspecialchars($similar_business['business_name']) ?>
                                        </h3>
                                        <p class="text-white/90 flex items-center">
                                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"/>
                                            </svg>
                                            <?= htmlspecialchars($similar_business['district']) ?>
                                        </p>
                                    </div>
                                </div>
                                <div class="p-6">
                                    <div class="flex gap-2 mb-4">
                                        <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                            <?= htmlspecialchars($similar_business['category']) ?>
                                        </span>
                                    </div>
                                    <a 
                                        href="/listing/<?= urlencode($slug) ?>-<?= $similar_business['id'] ?>" 
                                        class="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
                                    >
                                        View Details
                                        <svg class="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endif; ?>

            <!-- About the Business Section -->
            <?php if ($business['description']): ?>
                <div class="mt-12 bg-white rounded-2xl shadow-lg p-8">
                    <h2 class="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
                        About the Business
                    </h2>
                    
                    <p class="text-gray-600 leading-relaxed">
                        <?= ($business['description']) ?>
                    </p>
                </div>
            <?php endif; ?>

        <?php else: ?>
            <div class="text-center py-12">
                <div class="text-gray-400 text-6xl mb-4">🏢</div>
                <p class="text-gray-600 text-xl">No business details found.</p>
                <a href="directory.php" class="inline-block mt-4 text-blue-600 hover:text-blue-700">View all businesses →</a>
            </div>
        <?php endif; ?>
    </div>
</div>

<!-- Contact Modal -->
<div id="contactModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden items-center justify-center">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-8 relative">
        <button 
            onclick="closeContactModal()" 
            class="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
        >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>

        <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">
            Contact <?= htmlspecialchars($business['business_name']) ?>
        </h2>

        <form id="contactForm" class="space-y-4">
            <div>
                <label for="name" class="block text-gray-700 mb-2">Your Name</label>
                <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    required 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
            </div>

            <div>
                <label for="email" class="block text-gray-700 mb-2">Your Email</label>
                <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
            </div>

            <div>
                <label for="message" class="block text-gray-700 mb-2">Your Message</label>
                <textarea 
                    id="message" 
                    name="message" 
                    rows="4" 
                    required 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
            </div>

            <button 
                type="submit" 
                class="w-full bg-blue-600 text-white px-6 py-4 rounded-full hover:bg-blue-700 transition duration-300"
            >
                Send Message
            </button>
        </form>
    </div>
</div>

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
                    value="<?= $business['id'] ?>"
                >
                <input 
                    type="hidden" 
                    name="business_phone" 
                    id="lead-business-phone"
                    value="<?= htmlspecialchars($business['contact_number']) ?>"
                >
                <button 
                    type="submit" 
                    class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-300"
                >
                    Contact Now
                </button>
            </form>
        </div>
    </div>
</div>

<script>
function closeContactModal() {
    document.getElementById('contactModal').classList.remove('flex');
    document.getElementById('contactModal').classList.add('hidden');
}

document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Basic form validation
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
        alert('Please fill in all fields');
        return;
    }

    // Here you would typically send the form data to a server
    alert('Message sent successfully! We will get back to you soon.');
    closeContactModal();
});

(function() {
    function showLeadModal() {
        const modal = document.getElementById('lead-capture-modal');
        const modalContent = document.getElementById('lead-capture-modal-content');
        const businessNameSpan = document.getElementById('business-name-modal');

        // Prevent multiple modals
        if (modal.style.display === 'flex') {
            return;
        }

        businessNameSpan.textContent = '<?= htmlspecialchars($business['business_name']) ?>';

        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';

        modalContent.style.transform = 'scale(1)';
        modalContent.style.opacity = '1';

        document.body.style.overflow = 'hidden';
    }

    function initLeadModal() {
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

                fetch('/save_lead.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // SweetAlert for message sent
                        Swal.fire({
                            icon: 'success',
                            title: 'Message Sent!',
                            text: 'Your message has been sent successfully. We will get back to you soon.',
                            confirmButtonColor: '#22c55e',
                            confirmButtonText: 'Great!'
                        });
                        
                        const modal = document.getElementById('lead-capture-modal');
                        modal.style.display = 'none';
                        modal.style.opacity = '0';
                        document.body.style.overflow = '';
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: data.message || 'Failed to send message. Please try again.',
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

    // Attach modal open function to the Send Message button
    const sendMessageBtn = document.querySelector('button[onclick="openContactModal()"]');
    if (sendMessageBtn) {
        sendMessageBtn.onclick = function(e) {
            e.preventDefault();
            showLeadModal();
        };
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