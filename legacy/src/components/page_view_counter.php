<?php
// Ensure $pdo is available
if (!isset($pdo)) {
    // Try to find config.php relative to this file
    $configPath = __DIR__ . '/../config.php';
    if (file_exists($configPath)) {
        require_once $configPath;
    }
}

if (isset($pdo)) {
    try {



        // List of main pages to exclude from counting (filenames and pretty URLs)
        $excludedPages = [
            'adventure.php',
            // 'article.php', 'article',
            'contact.php', 'contact',
            'culture.php', 'culture',
            'directory.php', 'directory',
            'index.php', 'index',
            'news.php', 'news',
            'post-ads.php', 'post-ads',
            'wildlife.php' // Only exclude the wildlife.php file and /wildlife root, not all /wildlife/*
        ];

        // Get the current page filename and first path segment
        $requestPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $currentFile = basename($requestPath);
        $segments = explode('/', trim($requestPath, '/'));
        $firstSegment = isset($segments[0]) ? $segments[0] : '';

        // Exclude only if it's exactly the wildlife.php file or the /wildlife root (not subpages)
        if (
            in_array($currentFile, $excludedPages, true) ||
            ($firstSegment === 'wildlife' && (count($segments) === 1 || $requestPath === '/wildlife'))
        ) {
            return;
        }

        // Get the current page identifier (full URL path + query string)
        $currentPage = $_SERVER['REQUEST_URI'];
        // Optionally, you can sanitize or limit the length if needed
        $currentPage = substr($currentPage, 0, 255); // Ensure it fits in VARCHAR(255)

        // Create table if not exists
        $createTableSql = "CREATE TABLE IF NOT EXISTS page_views (
            id INT AUTO_INCREMENT PRIMARY KEY,
            page_name VARCHAR(255) NOT NULL UNIQUE,
            views INT DEFAULT 0,
            last_viewed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        $pdo->exec($createTableSql);

        // Increment view count for this specific URL
        $stmt = $pdo->prepare("INSERT INTO page_views (page_name, views) VALUES (:page, 1) ON DUPLICATE KEY UPDATE views = views + 1");
        $stmt->execute(['page' => $currentPage]);

        // Get current count
        $stmt = $pdo->prepare("SELECT views FROM page_views WHERE page_name = :page");
        $stmt->execute(['page' => $currentPage]);
        $views = $stmt->fetchColumn();

        // Display
        echo '<div class="page-views-counter inline-flex items-center text-gray-400 text-sm ml-4">';
        echo '<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>';
        echo '<span>' . number_format($views) . ' Views</span>';
        echo '</div>';

    } catch (PDOException $e) {
        // Silently fail if DB issue, so we don't break the footer
        error_log("Page view counter error: " . $e->getMessage());
    }
}
?>
