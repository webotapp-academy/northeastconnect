<?php
// Cron script to generate descriptions for empty business listings
require_once __DIR__ . '/../config.php';

// Logging function
function logCronError($message, $context = []) {
    $logDir = __DIR__ . '/../logs/cron';
    
    // Ensure logs directory exists
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logFile = $logDir . '/description_generation.log';
    
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[{$timestamp}] {$message}\n";
    
    if (!empty($context)) {
        $logMessage .= "Context: " . json_encode($context, JSON_PRETTY_PRINT) . "\n";
    }
    
    error_log($logMessage, 3, $logFile);
}

// AI Providers Configuration (similar to admin/directory-edit.php)
$ai_providers = [
    'gemma' => [
        //'url' => 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAOrd8aV0xEcns5EDx9P9SP4nUAvvHJNtc',
        'url' => 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAOrd8aV0xEcns5EDx9P9SP4nUAvvHJNtc',
        'method' => function($prompt) {
            return [
                'contents' => [[
                    'parts' => [['text' => $prompt]]
                ]]
            ];
        },
        'extract' => function($result) {
            $text = '';
            if (!empty($result['candidates'][0]['content']['parts'])) {
                foreach ($result['candidates'][0]['content']['parts'] as $p) {
                    if (!empty($p['text'])) { $text .= $p['text'] . "\n"; }
                }
            }
            return trim($text);
        }
    ]
];

// Function to generate description
function generateDescription($business_name, $address) {
    global $ai_providers;
    
    $prompt = "Write a comprehensive 900-word professional business description for a business named '$business_name' located at '$address'.

Business Overview
Provide a detailed introduction to the business, highlighting its unique aspects and significance in the local Assam business landscape.

Core Services and Products
- Describe the primary services or products offered
- Highlight unique selling points
- Explain how these services meet local market needs

Customer Experience
Detail the approach to customer service, what makes the business stand out, and how it connects with the local community.

Future Vision
Discuss the business's potential for growth, future plans, and long-term goals.

Focus on:
1. Professional and engaging tone
2. Specific, contextual details
3. Avoiding generic placeholders
4. Providing a comprehensive yet concise overview

Guidelines:
- Do NOT use placeholders like [Year], [Founder's Name]
- If specific details are not known, omit them or write generally
- Ensure the description is informative and compelling
- Dont use ```html at the beginning of the Content
- Dont use ``` at the end of the Content
- Use <br> <br> two breaks after every paragraph

Tone: Professional, engaging, and informative. Write as if creating a compelling business profile for a regional business directory.

Output Format: Provide the description in clean, semantic HTML without <html>, <head>, or <body> tags.";

    // Use Gemma model
    $provider = $ai_providers['gemma'];
    
    try {
        $ch = curl_init($provider['url']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        
        $data = $provider['method']($prompt);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode == 200) {
            $result = json_decode($response, true);
            $description = $provider['extract']($result);

            // Ensure some basic HTML structure if not present
            if (strpos($description, '<') === false || strpos($description, '>') === false) {
                $description = '<div class="business-description">' . 
                        '<h2>Business Description</h2>' . 
                        '<p>' . $description . '</p>' . 
                        '</div>';
            }

            return $description;
        } else {
            logCronError("AI Description Generation Failed", [
                'HTTP Code' => $httpCode,
                'Response' => $response
            ]);
            return null;
        }
    } catch (Exception $e) {
        logCronError("Description Generation Exception", [
            'Error' => $e->getMessage(),
            'Trace' => $e->getTraceAsString()
        ]);
        return null;
    }
}

// Main cron job logic
try {
    // Find listings with empty descriptions, limit to 5 per run to avoid long-running scripts
    $stmt = $pdo->prepare("SELECT id, business_name, address FROM directory WHERE (description IS NULL OR description = '') AND status = 'Active' LIMIT 5");
    $stmt->execute();
    $listings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    logCronError("Cron Job Started", [
        'Listings to Process' => count($listings)
    ]);

    foreach ($listings as $listing) {
        // Generate description
        $description = generateDescription($listing['business_name'], $listing['address']);
        
        if ($description) {
            // Update database
            $updateStmt = $pdo->prepare("UPDATE directory SET description = ?, updated_at = NOW() WHERE id = ?");
            $result = $updateStmt->execute([$description, $listing['id']]);
            
            logCronError("Description Update", [
                'Business ID' => $listing['id'],
                'Business Name' => $listing['business_name'],
                'Description Generated' => strlen($description) > 0,
                'Update Result' => $result
            ]);
        }
    }

    logCronError("Cron Job Completed Successfully");
} catch (Exception $e) {
    logCronError("Cron Job Failed", [
        'Error' => $e->getMessage(),
        'Trace' => $e->getTraceAsString()
    ]);
}
?>
