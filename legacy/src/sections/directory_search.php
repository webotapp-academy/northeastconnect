<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once '../config.php';

// Validate and sanitize input
$term = isset($_GET['term']) ? trim($_GET['term']) : '';

error_log("Directory Search: Request received. Term: '$term'");

if (strlen($term) < 2) {
    error_log("Directory Search: Term too short");
    echo json_encode([]);
    exit;
}

try {
    // Prepare a search query that looks for matches in multiple fields
    $sql = "SELECT 
                id,
                business_name, 
                category, 
                district, 
                description
            FROM directory 
            WHERE 
                business_name LIKE :term OR 
                category LIKE :term OR 
                district LIKE :term OR 
                description LIKE :term
            LIMIT 5";

    error_log("Directory Search: Prepared SQL: $sql");
    error_log("Directory Search: Search parameter: %$term%");

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':term' => "%$term%"]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    error_log("Directory Search: Query results: " . json_encode($results));

    // Transform results into a more frontend-friendly format
    $suggestions = array_map(function($item) {
        return [
            'id' => $item['id'],
            'search_term' => $item['business_name'],
            'search_category' => $item['category'],
            'search_location' => $item['district']
        ];
    }, $results);

    error_log("Directory Search: Suggestions: " . json_encode($suggestions));

    echo json_encode($suggestions);
} catch (PDOException $e) {
    error_log("Directory Search: PDO Error: " . $e->getMessage());
    echo json_encode([]);
} catch (Exception $e) {
    error_log("Directory Search: Unexpected Error: " . $e->getMessage());
    echo json_encode([]);
}
exit;
