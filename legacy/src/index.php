<?php
// Include header
require_once 'includes/header.php';
require_once 'config.php';

// Fetch latest published news
try {
    $stmt = $pdo->prepare("SELECT id, title, url, category, content, image_urls, published_date FROM news WHERE status = 'Published' ORDER BY published_date DESC, id DESC LIMIT 8");
    $stmt->execute();
    $latestNews = $stmt->fetchAll();
} catch (Throwable $e) {
    $latestNews = [];
}
?>

<style>
    .home-news {
        margin: 32px auto;
        max-width: 1100px;
        padding: 0 16px;
    }

    .home-news h2 {
        margin: 0 0 12px;
        font-size: 22px;
    }

    .news-grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 16px;
    }

    .news-card {
        grid-column: span 3;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .news-card img {
        width: 100%;
        height: 160px;
        object-fit: cover;
        display: block;
    }

    .news-card .body {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .news-card .title {
        font-weight: 700;
        font-size: 16px;
        line-height: 1.2;
    }

    .news-card .meta {
        color: #6b7280;
        font-size: 12px;
    }

    .news-card .excerpt {
        color: #374151;
        font-size: 14px;
    }

    .news-card .actions {
        margin-top: auto;
    }

    .news-card a.more {
        display: inline-block;
        color: #2563eb;
        font-weight: 600;
        text-decoration: none;
    }

    @media (max-width: 1024px) {
        .news-card {
            grid-column: span 6;
        }
    }

    @media (max-width: 640px) {
        .news-card {
            grid-column: span 12;
        }
    }
</style>



<!-- Full-screen Hero Section with Search -->
<header class="relative min-h-screen flex items-center justify-center">
    <!-- Background Video/Image -->
    <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-black opacity-50"></div>
        <img
            src="assets/images/hero.jpg"
            alt="Assam Landscape"
            class="w-full h-full object-cover">
    </div>

    <!-- Hero Content -->
    <div class="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1 class="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Discover the Magic of North East India
        </h1>
        <p class="text-xl md:text-2xl text-gray-200 mb-12">
            Your gateway to Northeast India's most enchanting experiences
        </p>

        <!-- Google-style Search Bar -->
        <?php include 'sections/search.php'; ?>

        <!-- Quick Links -->
        <div class="mt-12 flex flex-wrap justify-center gap-4">
            <a href="#popular" class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition duration-300">
                Popular Destinations
            </a>
            <a href="#experiences" class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition duration-300">
                Top Experiences
            </a>
            <a href="#deals" class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition duration-300">
                Best Deals
            </a>
        </div>
    </div>

    <!-- Scroll Indicator -->
    <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
    </div>
</header>

<!-- Featured Categories -->
<section class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
        <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">Explore Assam</h2>
            <p class="text-xl text-gray-600">Discover the best of what Assam has to offer</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
            <?php
            $categories = [
                [
                    'title' => 'Wildlife',
                    'description' => 'Experience the majestic wildlife of Kaziranga',
                    'image' => 'assets/images/1.jpg'
                ],
                [
                    'title' => 'Culture',
                    'description' => 'Immerse in rich traditions and festivals',
                    'image' => 'assets/images/2.jpg'
                ],
                [
                    'title' => 'Adventure',
                    'description' => 'Explore thrilling outdoor activities',
                    'image' => 'assets/images/3.jpg'
                ]
            ];

            foreach ($categories as $category) {
                echo '<div class="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition duration-500">';
                echo '<div class="relative overflow-hidden">';
                echo '<img src="' . $category['image'] . '" alt="' . $category['title'] . '" class="w-full h-80 object-cover transform group-hover:scale-110 transition duration-500">';
                echo '<div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>';
                echo '<div class="absolute bottom-0 left-0 right-0 p-6">';
                echo '<h3 class="text-2xl font-bold text-white mb-2">' . $category['title'] . '</h3>';
                echo '<p class="text-gray-200 mb-4">' . $category['description'] . '</p>';
                echo '<a href="#" class="inline-flex items-center text-white">';
                echo 'Explore More';
                echo '<svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">';
                echo '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>';
                echo '</svg>';
                echo '</a>';
                echo '</div>';
                echo '</div>';
                echo '</div>';
            }
            ?>
        </div>
    </div>
</section>

<?php
// Include other sections
include 'sections/deals.php';
include 'sections/news.php';
include 'sections/listings.php';
//include 'sections/jobs.php';

// Include footer
require_once 'includes/footer.php';
?>