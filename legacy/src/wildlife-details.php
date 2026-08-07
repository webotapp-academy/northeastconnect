<?php
require_once 'config.php';
require_once 'includes/header.php';

// Get wildlife ID
$wildlife_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$wildlife = null;
$error_message = '';

try {
    // Fetch wildlife details
    $stmt = $pdo->prepare("SELECT * FROM wildlife WHERE id = ?");
    $stmt->execute([$wildlife_id]);
    $wildlife = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$wildlife) {
        $error_message = "Wildlife location not found.";
    }
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    $error_message = "Database connection failed. Please try again later.";
}

$site_title_1 = htmlspecialchars(($wildlife ? $wildlife['name'] : 'Wildlife Details') . ' | ' . ($wildlife ? $wildlife['district'] : ''));
?>

<!-- Full-screen Hero Section -->
<header class="relative min-h-[50vh] flex items-center justify-center">
    <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-r from-green-900 to-green-600 opacity-80"></div>
        <img 
            src="/assets/images/hero.jpg" 
            alt="Wildlife Details" 
            class="w-full h-full object-cover"
        >
    </div>

    <div class="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            <?= htmlspecialchars($wildlife ? $wildlife['name'] : 'Wildlife Details') ?>
        </h1>
        <p class="text-xl md:text-2xl text-gray-200 mb-12">
            <?= htmlspecialchars($wildlife ? $wildlife['district'] : 'Discover Assam Wildlife') ?>
        </p>
    </div>
</header>

<!-- Wildlife Details Section -->
<div class="bg-gray-50 py-16">
    <div class="container mx-auto px-4">
        <?php if ($error_message): ?>
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
                <?= htmlspecialchars($error_message) ?>
            </div>
        <?php elseif ($wildlife): ?>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Wildlife Information Card -->
                <div class="bg-white rounded-2xl shadow-lg p-8">
                    <h2 class="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
                        Wildlife Information
                    </h2>
                    <div class="space-y-4">
                        <!-- Wildlife Name -->
                        <div class="flex items-center">
                            <svg class="w-6 h-6 mr-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span class="text-lg font-semibold text-gray-800">
                                <?= htmlspecialchars($wildlife['name']) ?>
                            </span>
                        </div>
                        <!-- District -->
                        <div class="flex items-center">
                            <svg class="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            <span class="text-xs font-medium">Location:</span>
                            <span class="ml-2 text-gray-600 text-xs">
                                <?= htmlspecialchars($wildlife['district']) ?>
                            </span>
                        </div>
                        <!-- Entry Fee -->
                        <div class="flex items-center">
                            <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                ₹<?= htmlspecialchars($wildlife['entry_fee']) ?>
                            </span>
                        </div>
                        <!-- Opening Hours -->
                        <div class="flex items-center">
                            <span class="text-xs font-medium">Opening Hours:</span>
                            <span class="ml-2 text-gray-600 text-xs">
                                <?= htmlspecialchars($wildlife['opening_hours']) ?>
                            </span>
                        </div>
                        <!-- Best Season -->
                        <div class="flex items-center">
                            <span class="text-xs font-medium">Best Season:</span>
                            <span class="ml-2 text-gray-600 text-xs">
                                <?= htmlspecialchars($wildlife['best_season']) ?>
                            </span>
                        </div>
                        <!-- Conservation Status -->
                        <?php if (!empty($wildlife['conservation_status'])): ?>
                        <div class="flex items-center">
                            <span class="text-xs font-medium">Conservation Status:</span>
                            <span class="ml-2 text-gray-600 text-xs">
                                <?= htmlspecialchars($wildlife['conservation_status']) ?>
                            </span>
                        </div>
                        <?php endif; ?>
                        <!-- Animal Species -->
                        <?php if (!empty($wildlife['animal_species'])): ?>
                        <div class="flex items-center">
                            <span class="text-xs font-medium">Species:</span>
                            <span class="ml-2 text-gray-600 text-xs">
                                <?= htmlspecialchars($wildlife['animal_species']) ?>
                            </span>
                        </div>
                        <?php endif; ?>
                        <!-- Contact Info -->
                        <?php if (!empty($wildlife['contact_info'])): ?>
                        <div class="flex items-center">
                            <span class="text-xs font-medium">Contact:</span>
                            <span class="ml-2 text-gray-600 text-xs">
                                <?= htmlspecialchars($wildlife['contact_info']) ?>
                            </span>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>
                <!-- Wildlife Images Grid and Description -->
                <div class="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
                    <?php 
                    $images = json_decode($wildlife['image_urls'] ?? '[]', true);
                    if (!is_array($images)) $images = [];
                    ?>
                    <div class="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <?php foreach ($images as $img): ?>
                            <?php 
                            if (empty($img) || $img === 'null') {
                                $img_path = 'assets/images/default-wildlife.jpg';
                            } elseif (strpos($img, 'http') === 0) {
                                $img_path = $img;
                            } else {
                                $img_path = "assets/images/{$img}";
                            }
                            ?>
                            <img src="<?= htmlspecialchars($img_path) ?>" alt="<?= htmlspecialchars($wildlife['name']) ?>" class="w-full h-40 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity" onclick="openImageModal('<?= htmlspecialchars($img_path) ?>', '<?= htmlspecialchars($wildlife['name']) ?>')">
                        <?php endforeach; ?>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-4">Description</h3>
                    <p class="text-gray-600 text-base">
                        <?= htmlspecialchars($wildlife['description']) ?>
                    </p>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>

<!-- Image Modal -->
<div id="imageModal" class="hidden fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onclick="closeImageModal()">
    <div class="relative max-w-4xl max-h-[90vh] flex items-center justify-center" onclick="event.stopPropagation()">
        <button onclick="closeImageModal()" class="absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300 z-10">
            &times;
        </button>
        <img id="modalImage" src="" alt="Full size image" class="max-w-full max-h-[85vh] object-contain rounded-lg">
    </div>
</div>

<script>
function openImageModal(imageSrc, altText) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    modalImage.src = imageSrc;
    modalImage.alt = altText;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Close modal on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeImageModal();
    }
});
</script>

<?php require_once 'includes/footer.php'; ?>
