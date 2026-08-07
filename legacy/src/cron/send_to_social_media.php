<?php
require_once __DIR__ . '/../config.php';

// Configuration
$MAKE_WEBHOOK_URL = 'YOUR_MAKE_WEBHOOK_URL_HERE';
$SECRET_KEY = 'your_very_secret_and_long_random_key_here';

// Logging function
function logSocialMediaPush($message, $context = []) {
    $logDir = __DIR__ . '/../logs/social_media_push';
    
    // Ensure logs directory exists
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logFile = $logDir . '/social_media_push.log';
    
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[{$timestamp}] {$message}\n";
    
    if (!empty($context)) {
        $logMessage .= "Context: " . json_encode($context, JSON_PRETTY_PRINT) . "\n";
    }
    
    error_log($logMessage, 3, $logFile);
}

try {
    // Find listings prepared for social media push
    $stmt = $pdo->prepare("
        SELECT id, business_name, social_media_post_content 
        FROM directory 
        WHERE push_to_social_media = 'yes' 
        AND social_media_post_content IS NOT NULL 
        LIMIT 3
    ");
    $stmt->execute();
    $listings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    logSocialMediaPush("Social Media Push Started", [
        'Listings to Process' => count($listings)
    ]);

    foreach ($listings as $listing) {
        // Prepare payload
        $payload = [
            'secret_key' => $SECRET_KEY,
            'business_id' => $listing['id'],
            'business_name' => $listing['business_name'],
            'post_content' => $listing['social_media_post_content']
        ];

        // Send to Make.com webhook
        $ch = curl_init($MAKE_WEBHOOK_URL);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // Update status based on response
        if ($httpCode == 200) {
            $updateStmt = $pdo->prepare("
                UPDATE directory 
                SET 
                    push_to_social_media = 'no', 
                    social_media_post_content = NULL, 
                    social_media_post_date = NOW() 
                WHERE id = ?
            ");
            $updateStmt->execute([$listing['id']]);

            logSocialMediaPush("Social Media Push Successful", [
                'Business ID' => $listing['id'],
                'Business Name' => $listing['business_name'],
                'HTTP Response' => $httpCode
            ]);
        } else {
            logSocialMediaPush("Social Media Push Failed", [
                'Business ID' => $listing['id'],
                'Business Name' => $listing['business_name'],
                'HTTP Response' => $httpCode,
                'Response Body' => $response
            ]);
        }
    }

    logSocialMediaPush("Social Media Push Completed");
} catch (Exception $e) {
    logSocialMediaPush("Social Media Push Failed", [
        'Error' => $e->getMessage(),
        'Trace' => $e->getTraceAsString()
    ]);
}
?>
