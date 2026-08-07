<?php
require_once 'config.php';
require_once 'includes/header.php';

function perform_search($term) {
    $pdo = db_connect();
    
    // Prepare a complex search across multiple tables
    $tables = [
        'wildlife' => [
            'columns' => ['name', 'description', 'location', 'district'],
            'display_columns' => ['name', 'description', 'location'],
            'link_column' => 'name'
        ],
        'culture' => [
            'columns' => ['name', 'description', 'location', 'district'],
            'display_columns' => ['name', 'description', 'location'],
            'link_column' => 'name'
        ],
        'adventure' => [
            'columns' => ['name', 'description', 'location', 'district'],
            'display_columns' => ['name', 'description', 'location'],
            'link_column' => 'name'
        ],
        'directory' => [
            'columns' => ['business_name', 'description', 'address', 'district'],
            'display_columns' => ['business_name', 'description', 'address'],
            'link_column' => 'business_name'
        ]
    ];
    
    $results = [];
    
    foreach ($tables as $table => $config) {
        $conditions = [];
        foreach ($config['columns'] as $column) {
            $conditions[] = "$column LIKE :query";
        }
        
        $query_param = "%$term%";
        $select_columns = implode(', ', $config['display_columns']);
        $sql = "SELECT '$table' as source, $select_columns, '{$config['link_column']}' as link_column FROM $table WHERE " . implode(' OR ', $conditions);
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['query' => $query_param]);
        
        $table_results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Add source-specific information
        $table_results = array_map(function($result) use ($table) {
            $result['source_icon'] = match($table) {
                'wildlife' => 'wildlife-icon.svg',
                'culture' => 'culture-icon.svg',
                'adventure' => 'adventure-icon.svg',
                'directory' => 'directory-icon.svg',
                default => 'default-icon.svg'
            };
            return $result;
        }, $table_results);
        
        $results = array_merge($results, $table_results);
    }
    
    return $results;
}

// Get search term
$search_term = isset($_GET['term']) ? trim($_GET['term']) : '';
$search_results = $search_term ? perform_search($search_term) : [];

// Log the search
if (!empty($search_term)) {
    $pdo = db_connect();
    $stmt = $pdo->prepare("INSERT INTO searches (search_term, search_category, search_location, search_date, search_count) VALUES (:term, 'General', 'Assam', NOW(), 1)");
    $stmt->execute(['term' => $search_term]);
}
?>

<div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">Search Results for "<?php echo htmlspecialchars($search_term); ?>"</h1>
        
        <?php if (empty($search_results)): ?>
            <div class="bg-white shadow-md rounded-lg p-6 text-center">
                <p class="text-xl text-gray-600">No results found. Try a different search term.</p>
                <div class="mt-4">
                    <p class="text-sm text-gray-500">Suggestions:</p>
                    <ul class="list-disc list-inside text-sm text-gray-500 mt-2">
                        <li>Check your spelling</li>
                        <li>Try more general terms</li>
                        <li>Use fewer words</li>
                    </ul>
                </div>
            </div>
        <?php else: ?>
            <div class="grid gap-4">
                <?php foreach ($search_results as $result): ?>
                    <div class="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow">
                        <div class="flex items-start">
                            <div class="mr-4">
                                <img 
                                    src="assets/images/icons/<?php echo htmlspecialchars($result['source_icon']); ?>" 
                                    alt="<?php echo htmlspecialchars($result['source']); ?> icon" 
                                    class="w-10 h-10"
                                >
                            </div>
                            <div class="flex-1">
                                <h2 class="text-xl font-semibold text-gray-800">
                                    <?php echo htmlspecialchars($result[$result['link_column']]); ?>
                                </h2>
                                <p class="text-gray-600 mt-2">
                                    <?php 
                                    // Display description, truncate if too long
                                    $description = $result['description'] ?? '';
                                    echo strlen($description) > 200 
                                        ? htmlspecialchars(substr($description, 0, 200) . '...') 
                                        : htmlspecialchars($description); 
                                    ?>
                                </p>
                                <div class="mt-2 text-sm text-gray-500">
                                    <span class="bg-gray-100 px-2 py-1 rounded">
                                        <?php echo ucfirst(htmlspecialchars($result['source'])); ?>
                                    </span>
                                    <?php if (!empty($result['location'])): ?>
                                        <span class="ml-2">
                                            📍 <?php echo htmlspecialchars($result['location']); ?>
                                        </span>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
            
            <div class="mt-6 text-center text-gray-500">
                <p>Showing <?php echo count($search_results); ?> results for "<?php echo htmlspecialchars($search_term); ?>"</p>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>