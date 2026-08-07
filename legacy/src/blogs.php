<?php
require_once 'config.php';
require_once 'includes/header.php';

$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$perPage = 9;
$offset = ($page - 1) * $perPage;
$search_term = isset($_GET['search']) ? $_GET['search'] : '';
$category_filter = isset($_GET['category']) ? $_GET['category'] : '';

$blogs = [];
$total_blogs = 0;
$categories = [];
$error_message = '';

try {
    // Fetch all blog categories
    $stmt = $pdo->query("SELECT DISTINCT category FROM blogs WHERE status = 'Published' AND category != '' ORDER BY category");
    $categories = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Build query
    $where_conditions = ["status = 'Published'"];
    $params = [];

    if ($search_term) {
        $where_conditions[] = "(title LIKE ? OR content LIKE ? OR excerpt LIKE ?)";
        $params[] = "%$search_term%";
        $params[] = "%$search_term%";
        $params[] = "%$search_term%";
    }

    if ($category_filter) {
        $where_conditions[] = "category = ?";
        $params[] = $category_filter;
    }

    $where_clause = implode(' AND ', $where_conditions);

    // Count total blogs
    $count_sql = "SELECT COUNT(*) as total FROM blogs WHERE $where_clause";
    $count_stmt = $pdo->prepare($count_sql);
    $count_stmt->execute($params);
    $total_blogs = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Fetch blogs for current page
    $sql = "SELECT * FROM blogs WHERE $where_clause ORDER BY published_at DESC LIMIT ? OFFSET ?";
    $stmt = $pdo->prepare($sql);
    foreach ($params as $i => $param) {
        $stmt->bindValue($i + 1, $param);
    }
    $stmt->bindValue(count($params) + 1, $perPage, PDO::PARAM_INT);
    $stmt->bindValue(count($params) + 2, $offset, PDO::PARAM_INT);
    $stmt->execute();
    $blogs = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    $error_message = "Failed to load blogs.";
}
?>

<!-- Full-screen Hero Section -->
<header class="relative min-h-[70vh] flex items-center justify-center">
    <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-r from-purple-900 to-purple-600 opacity-80"></div>
        <img 
            src="assets/images/hero.jpg" 
            alt="Blogs" 
            class="w-full h-full object-cover"
        >
    </div>

    <div class="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Blog & Stories
        </h1>
        <p class="text-xl md:text-2xl text-gray-200 mb-12">
            Discover insights, tips, and stories about Assam
        </p>

        <!-- Search Bar -->
        <div class="max-w-3xl mx-auto relative group">
            <form action="" method="GET" class="relative">
                <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
                <input 
                    type="text" 
                    name="search"
                    value="<?= htmlspecialchars($search_term) ?>"
                    placeholder="Search blogs..." 
                    class="w-full pl-12 pr-24 py-5 rounded-full text-lg border-2 border-transparent focus:border-purple-500 focus:outline-none shadow-2xl bg-white/95 backdrop-blur-sm transition duration-300"
                >
                <button type="submit" class="absolute right-3 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white px-8 py-3 rounded-full hover:bg-purple-700 transition duration-300">
                    Search
                </button>
            </form>
        </div>
    </div>
</header>

