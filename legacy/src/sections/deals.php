<!-- Hot Deals Section -->
<section class="py-20 bg-white">
    <div class="container mx-auto px-4">
        <div class="text-center mb-16">
            <span class="text-assam-green-700 font-semibold text-lg">Limited Time Offers</span>
            <h2 class="text-4xl font-bold text-gray-900 mt-2 mb-4">Exclusive Deals & Packages</h2>
            <p class="text-xl text-gray-600">Discover incredible savings on your next Assam adventure</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
            <?php 
            $deals = [
                [
                    'title' => 'Kaziranga Safari Package',
                    'description' => '3 Days of wildlife adventure with luxury stay',
                    'original_price' => 15000,
                    'discounted_price' => 10500,
                    'discount_percentage' => 30,
                    'image' => 'https://plus.unsplash.com/premium_photo-1661811791855-532fdea19159?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZWxlcGhhbnQlMjBzYWZhcml8ZW58MHx8MHx8fDA%3D'
                ],
                [
                    'title' => 'Cultural Heritage Tour',
                    'description' => '5 Days exploring Majuli and local traditions',
                    'original_price' => 20000,
                    'discounted_price' => 15000,
                    'discount_percentage' => 25,
                    'image' => 'https://images.unsplash.com/photo-1698515959329-878121b965aa?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cml2ZXIlMjBpc2xhbmR8ZW58MHx8MHx8fDA%3D'
                ],
                [
                    'title' => 'Tea Garden Experience',
                    'description' => '2 Days luxury stay in tea gardens',
                    'original_price' => 12000,
                    'discounted_price' => 7200,
                    'discount_percentage' => 40,
                    'image' => 'https://images.unsplash.com/photo-1491497895121-1334fc14d8c9?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGVhJTIwZ2FyZGVufGVufDB8fDB8fHww'
                ]
            ];

            foreach ($deals as $deal) {
                echo '<div class="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition duration-500">';
                echo '<div class="relative">';
                echo '<img src="' . $deal['image'] . '" alt="' . $deal['title'] . '" class="w-full h-48 object-cover">';
                echo '<div class="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-semibold">';
                echo $deal['discount_percentage'] . '% OFF';
                echo '</div>';
                echo '</div>';
                echo '<div class="p-6">';
                echo '<h3 class="text-xl font-bold text-gray-900 mb-2">' . $deal['title'] . '</h3>';
                echo '<p class="text-gray-600 mb-4">' . $deal['description'] . '</p>';
                echo '<div class="flex items-center justify-between mb-4">';
                echo '<div>';
                echo '<span class="text-gray-400 line-through text-lg">₹' . number_format($deal['original_price']) . '</span>';
                echo '<span class="text-2xl font-bold text-assam-green-700 ml-2">₹' . number_format($deal['discounted_price']) . '</span>';
                echo '</div>';
                echo '<span class="text-sm text-gray-500">Per person</span>';
                echo '</div>';
                echo '<button class="w-full bg-assam-green-700 text-white py-3 rounded-lg hover:bg-assam-green-800 transition">Book Now</button>';
                echo '</div>';
                echo '</div>';
            }
            ?>
        </div>
    </div>
</section>