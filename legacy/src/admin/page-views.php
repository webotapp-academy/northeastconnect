<?php
// admin/page-views.php

// Set page title and active tab for layout
$page_title = 'Page View Statistics';
$active = 'page-views';
require_once __DIR__ . '/../config.php';

// Check admin authentication (optional, depends on your auth system)
// require_once __DIR__ . '/auth.php';
// if (!isAdmin()) { die('Unauthorized'); }

$pageViews = [];
$error = '';
$categorizedViews = [];

if (isset($pdo)) {
    try {
        $stmt = $pdo->query("SELECT page_name, views, last_viewed FROM page_views ORDER BY views DESC, last_viewed DESC");
        $pageViews = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Categorize views by the first path segment
        foreach ($pageViews as $row) {
            $path = parse_url($row['page_name'], PHP_URL_PATH);
            $segments = explode('/', trim($path, '/'));
            $category = isset($segments[0]) && !empty($segments[0]) ? $segments[0] : 'Other';
            
            if (!isset($categorizedViews[$category])) {
                $categorizedViews[$category] = [
                    'total_views' => 0,
                    'pages' => []
                ];
            }
            
            $categorizedViews[$category]['total_views'] += $row['views'];
            $categorizedViews[$category]['pages'][] = $row;
        }
        
        // Sort categories by total views
        uasort($categorizedViews, function($a, $b) {
            return $b['total_views'] - $a['total_views'];
        });
        
    } catch (PDOException $e) {
        $error = 'Database error: ' . $e->getMessage();
    }
} else {
    $error = 'Database connection not found.';
}

// Render content for layout
function render_content() {
    global $error, $categorizedViews;
    
    echo '<div style="padding:2rem;background:#f9fafb;min-height:100vh;">';
    
    if ($error) {
        echo '<div style="background:#fee2e2;color:#991b1b;padding:1rem;border-radius:0.5rem;border-left:4px solid #dc2626;">' . htmlspecialchars($error) . '</div>';
    } else if (empty($categorizedViews)) {
        echo '<div style="text-align:center;padding:3rem;color:#6b7280;"><p>No page view data available yet.</p></div>';
    } else {
        echo '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;">';
        
        foreach ($categorizedViews as $category => $data) {
            $categoryId = 'modal-' . preg_replace('/[^a-zA-Z0-9]/', '', $category);
            
            // Clickable tile
            echo '<div style="background:white;border-radius:0.75rem;box-shadow:0 1px 3px rgba(0,0,0,0.1);overflow:hidden;cursor:pointer;transition:all 0.3s ease;" onmouseover="this.style.boxShadow=\'0 4px 12px rgba(0,0,0,0.15)\';" onmouseout="this.style.boxShadow=\'0 1px 3px rgba(0,0,0,0.1)\';" onclick="openModal(\'' . $categoryId . '\')">';
            
            // Tile header
            echo '<div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:1.5rem;">';
            echo '<div style="display:flex;justify-content:space-between;align-items:center;">';
            echo '<div>';
            echo '<h3 style="margin:0;font-size:1.1rem;font-weight:600;text-transform:capitalize;">' . htmlspecialchars($category) . '</h3>';
            echo '<p style="margin:0.5rem 0 0 0;opacity:0.9;font-size:0.9rem;">Total Views</p>';
            echo '</div>';
            echo '<div style="text-align:right;">';
            echo '<div style="font-size:2rem;font-weight:bold;">' . number_format($data['total_views']) . '</div>';
            echo '<span style="font-size:0.8rem;opacity:0.8;">📊</span>';
            echo '</div>';
            echo '</div>';
            echo '</div>';
            
            echo '</div>';
            
            // Modal for this category
            echo '<div id="' . $categoryId . '" class="modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center;">';
            echo '<div style="background:white;border-radius:1rem;max-width:700px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);">';
            
            // Modal header
            echo '<div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:2rem;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e5e7eb;">';
            echo '<div>';
            echo '<h2 style="margin:0;font-size:1.5rem;font-weight:700;text-transform:capitalize;">' . htmlspecialchars($category) . '</h2>';
            echo '<p style="margin:0.5rem 0 0 0;opacity:0.9;">Subpage Statistics</p>';
            echo '</div>';
            echo '<button onclick="closeModal(\'' . $categoryId . '\')" style="background:none;border:none;color:white;font-size:1.5rem;cursor:pointer;padding:0;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">✕</button>';
            echo '</div>';
            
            // Modal content
            echo '<div style="padding:2rem;">';
            echo '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100%,1fr));gap:1rem;">';
            
            foreach ($data['pages'] as $page) {
                echo '<div style="padding:1rem;background:#f9fafb;border-radius:0.75rem;border-left:4px solid #667eea;border:1px solid #e5e7eb;">';
                echo '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">';
                echo '<p style="margin:0;font-size:0.95rem;font-weight:500;color:#1f2937;word-break:break-word;flex:1;">' . htmlspecialchars($page['page_name']) . '</p>';
                echo '<span style="background:#dbeafe;color:#1e40af;padding:0.35rem 0.85rem;border-radius:0.375rem;font-size:0.85rem;font-weight:700;white-space:nowrap;margin-left:0.75rem;">' . number_format($page['views']) . ' views</span>';
                echo '</div>';
                echo '<p style="margin:0;font-size:0.8rem;color:#6b7280;">Last viewed: <strong>' . htmlspecialchars(substr($page['last_viewed'], 0, 16)) . '</strong></p>';
                echo '</div>';
            }
            
            echo '</div>';
            echo '</div>';
            
            echo '</div>';
            echo '</div>';
        }
        
        echo '</div>';
    }
    
    echo '</div>';
    
    // Add CSS and JavaScript for modals
    echo '<style>';
    echo '.modal { display: none !important; }';
    echo '.modal.active { display: flex !important; }';
    echo '.modal { animation: fadeIn 0.3s ease-in-out; }';
    echo '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }';
    echo '</style>';
    echo '<script>';
    echo 'function openModal(modalId) {';
    echo '  document.getElementById(modalId).classList.add("active");';
    echo '}';
    echo 'function closeModal(modalId) {';
    echo '  document.getElementById(modalId).classList.remove("active");';
    echo '}';
    echo 'document.addEventListener("click", function(event) {';
    echo '  if (event.target.classList.contains("modal")) {';
    echo '    event.target.classList.remove("active");';
    echo '  }';
    echo '});';
    echo '</script>';
}

include __DIR__ . '/partials/layout.php';