<!-- Blogs Section -->
<div class="bg-gray-50 py-16">
    <div class="container mx-auto px-4">
        <!-- Categories Filter -->
        <div class="mb-8 flex flex-wrap gap-3 justify-center">
            <a href="blogs.php" class="px-4 py-2 rounded-full border-2 <?= !$category_filter ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-300 text-gray-700 hover:border-purple-600' ?> transition duration-300">
                All Blogs
            </a>
            <?php foreach ($categories as $cat): ?>
                <a href="blogs.php?category=<?= urlencode($cat) ?><?= $search_term ? '&search=' . urlencode($search_term) : '' ?>" class="px-4 py-2 rounded-full border-2 <?= $category_filter === $cat ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-300 text-gray-700 hover:border-purple-600' ?> transition duration-300">
                    <?= htmlspecialchars($cat) ?>
                </a>
            <?php endforeach; ?>
        </div>

        <?php if ($error_message): ?>
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
                <?= htmlspecialchars($error_message) ?>
            </div>
        <?php elseif (empty($blogs)): ?>
            <div class="text-center py-12 bg-white rounded-2xl shadow-lg">
                <div class="text-gray-400 text-6xl mb-4">📝</div>
                <p class="text-gray-600 text-xl">No blogs found.</p>
                <a href="blogs.php" class="inline-block mt-4 text-purple-600 hover:text-purple-700">View all blogs →</a>
            </div>
        <?php else: ?>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                <?php foreach ($blogs as $blog): ?>
                    <?php
                        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $blog['title']), '-'));
                    ?>
                    <a href="/blog/<?= $slug . '-' . $blog['id'] ?>" class="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div class="relative h-64 overflow-hidden bg-gradient-to-br from-purple-400 to-purple-600">
                            <?php if ($blog['featured_image']): ?>
                                <img 
                                    src="<?= htmlspecialchars($blog['featured_image']) ?>" 
                                    alt="<?= htmlspecialchars($blog['title']) ?>"
                                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                                >
                                <div class="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center hidden">
                                    <svg class="w-20 h-20 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                            <?php else: ?>
                                <div class="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                    <svg class="w-20 h-20 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                            <?php endif; ?>
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                            <div class="absolute bottom-0 left-0 right-0 p-4">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h3 class="text-white text-xl font-bold mb-2 line-clamp-2"><?= htmlspecialchars($blog['title']) ?></h3>
                                        <p class="text-white/80 text-sm"><?= date('M d, Y', strtotime($blog['published_at'])) ?></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="p-6">
                            <?php if ($blog['category']): ?>
                                <span class="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold mb-3">
                                    <?= htmlspecialchars($blog['category']) ?>
                                </span>
                            <?php endif; ?>
                            <p class="text-gray-600 line-clamp-2 mb-4">
                                <?php 
                                $excerpt_text = $blog['excerpt'] ?: $blog['content'];
                                $plain_text = strip_tags(html_entity_decode($excerpt_text, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
                                echo htmlspecialchars(substr($plain_text, 0, 120));
                                ?>...
                            </p>
                            <div class="flex justify-between items-center pt-4 border-t border-gray-200">
                                <span class="text-sm text-gray-500"><?= $blog['views'] ?> views</span>
                                <span class="text-purple-600 font-semibold group-hover:translate-x-1 transition-transform">Read More →</span>
                            </div>
                        </div>
                    </a>
                <?php endforeach; ?>
            </div>

            <!-- Pagination -->
            <?php
                $totalPages = ceil($total_blogs / $perPage);
                if ($totalPages > 1):
            ?>
                <div class="flex justify-center space-x-2">
                    <?php if ($page > 1): ?>
                        <a href="blogs.php?page=<?= $page - 1 ?><?= $search_term ? '&search=' . urlencode($search_term) : '' ?><?= $category_filter ? '&category=' . urlencode($category_filter) : '' ?>" class="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100">Prev</a>
                    <?php endif; ?>

                    <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                        <a href="blogs.php?page=<?= $i ?><?= $search_term ? '&search=' . urlencode($search_term) : '' ?><?= $category_filter ? '&category=' . urlencode($category_filter) : '' ?>" class="px-4 py-2 rounded-lg border <?= $i === $page ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-300 bg-white hover:bg-gray-100' ?>">
                            <?= $i ?>
                        </a>
                    <?php endfor; ?>

                    <?php if ($page < $totalPages): ?>
                        <a href="blogs.php?page=<?= $page + 1 ?><?= $search_term ? '&search=' . urlencode($search_term) : '' ?><?= $category_filter ? '&category=' . urlencode($category_filter) : '' ?>" class="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100">Next</a>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        <?php endif; ?>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>
