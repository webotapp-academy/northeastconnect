<?php
// Cron script to prepare directory listings for social media publishing
require_once __DIR__ . '/../config.php';

// Logging function
function logSocialMediaPrep($message, $context = []) {
    $logDir = __DIR__ . '/../logs/social_media';
    
    // Ensure logs directory exists
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logFile = $logDir . '/social_media_prep.log';
    
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[{$timestamp}] {$message}\n";
    
    if (!empty($context)) {
        $logMessage .= "Context: " . json_encode($context, JSON_PRETTY_PRINT) . "\n";
    }
    
    error_log($logMessage, 3, $logFile);
}

// Function to generate social media post content
function generateSocialMediaPost($listing) {
    // Extract key details
    $businessName = htmlspecialchars_decode($listing['business_name']);
    $category = htmlspecialchars_decode($listing['category']);
    $district = htmlspecialchars_decode($listing['district'] ?? 'Assam');
    $address = htmlspecialchars_decode($listing['address'] ?? '');
    
    // Construct engaging post
    $hashtags = [
        '#DiscoverAssam', 
        '#LocalBusiness', 
        '#' . str_replace(' ', '', $category), 
        '#' . str_replace(' ', '', $district)
    ];
    
    $postContent = "🌟 Discover a Local Gem in Assam! 🌟\n\n";
    $postContent .= "Business: {$businessName}\n";
    $postContent .= "Category: {$category}\n";
    $postContent .= "Location: {$district}\n";
    
    if (!empty($address)) {
        $postContent .= "Address: {$address}\n\n";
    }
    
    $postContent .= "Explore local businesses that make Assam incredible! 💼🏡\n\n";
    $postContent .= implode(' ', $hashtags);
    
    return $postContent;
}

try {
    // Find listings not yet pushed to social media, limit to 3 per run
    $stmt = $pdo->prepare("
        SELECT id, business_name, category, district, address 
        FROM directory 
        WHERE (push_to_social_media IS NULL OR push_to_social_media = 'no') 
        AND status = 'Active' 
        LIMIT 3
    ");
    $stmt->execute();
    $listings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    logSocialMediaPrep("Social Media Prep Started", [
        'Listings to Process' => count($listings)
    ]);

    foreach ($listings as $listing) {
        // Generate social media post
        $postContent = generateSocialMediaPost($listing);
        
        // Prepare update statement
        $updateStmt = $pdo->prepare("
            UPDATE directory 
            SET 
                push_to_social_media = 'yes', 
                social_media_post_content = ?, 
                social_media_post_date = NOW() 
            WHERE id = ?
        ");
        
        try {
            $result = $updateStmt->execute([
                $postContent, 
                $listing['id']
            ]);
            
            logSocialMediaPrep("Listing Prepared for Social Media", [
                'Business ID' => $listing['id'],
                'Business Name' => $listing['business_name'],
                'Post Generated' => strlen($postContent) > 0,
                'Update Result' => $result
            ]);
        } catch (PDOException $e) {
            logSocialMediaPrep("Update Failed", [
                'Business ID' => $listing['id'],
                'Error' => $e->getMessage()
            ]);
        }
    }

    logSocialMediaPrep("Social Media Prep Completed Successfully");
} catch (Exception $e) {
    logSocialMediaPrep("Social Media Prep Failed", [
        'Error' => $e->getMessage(),
        'Trace' => $e->getTraceAsString()
    ]);
}
?>
