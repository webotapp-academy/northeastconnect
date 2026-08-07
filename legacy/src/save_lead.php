<?php
require_once 'config.php';

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Validate input
        $listing_id = isset($_POST['listing_id']) ? intval($_POST['listing_id']) : 0;
        $name = isset($_POST['name']) ? trim($_POST['name']) : '';
        $mobile = isset($_POST['mobile']) ? trim($_POST['mobile']) : '';

        if ($listing_id <= 0 || empty($name) || empty($mobile)) {
            echo json_encode(['success' => false, 'message' => 'Invalid input data.']);
            exit;
        }

        // Current timestamp
        $timestamp = date('Y-m-d H:i:s');

        // Insert lead matching the user's existing table structure
        // Columns: name, mobile, listing_id, timestamp
        $stmt = $pdo->prepare("INSERT INTO leads (name, mobile, listing_id, timestamp) VALUES (?, ?, ?, ?)");
        $result = $stmt->execute([$name, $mobile, $listing_id, $timestamp]);

        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Lead saved successfully.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to save lead.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    }

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error occurred.']);
}
?>
