<!-- Business Listings Section -->
<section class="py-20 bg-white">
    <div class="container mx-auto px-4">
        <div class="text-center mb-16">
            <span class="text-assam-green-700 font-semibold text-lg">Discover Local Businesses</span>
            <h2 class="text-4xl font-bold text-gray-900 mt-2 mb-4">Business Directory of North East India</h2>
            <p class="text-xl text-gray-600">Find the best local businesses across multiple categories</p>
        </div>

        <?php
        $business_categories = [
            // Hospitality & Tourism
            [
                'category' => 'Hospitality & Tourism',
                'subcategories' => [
                    'Hotels', 'Resorts', 'Homestays', 'Travel Agencies', 
                    'Tour Operators', 'Restaurants', 'Cafes', 'Bars', 
                    'Tourist Information Centers'
                ],
                'icon' => '🏨'
            ],
            // Healthcare
            [
                'category' => 'Healthcare',
                'subcategories' => [
                    'Hospitals', 'Clinics', 'Dental Clinics', 'Diagnostic Centers', 
                    'Pharmacies', 'Ayurvedic Centers', 'Physiotherapy Clinics', 
                    'Mental Health Services'
                ],
                'icon' => '🏥'
            ],
            // Education
            [
                'category' => 'Education',
                'subcategories' => [
                    'Schools', 'Colleges', 'Universities', 'Coaching Center', 
                    'Language Schools', 'Technical Training Institutes', 
                    'Online Learning Platforms'
                ],
                'icon' => '🎓'
            ],
            // Professional Services
            [
                'category' => 'Professional Services',
                'subcategories' => [
                    'Law Firms', 'Chartered Accountants', 'Consultants', 
                    'Digital Marketing Agencies', 'IT Services', 'Graphic Design', 
                    'Wedding Planners', 'Event Management'
                ],
                'icon' => '💼'
            ],
            // Retail & Shopping
            [
                'category' => 'Retail & Shopping',
                'subcategories' => [
                    'Shopping Malls', 'Clothing Stores', 'Electronics Shops', 
                    'Handicraft Stores', 'Bookstores', 'Supermarkets', 
                    'Local Markets', 'Jewelry Stores'
                ],
                'icon' => '🛍️'
            ],
            // Arts & Culture
            [
                'category' => 'Arts & Culture',
                'subcategories' => [
                    'Art Galleries', 'Museums', 'Cultural Centers', 'Theaters', 
                    'Music Schools', 'Dance Studios', 'Craft Workshops'
                ],
                'icon' => '🎨'
            ],
            // Agriculture & Local Produce
            [
                'category' => 'Agriculture & Local Produce',
                'subcategories' => [
                    'Tea Gardens', 'Organic Farms', 'Agricultural Cooperatives', 
                    'Spice Traders', 'Local Produce Markets', 'Agricultural Equipment Dealers'
                ],
                'icon' => '🌿'
            ],
            // Technology & Startups
            [
                'category' => 'Technology & Startups',
                'subcategories' => [
                    'Tech Startups', 'Software Companies', 'IT Parks', 
                    'Coworking Spaces', 'Innovation Hubs', 'Digital Agencies'
                ],
                'icon' => '💻'
            ],
            // Beauty & Fitness
            [
                'category' => 'Beauty & Fitness',
                'subcategories' => [
                    'Yoga Studio', 'Gym', 'Fitness Center', 'Beauty Parlors',
                    'Spas', 'Wellness Centers', 'Hair Salons', 'Massage Therapy',
                    'Makeup Artists'
                ],
                'icon' => '💅'
            ],
        ];

        // Function to generate category cards
        function generateCategoryCard($category) {
            echo '<div class="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition duration-500">';
            echo '<div class="p-6">';
            echo '<div class="flex items-center mb-4">';
            echo '<span class="text-4xl mr-4">' . $category['icon'] . '</span>';
            echo '<h3 class="text-2xl font-bold text-assam-green-900">' . $category['category'] . '</h3>';
            echo '</div>';
            echo '<div class="grid grid-cols-2 gap-2">';
            
            foreach ($category['subcategories'] as $subcategory) {
                $slug = strtolower($subcategory);
                $slug = preg_replace('/[^a-z0-9\s]/', '', $slug); // keep alnum & spaces
                $slug = trim(str_replace(' ', '-', $slug));

                echo '<a href="/directory/' . urlencode($slug) . '" class="flex items-center text-gray-700 hover:text-assam-green-700 transition">';
                echo '<svg class="w-4 h-4 mr-2 text-assam-green-500" fill="currentColor" viewBox="0 0 20 20">';
                echo '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd"/>';
                echo '</svg>';
                echo '<span class="text-sm">' . htmlspecialchars($subcategory) . '</span>';
                echo '</a>';
            }
            
            echo '</div>';
            echo '</div>';
            echo '</div>';
        }

        // Render category cards in a grid
        echo '<div class="grid md:grid-cols-3 gap-8">';
        foreach ($business_categories as $category) {
            generateCategoryCard($category);
        }
        echo '</div>';
        ?>
    </div>
</section>

 