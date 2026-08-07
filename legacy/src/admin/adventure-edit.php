<?php
require __DIR__ . '/auth.php';
admin_require_auth();

$id = $_GET['id'] ?? null;
$is_edit = !empty($id);
$page_title = $is_edit ? 'Edit Adventure' : 'Add Adventure';
$active = 'adventure';

$pdo = db();
$messages = [];
$errors = [];

$item = [
    'name' => '',
    'type' => '',
    'district' => '',
    'description' => '',
    'duration' => '',
    'difficulty_level' => '',
    'best_season' => '',
    'price' => '',
    'image_urls' => ''
];

if ($is_edit) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM adventure WHERE id = ?");
        $stmt->execute([$id]);
        $fetched = $stmt->fetch();
        if ($fetched) {
            $item = $fetched;
        } else {
            $errors[] = "Adventure not found.";
        }
    } catch (PDOException $e) {
        $errors[] = "Error fetching adventure: " . $e->getMessage();
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $item['name'] = $_POST['name'] ?? '';
    $item['type'] = $_POST['type'] ?? '';
    $item['district'] = $_POST['district'] ?? '';
    $item['description'] = $_POST['description'] ?? '';
    $item['duration'] = $_POST['duration'] ?? '';
    $item['difficulty_level'] = $_POST['difficulty_level'] ?? '';
    $item['best_season'] = $_POST['best_season'] ?? '';
    $item['price'] = $_POST['price'] ?? '';
    $item['image_urls'] = $_POST['image_urls'] ?? '';

    if (empty($item['name'])) $errors[] = "Name is required.";
    if (empty($item['type'])) $errors[] = "Type is required.";

    if (empty($errors)) {
        try {
            if ($is_edit) {
                $sql = "UPDATE adventure SET name=?, type=?, district=?, description=?, duration=?, difficulty_level=?, best_season=?, price=?, image_urls=? WHERE id=?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $item['name'], $item['type'], $item['district'], $item['description'], 
                    $item['duration'], $item['difficulty_level'], $item['best_season'], 
                    $item['price'], $item['image_urls'], $id
                ]);
                $messages[] = "Adventure updated successfully.";
            } else {
                $sql = "INSERT INTO adventure (name, type, district, description, duration, difficulty_level, best_season, price, image_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $item['name'], $item['type'], $item['district'], $item['description'], 
                    $item['duration'], $item['difficulty_level'], $item['best_season'], 
                    $item['price'], $item['image_urls']
                ]);
                $id = $pdo->lastInsertId();
                $is_edit = true;
                $messages[] = "Adventure created successfully.";
                // Redirect to edit page to avoid resubmission
                header("Location: adventure-edit.php?id=$id&saved=1");
                exit;
            }
        } catch (PDOException $e) {
            $errors[] = "Database error: " . $e->getMessage();
        }
    }
}

if (isset($_GET['saved'])) {
    $messages[] = "Adventure saved successfully.";
}

function render_content() {
    global $item, $messages, $errors, $is_edit;
?>
    <div class="actions mb-4">
        <a href="adventure.php" class="btn outline">← Back to List</a>
    </div>

    <?php foreach ($messages as $m): ?><div class="alert success"><?php echo htmlspecialchars($m); ?></div><?php endforeach; ?>
    <?php foreach ($errors as $e): ?><div class="alert error"><?php echo htmlspecialchars($e); ?></div><?php endforeach; ?>

    <section class="panel">
        <form method="post" class="form">
            <div class="grid-2">
                <div class="field">
                    <label class="label">Name *</label>
                    <input class="input" name="name" value="<?php echo htmlspecialchars($item['name']); ?>" required>
                </div>
                <div class="field">
                    <label class="label">Type *</label>
                    <input class="input" name="type" value="<?php echo htmlspecialchars($item['type']); ?>" placeholder="e.g. Trekking, River Rafting, Wildlife Safari" required>
                </div>
            </div>

            <div class="grid-3">
                <div class="field">
                    <label class="label">District</label>
                    <input class="input" name="district" value="<?php echo htmlspecialchars($item['district']); ?>">
                </div>
                <div class="field">
                    <label class="label">Duration</label>
                    <input class="input" name="duration" value="<?php echo htmlspecialchars($item['duration']); ?>" placeholder="e.g. 2 days, 4 hours">
                </div>
                <div class="field">
                    <label class="label">Price (₹)</label>
                    <input type="number" class="input" name="price" value="<?php echo htmlspecialchars($item['price']); ?>" step="0.01">
                </div>
            </div>

            <div class="grid-2">
                <div class="field">
                    <label class="label">Difficulty Level</label>
                    <select class="select" name="difficulty_level">
                        <option value="">Select difficulty</option>
                        <option value="Easy" <?php echo $item['difficulty_level'] === 'Easy' ? 'selected' : ''; ?>>Easy</option>
                        <option value="Moderate" <?php echo $item['difficulty_level'] === 'Moderate' ? 'selected' : ''; ?>>Moderate</option>
                        <option value="Challenging" <?php echo $item['difficulty_level'] === 'Challenging' ? 'selected' : ''; ?>>Challenging</option>
                        <option value="Difficult" <?php echo $item['difficulty_level'] === 'Difficult' ? 'selected' : ''; ?>>Difficult</option>
                        <option value="Extreme" <?php echo $item['difficulty_level'] === 'Extreme' ? 'selected' : ''; ?>>Extreme</option>
                    </select>
                </div>
                <div class="field">
                    <label class="label">Best Season</label>
                    <input class="input" name="best_season" value="<?php echo htmlspecialchars($item['best_season']); ?>" placeholder="e.g. October to March">
                </div>
            </div>

            <div class="field">
                <label class="label">Description</label>
                <textarea class="textarea" name="description" rows="6"><?php echo htmlspecialchars($item['description']); ?></textarea>
            </div>

            <div class="field">
                <label class="label">Image URLs (comma separated)</label>
                <input class="input" name="image_urls" value="<?php echo htmlspecialchars($item['image_urls']); ?>">
                <div class="help">First image will be used as the main thumbnail. Use filenames from assets/images/ or full URLs.</div>
            </div>

            <div class="actions">
                <button type="submit" class="btn"><?php echo $is_edit ? 'Update Adventure' : 'Create Adventure'; ?></button>
                <?php if ($is_edit): ?>
                    <a href="adventure-edit.php" class="btn outline">Add New</a>
                <?php endif; ?>
            </div>
        </form>
    </section>
<?php
}

include __DIR__ . '/partials/layout.php';
?>
