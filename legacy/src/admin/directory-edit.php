<?php
require __DIR__ . '/auth.php';
admin_require_auth();

// Enable detailed error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

$page_title = 'Edit Business';
$active = 'directory';
$pdo = db();

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$editing = $id>0;
$errors=[];$saved=false;

// Logging function
function logError($message, $context = []) {
    $logFile = __DIR__ . '/../logs/directory_edit_errors.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[{$timestamp}] {$message}\n";
    
    if (!empty($context)) {
        $logMessage .= "Context: " . json_encode($context) . "\n";
    }
    
    // Append to log file
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

// fetch existing
$fields = [
    'business_name'=>'',
    'category'=>'',
    'subcategory'=>'',
    'address'=>'',
    'district'=>'',
    'contact_number'=>'',
    'email'=>'',
    'website'=>'',
    'description'=>'',
    'status'=>'Active'
];
if($editing){
    try {
        $stmt=$pdo->prepare("SELECT * FROM directory WHERE id=?");
        $stmt->execute([$id]);
        $row=$stmt->fetch(PDO::FETCH_ASSOC);
        if(!$row){ 
            logError("Business not found", ['id' => $id]);
            die('Not found');
        }
        $fields = array_merge($fields,$row);
    } catch (PDOException $e) {
        logError("Database error fetching business", [
            'error' => $e->getMessage(),
            'id' => $id
        ]);
        die('Database error');
    }
}

// AI Description Generation
if(isset($_POST['generate_description'])) {
    $business_name = $fields['business_name'];
    $address = $fields['address'];
    $ai_provider = $_POST['ai_provider'] ?? 'openrouter'; // Default to OpenRouter

    // Logging function for AI generation
    function logAIError($provider, $message, $context = []) {
        $logFile = __DIR__ . '/../logs/ai_description_errors.log';
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[{$timestamp}] {$provider}: {$message}\n";
        
        if (!empty($context)) {
            $logMessage .= "Context: " . json_encode($context) . "\n";
        }
        
        file_put_contents($logFile, $logMessage, FILE_APPEND);
    }

    // Prompt generation function
    function generatePrompt($business_name, $address) {
        return "Write a comprehensive 900-word professional business description for a business named '$business_name' located at '$address'.

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
- Dont use ``` these symbols html before beginning the content ot after ending ```
-  Use two <br> <br> after a new para 

Tone: Professional, engaging, and informative. Write as if creating a compelling business profile for a regional business directory.

Output Format: Provide the description in clean, semantic HTML without <html>, <head>, or <body> tags.";
    }

    // Modify the OpenRouter extraction to handle HTML content
    $ai_providers['openrouter']['extract'] = function($result) {
        // Trim and clean the response
        $text = trim($result['choices'][0]['message']['content'] ?? '');
        
        // Remove any <html>, <head>, or <body> tags
        $text = preg_replace('/<\/?(?:html|head|body)[^>]*>/i', '', $text);
        
        // Ensure some basic HTML structure if not present
        if (strpos($text, '<') === false || strpos($text, '>') === false) {
            $text = '<div class="business-description">' . 
                    '<h2>Business Description</h2>' . 
                    '<p>' . $text . '</p>' . 
                    '</div>';
        }
        
        return $text;
    };

    // AI Providers Configuration
    $ai_providers = [
        'gemini' => [
            'url' => 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAVAPAou0Xl0_6mT6Jcmnr8xNNZxq_yHJE',
            'method' => function($prompt) {
                $data = [
                    'contents' => [[
                        'parts' => [['text' => $prompt]]
                    ]]
                ];
                return $data;
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
        ],
        'openrouter' => [
            'url' => 'https://openrouter.ai/api/v1/chat/completions',
            'api_key' => getenv('OPENROUTER_API_KEY') ?: 'YOUR_API_KEY_HERE',
            'models' => [
                'openai/gpt-oss-20b:free',
                'z-ai/glm-4.5-air:free',
                'moonshotai/kimi-k2:free',
                
                'tencent/hunyuan-a13b-instruct:free',
                'google/gemma-3n-e2b-it:free'
            ],
            'method' => function($prompt, $model) {
                return [
                    'model' => $model,
                    'messages' => [
                        [
                            'role' => 'user', 
                            'content' => $prompt
                        ]
                    ]
                ];
            },
            'extract' => function($result) {
                // Trim and ensure HTML is valid
                $text = trim($result['choices'][0]['message']['content'] ?? '');
                
                // Basic HTML validation
                if (strpos($text, '<') === false || strpos($text, '>') === false) {
                    // If no HTML tags found, wrap in paragraph
                    $text = '<p>' . $text . '</p>';
                }
                
                return $text;
            }
        ]
    ];

    // Validate AI provider
    if (!isset($ai_providers[$ai_provider])) {
        $errors[] = 'Invalid AI provider selected.';
        logAIError('VALIDATION', 'Invalid AI provider', ['provider' => $ai_provider]);
        return;
    }

    $provider_config = $ai_providers[$ai_provider];
    $prompt = generatePrompt($business_name, $address);

    try {
        $ch = curl_init($provider_config['url']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        
        // Prepare data based on provider
        if ($ai_provider === 'gemini') {
            $data = $provider_config['method']($prompt);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        } elseif ($ai_provider === 'openrouter') {
            // If OpenRouter, allow model selection
            $selected_model = $_POST['openrouter_model'] ?? $provider_config['models'][0];
            
            // Validate selected model
            if (!in_array($selected_model, $provider_config['models'])) {
                $errors[] = 'Invalid OpenRouter model selected.';
                logAIError('VALIDATION', 'Invalid OpenRouter model', ['model' => $selected_model]);
                return;
            }

            $data = $provider_config['method']($prompt, $selected_model);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $provider_config['api_key']
            ]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        // Comprehensive error logging
        logAIError($ai_provider, "API Call Details", [
            'HTTP Code' => $httpCode,
            'cURL Error' => $curlError,
            'Full Response' => $response
        ]);

        if ($httpCode == 200) {
            $result = json_decode($response, true);
            
            // Extract text based on provider
            $text = $provider_config['extract']($result);

            if ($text) {
                $fields['description'] = $text;
            } else {
                $errors[] = 'Failed to generate description. Unexpected API response.';
                logAIError($ai_provider, 'Unexpected API Response', ['result' => $result]);
            }
        } else {
            $errors[] = "Failed to generate description. HTTP Error: {$httpCode}. Check server logs for details.";
        }
    } catch (Exception $e) {
        $errors[] = 'An unexpected error occurred: ' . $e->getMessage();
        logAIError($ai_provider, 'Unexpected Exception', ['error' => $e->getMessage()]);
    }
}

if($_SERVER['REQUEST_METHOD']==='POST' && !isset($_POST['generate_description'])){
    try {
        foreach($fields as $k=>$_) {
            $fields[$k]=trim($_POST[$k]??'');
        }
        if($fields['business_name']===''){ $errors[]='Business name required'; }
        if(!$errors){
            // Prepare parameters array for binding
            $params = [
                'business_name' => $fields['business_name'],
                'category' => $fields['category'],
                'subcategory' => $fields['subcategory'],
                'address' => $fields['address'],
                'district' => $fields['district'],
                'contact_number' => $fields['contact_number'],
                'email' => $fields['email'],
                'website' => $fields['website'],
                'description' => $fields['description'],
                'status' => $fields['status']
            ];

            if($editing){
                $sql="UPDATE directory SET 
                    business_name=:business_name,
                    category=:category,
                    subcategory=:subcategory,
                    address=:address,
                    district=:district,
                    contact_number=:contact_number,
                    email=:email,
                    website=:website,
                    description=:description,
                    status=:status 
                    WHERE id=:id";
                $params['id'] = $id;
            }else{
                $sql="INSERT INTO directory (
                    business_name,category,subcategory,address,district,
                    contact_number,email,website,description,status
                ) VALUES (
                    :business_name,:category,:subcategory,:address,:district,
                    :contact_number,:email,:website,:description,:status
                )";
            }
            $stmt=$pdo->prepare($sql);
            $stmt->execute($params);
            $saved=true;
            if(!$editing){ $id=$pdo->lastInsertId(); $editing=true; }
        }
    } catch (PDOException $e) {
        logError("Database error saving business", [
            'error' => $e->getMessage(),
            'sql' => $sql,
            'params' => array_map(function($v) { 
                return is_string($v) ? substr($v, 0, 100) : $v; 
            }, $params ?? [])
        ]);
        $errors[] = 'Failed to save business details. Error: ' . $e->getMessage();
    }
}

function render_content(){
    global $fields,$errors,$saved,$editing,$id;
    ?>
    <?php if($saved): ?><div class="alert" style="background:#ecfdf5;color:#065f46;margin-bottom:12px;">Saved successfully.</div><?php endif; ?>
    <?php foreach($errors as $e): ?><div class="alert" style="background:#fef2f2;color:#991b1b;margin-bottom:12px;"><?= htmlspecialchars($e) ?></div><?php endforeach; ?>

    <form method="post" class="form" style="max-width:800px;" id="business-form">
        <!-- Hidden input to store the description for form submission -->
 
        <!-- Existing form fields -->
        <div class="field"><label class="label">Business Name</label><input class="input" name="business_name" value="<?= htmlspecialchars($fields['business_name']) ?>" required></div>
        <div class="grid-2">
            <div class="field"><label class="label">Category</label><input class="input" name="category" value="<?= htmlspecialchars($fields['category']) ?>"></div>
            <div class="field"><label class="label">Subcategory</label><input class="input" name="subcategory" value="<?= htmlspecialchars($fields['subcategory']) ?>"></div>
        </div>
        <div class="field"><label class="label">Address</label><input class="input" name="address" value="<?= htmlspecialchars($fields['address']) ?>"></div>
        <div class="grid-2">
            <div class="field"><label class="label">District</label><input class="input" name="district" value="<?= htmlspecialchars($fields['district']) ?>"></div>
            <div class="field"><label class="label">Status</label><select class="select" name="status"><option <?= $fields['status']=='Active'?'selected':'';?>>Active</option><option <?= $fields['status']=='Inactive'?'selected':'';?>>Inactive</option><option <?= $fields['status']=='Pending'?'selected':'';?>>Pending</option></select></div>
        </div>
        <div class="grid-2">
            <div class="field"><label class="label">Phone</label><input class="input" name="contact_number" value="<?= htmlspecialchars($fields['contact_number']) ?>"></div>
            <div class="field"><label class="label">Email</label><input class="input" name="email" value="<?= htmlspecialchars($fields['email']) ?>"></div>
        </div>
        <div class="field"><label class="label">Website</label><input class="input" name="website" value="<?= htmlspecialchars($fields['website']) ?>"></div>
        
        <div class="field">
            <label class="label">Description Generation</label>
            <div style="display:flex;gap:10px;margin-bottom:8px;">
                <select name="ai_provider" id="ai-provider-select" class="select">
                    <option value="gemini">Google Gemini (Paid)</option>
                    <option value="openrouter" selected>OpenRouter (Free)</option>
                </select>
                <select name="openrouter_model" id="openrouter-model-select" class="select">
                    <option value="openai/gpt-oss-20b:free">OpenAI GPT OSS 20B</option>
                    <option value="z-ai/glm-4.5-air:free">Z-AI GLM 4.5 Air</option>
                    <option value="moonshotai/kimi-k2:free">Moonshot Kimi K2</option>
                    <option value="google/gemma-3n-e2b-it:free">Google Gemma 3N E2B IT</option>
                    <option value="tencent/hunyuan-a13b-instruct:free" selected>Tencent Hunyuan A13B Instruct</option>
                </select>
                <button type="submit" name="generate_description" class="btn outline" id="generate-description-btn">
                    Generate AI Description
                </button>
            </div>
            <div id="description-loading" style="display:none; margin-bottom:12px;">
                <div class="loading-spinner" style="
                    display: inline-block;
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(0,0,0,0.1);
                    border-left-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                "></div>
                <span style="margin-left:10px; color:var(--muted);">Generating description...</span>
            </div>
            
            <!-- Single textarea for CKEditor -->
            <textarea name="description" id="description-textarea"><?= htmlspecialchars($fields['description']) ?></textarea>
            
            <div id="ckeditor-loading-error"></div>
        </div>
        
        <div class="actions">
            <button class="btn" type="submit">Save</button> 
            <a class="btn outline" href="/discoverassam/admin/directory.php">Back</a>
        </div>
    </form>

    <script src="https://cdn.ckeditor.com/ckeditor5/41.3.1/classic/ckeditor.js"></script>
    <style>
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .ck-editor__editable {
            min-height: 300px;
        }
        #ckeditor-loading-error {
            color: red;
            margin-top: 10px;
            display: none;
        }
    </style>

    <script>
    // Fallback to standard textarea if CKEditor fails
    // function fallbackToTextarea() {
    //     const textarea = document.getElementById('description-textarea');
    //     textarea.style.display = 'block';
    //     const errorDiv = document.getElementById('ckeditor-loading-error');
    //     errorDiv.innerHTML = 'Failed to load advanced editor. Using standard textarea.';
    //     errorDiv.style.display = 'block';
    // }

    // Dynamically load CKEditor with error handling
    function loadCKEditor() {
        // Check if ClassicEditor is available
        if (typeof ClassicEditor === 'undefined') {
            console.error('CKEditor script not loaded');
            fallbackToTextarea();
            return;
        }

        const descriptionTextarea = document.getElementById('description-textarea');
        const hiddenInput = document.getElementById('description-hidden-input');
        const errorDiv = document.getElementById('ckeditor-loading-error');

        // Timeout to catch loading issues
        const loadTimeout = setTimeout(() => {
            console.error('CKEditor loading timed out');
            fallbackToTextarea();
        }, 5000);

        ClassicEditor
            .create(descriptionTextarea, {
                toolbar: [
                    'sourceEditing', 
                    '|', 
                    'heading', 
                    'bold', 'italic', 
                    'link', 
                    'bulletedList', 'numberedList', 
                    'blockQuote',
                    '|',
                    'undo', 'redo'
                ],
                // Explicitly set initial mode
                initialMode: 'source',
                startupMode: 'source'
            })
            .then(editor => {
                clearTimeout(loadTimeout);
                
                // Global editor reference
                window.businessDescriptionEditor = editor;

                // Force source mode immediately after initialization
                editor.switchTo('sourceEditing');

                // Update hidden input when content changes
                editor.model.document.on('change', () => {
                    hiddenInput.value = editor.getData();
                });

                // Event listener for generate button
                const form = document.getElementById('business-form');
                const generateBtn = document.getElementById('generate-description-btn');
                const loadingIndicator = document.getElementById('description-loading');

                generateBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Show loading spinner
                    loadingIndicator.style.display = 'flex';
                    generateBtn.disabled = true;
                    editor.isReadOnly = true;

                    // Submit form via AJAX
                    const formData = new FormData(form);
                    formData.set('generate_description', '1');

                    fetch(window.location.href, {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.text())
                    .then(html => {
                        // Create a temporary div to parse the response HTML
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = html;

                        // Find the description textarea in the response
                        const newDescriptionTextarea = tempDiv.querySelector('#description-textarea');
                        
                        if (newDescriptionTextarea) {
                            editor.setData(newDescriptionTextarea.value);
                            hiddenInput.value = newDescriptionTextarea.value;
                        }

                        // Hide loading spinner
                        loadingIndicator.style.display = 'none';
                        generateBtn.disabled = false;
                        editor.isReadOnly = false;
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        loadingIndicator.style.display = 'none';
                        generateBtn.disabled = false;
                        editor.isReadOnly = false;
                        alert('Failed to generate description. Please try again.');
                    });
                });
            })
            .catch(error => {
                clearTimeout(loadTimeout);
                console.error('CKEditor initialization error:', error);
                fallbackToTextarea();
            });
    }

    // Ensure script is fully loaded before initializing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadCKEditor);
    } else {
        loadCKEditor();
    }
    </script>
    <?php
}

include __DIR__ . '/partials/layout.php';
?>
