<!-- Job Listings Section -->
<section class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
        <div class="text-center mb-16">
            <span class="text-assam-green-700 font-semibold text-lg">Career Opportunities</span>
            <h2 class="text-4xl font-bold text-gray-900 mt-2 mb-4">Latest Job Openings in Assam</h2>
            <p class="text-xl text-gray-600">Discover exciting career opportunities across various sectors</p>
        </div>

        <?php
        $job_categories = [
            'Government Jobs',
            'Private Sector',
            'IT & Technology',
            'Education',
            'Healthcare',
            'Tourism & Hospitality',
            'Startups',
            'NGO & Social Sector'
        ];

        $job_listings = [
            [
                'title' => 'Software Engineer',
                'company' => 'Tech Innovators Pvt Ltd, Guwahati',
                'category' => 'IT & Technology',
                'type' => 'Full-time',
                'location' => 'Guwahati',
                'salary' => '₹4,00,000 - ₹6,00,000 p.a.',
                'experience' => '2-5 years',
                'skills' => ['Python', 'React', 'Cloud Computing'],
                'posted_date' => '2 days ago'
            ],
            [
                'title' => 'Tourism Marketing Manager',
                'company' => 'Assam Tourism Development Corporation',
                'category' => 'Tourism & Hospitality',
                'type' => 'Government',
                'location' => 'Dispur',
                'salary' => '₹5,00,000 - ₹7,00,000 p.a.',
                'experience' => '3-7 years',
                'skills' => ['Marketing', 'Tourism Management', 'Digital Strategy'],
                'posted_date' => '1 week ago'
            ],
            [
                'title' => 'Research Scientist',
                'company' => 'Tea Research Association',
                'category' => 'Research',
                'type' => 'Full-time',
                'location' => 'Jorhat',
                'salary' => '₹4,50,000 - ₹6,50,000 p.a.',
                'experience' => '2-6 years',
                'skills' => ['Agricultural Science', 'Research', 'Data Analysis'],
                'posted_date' => '3 days ago'
            ],
            [
                'title' => 'Healthcare Administrator',
                'company' => 'Guwahati Medical College',
                'category' => 'Healthcare',
                'type' => 'Government',
                'location' => 'Guwahati',
                'salary' => '₹5,50,000 - ₹8,00,000 p.a.',
                'experience' => '4-8 years',
                'skills' => ['Hospital Management', 'Administration', 'Healthcare Policy'],
                'posted_date' => '5 days ago'
            ]
        ];

        // Function to generate job listing card
        function generateJobListingCard($job) {
            echo '<div class="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition duration-500 mb-6">';
            echo '<div class="p-6">';
            
            // Job Header
            echo '<div class="flex justify-between items-start mb-4">';
            echo '<div>';
            echo '<h3 class="text-xl font-bold text-assam-green-900 mb-1">' . htmlspecialchars($job['title']) . '</h3>';
            echo '<p class="text-gray-600">' . htmlspecialchars($job['company']) . '</p>';
            echo '</div>';
            echo '<span class="text-sm text-gray-500">' . htmlspecialchars($job['posted_date']) . '</span>';
            echo '</div>';

            // Job Details
            echo '<div class="grid md:grid-cols-3 gap-4 mb-4">';
            echo '<div class="flex items-center">';
            echo '<svg class="w-5 h-5 mr-2 text-assam-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">';
            echo '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>';
            echo '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>';
            echo '</svg>';
            echo '<span class="text-sm text-gray-700">' . htmlspecialchars($job['location']) . '</span>';
            echo '</div>';
            
            echo '<div class="flex items-center">';
            echo '<svg class="w-5 h-5 mr-2 text-assam-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">';
            echo '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>';
            echo '</svg>';
            echo '<span class="text-sm text-gray-700">' . htmlspecialchars($job['salary']) . '</span>';
            echo '</div>';
            
            echo '<div class="flex items-center">';
            echo '<svg class="w-5 h-5 mr-2 text-assam-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">';
            echo '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>';
            echo '</svg>';
            echo '<span class="text-sm text-gray-700">' . htmlspecialchars($job['type']) . '</span>';
            echo '</div>';
            echo '</div>';

            // Skills
            echo '<div class="flex flex-wrap gap-2 mb-4">';
            foreach ($job['skills'] as $skill) {
                echo '<span class="bg-assam-green-50 text-assam-green-700 text-xs px-2 py-1 rounded-full">' . htmlspecialchars($skill) . '</span>';
            }
            echo '</div>';

            // Apply Button
            echo '<button class="w-full bg-assam-green-700 text-white py-3 rounded-lg hover:bg-assam-green-800 transition">';
            echo 'Apply Now';
            echo '</button>';

            echo '</div>';
            echo '</div>';
        }

        // Job Search and Filter Section
        echo '<div class="bg-white rounded-2xl shadow-lg p-6 mb-8">';
        echo '<form class="grid md:grid-cols-3 gap-4">';
        
        // Keyword Search
        echo '<div>';
        echo '<label class="block text-gray-700 mb-2">Keyword</label>';
        echo '<input type="text" placeholder="Job title or keywords" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-assam-green-500">';
        echo '</div>';
        
        // Category Dropdown
        echo '<div>';
        echo '<label class="block text-gray-700 mb-2">Job Category</label>';
        echo '<select class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-assam-green-500">';
        echo '<option>All Categories</option>';
        foreach ($job_categories as $category) {
            echo '<option>' . htmlspecialchars($category) . '</option>';
        }
        echo '</select>';
        echo '</div>';
        
        // Location
        echo '<div>';
        echo '<label class="block text-gray-700 mb-2">Location</label>';
        echo '<input type="text" placeholder="City or District" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-assam-green-500">';
        echo '</div>';
        
        echo '<div class="col-span-full">';
        echo '<button type="submit" class="w-full bg-assam-green-700 text-white py-3 rounded-lg hover:bg-assam-green-800 transition">';
        echo 'Search Jobs';
        echo '</button>';
        echo '</div>';
        
        echo '</form>';
        echo '</div>';

        // Job Listings
        echo '<div class="space-y-6">';
        foreach ($job_listings as $job) {
            generateJobListingCard($job);
        }
        echo '</div>';
        ?>
    </div>
</section>