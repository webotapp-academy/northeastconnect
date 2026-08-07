<?php
header('Content-Type: application/json');

try {
    require_once __DIR__ . '/config.php';

    $term = isset($_GET['term']) ? trim($_GET['term']) : '';
    $searchTerm = '%' . $term . '%';

    $results = [];

    // Wildlife
    $stmt = $pdo->prepare("SELECT id, name FROM wildlife WHERE name LIKE :term OR description LIKE :term LIMIT 5");
    $stmt->execute(['term' => $searchTerm]);
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        // Create slug from name
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $row['name']), '-'));
        $results[] = [
            'label' => $row['name'],
            'type' => 'wildlife',
            'id' => $row['id'],
            'url' => '/wildlife/' . $slug . '-' . $row['id']
        ];
    }

    // Adventure
    $stmt = $pdo->prepare("SELECT id, name FROM adventure WHERE name LIKE :term OR description LIKE :term LIMIT 5");
    $stmt->execute(['term' => $searchTerm]);
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $row['name']), '-'));
        $results[] = [
            'label' => $row['name'],
            'type' => 'adventure',
            'id' => $row['id'],
            'url' => '/adventure/' . $slug . '-' . $row['id']
        ];
    }

    // Culture
    $stmt = $pdo->prepare("SELECT id, name FROM culture WHERE name LIKE :term OR description LIKE :term LIMIT 5");
    $stmt->execute(['term' => $searchTerm]);
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $results[] = [
            'label' => $row['name'],
            'type' => 'culture',
            'id' => $row['id'],
            'url' => '/details.php?id=' . $row['id']
        ];
    }

    // News
    $stmt = $pdo->prepare("SELECT id, title, url FROM news WHERE title LIKE :term OR content LIKE :term LIMIT 5");
    $stmt->execute(['term' => $searchTerm]);
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        // Create slug from title if url is not usable
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $row['title']), '-'));
        $results[] = [
            'label' => $row['title'],
            'type' => 'news',
            'id' => $row['id'],
            'url' => '/news/' . $slug
        ];
    }

    // Directory
    $stmt = $pdo->prepare("SELECT id, business_name, category FROM directory WHERE business_name LIKE :term OR category LIKE :term OR description LIKE :term LIMIT 5");
    $stmt->execute(['term' => $searchTerm]);
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        // Create clean slug from business name
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $row['business_name']), '-'));
        $results[] = [
            'label' => $row['business_name'],
            'type' => 'directory',
            'id' => $row['id'],
            'url' => '/listing/' . $slug . '-' . $row['id']
        ];
    }

    echo json_encode($results);
} catch (Exception $e) {
    error_log("Search error: " . $e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
}
?>
