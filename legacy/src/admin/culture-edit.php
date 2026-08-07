<?php
require __DIR__ . '/auth.php';
admin_require_auth();

$id = $_GET['id'] ?? null;
$is_edit = !empty($id);
$page_title = $is_edit ? 'Edit Culture Event' : 'Add Culture Event';
$active = 'culture';

$pdo = db();
$messages = [];
$errors = [];

$item = [
    'name' => '',
    'type' => '',
    'district' => '',
    'start_date' => date('Y-m-d'),
    'end_date' => '',
    'description' => '',
    'image_urls' => ''
];

if ($is_edit) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM culture WHERE id = ?");
        $stmt->execute([$id]);
        $fetched = $stmt->fetch();
        if ($fetched) {
            $item = $fetched;
        } else {
            $errors[] = "Item not found.";
        }
    } catch (PDOException $e) {
        $errors[] = "Error fetching item: " . $e->getMessage();
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $item['name'] = $_POST['name'] ?? '';
    $item['type'] = $_POST['type'] ?? '';
    $item['district'] = $_POST['district'] ?? '';
    $item['start_date'] = $_POST['start_date'] ?? '';
    $item['end_date'] = $_POST['end_date'] ?? '';
    $item['description'] = $_POST['description'] ?? '';
    $item['image_urls'] = $_POST['image_urls'] ?? '';

    if (empty($item['name'])) $errors[] = "Name is required.";

    if (empty($errors)) {
        try {
            if ($is_edit) {
                $sql = "UPDATE culture SET name=?, type=?, district=?, start_date=?, end_date=?, description=?, image_urls=? WHERE id=?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $item['name'], $item['type'], $item['district'], $item['start_date'], 
                    $item['end_date'], $item['description'], $item['image_urls'], $id
                ]);
                $messages[] = "Item updated successfully.";
            } else {
                $sql = "INSERT INTO culture (name, type, district, start_date, end_date, description, image_urls) VALUES (?, ?, ?, ?, ?, ?, ?)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $item['name'], $item['type'], $item['district'], $item['start_date'], 
                    $item['end_date'], $item['description'], $item['image_urls']
                ]);
                $id = $pdo->lastInsertId();
                $is_edit = true;
                $messages[] = "Item created successfully.";
                // Redirect to edit page to avoid resubmission
                header("Location: culture-edit.php?id=$id&saved=1");
                exit;
            }
        } catch (PDOException $e) {
            $errors[] = "Database error: " . $e->getMessage();
        }
    }
}

if (isset($_GET['saved'])) {
    $messages[] = "Item saved successfully.";
}

function render_content() {
    global $item, $messages, $errors, $is_edit;
?>
    <div class="actions mb-4">
        <a href="culture.php" class="btn outline">← Back to List</a>
    </div>

    <?php foreach ($messages as $m): ?><div class="alert success"><?php echo htmlspecialchars($m); ?></div><?php endforeach; ?>
    <?php foreach ($errors as $e): ?><div class="alert error"><?php echo htmlspecialchars($e); ?></div><?php endforeach; ?>

    <section class="panel">
        <form method="post" class="form">
            <div class="grid-2">
                <div class="field">
                    <label class="label">Name</label>
                    <input class="input" name="name" value="<?php echo htmlspecialchars($item['name']); ?>" required>
                </div>
                <div class="field">
                    <label class="label">Type</label>
                    <input class="input" name="type" value="<?php echo htmlspecialchars($item['type']); ?>" placeholder="e.g. Festival, Dance, Art">
                </div>
            </div>

            <div class="grid-3">
                <div class="field">
                    <label class="label">District</label>
                    <input class="input" name="district" value="<?php echo htmlspecialchars($item['district']); ?>">
                </div>
                <div class="field">
                    <label class="label">Start Date</label>
                    <input type="date" class="input" name="start_date" value="<?php echo htmlspecialchars($item['start_date']); ?>">
                </div>
                <div class="field">
                    <label class="label">End Date</label>
                    <input type="date" class="input" name="end_date" value="<?php echo htmlspecialchars($item['end_date']); ?>">
                </div>
            </div>

            <div class="field">
                <label class="label">Description</label>
                <textarea class="textarea" name="description" rows="5"><?php echo htmlspecialchars($item['description']); ?></textarea>
            </div>

            <div class="field">
                <label class="label">Image URLs (comma separated)</label>
                <input class="input" name="image_urls" value="<?php echo htmlspecialchars($item['image_urls']); ?>">
                <div class="help">First image will be used as the main thumbnail.</div>
            </div>

            <div class="actions">
                <button type="submit" class="btn"><?php echo $is_edit ? 'Update Event' : 'Create Event'; ?></button>
            </div>
        </form>
    </section>
<?php
}

include __DIR__ . '/partials/layout.php';
?>
