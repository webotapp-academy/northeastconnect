<?php
require __DIR__ . '/auth.php';
admin_require_auth();

$page_title = 'Adventure';
$active = 'adventure';

$pdo = db();
$messages = [];
$errors = [];

// Handle Delete
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete') {
    $id = $_POST['id'] ?? 0;
    if ($id) {
        try {
            $stmt = $pdo->prepare("DELETE FROM adventure WHERE id = ?");
            $stmt->execute([$id]);
            $messages[] = "Adventure deleted successfully.";
        } catch (PDOException $e) {
            $errors[] = "Error deleting adventure: " . $e->getMessage();
        }
    }
}

// Fetch Items
try {
    $stmt = $pdo->query("SELECT * FROM adventure ORDER BY name ASC");
    $items = $stmt->fetchAll();
} catch (PDOException $e) {
    $errors[] = "Error fetching adventures: " . $e->getMessage();
    $items = [];
}

function render_content() {
    global $items, $messages, $errors;
?>
    <div class="actions mb-4">
        <a href="adventure-edit.php" class="btn">Add New Adventure</a>
    </div>

    <?php foreach ($messages as $m): ?><div class="alert success"><?php echo htmlspecialchars($m); ?></div><?php endforeach; ?>
    <?php foreach ($errors as $e): ?><div class="alert error"><?php echo htmlspecialchars($e); ?></div><?php endforeach; ?>

    <section class="panel">
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>District</th>
                    <th>Difficulty</th>
                    <th>Price</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($items)): ?>
                    <tr><td colspan="6" class="text-center">No adventures found.</td></tr>
                <?php else: ?>
                    <?php foreach ($items as $item): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($item['name']); ?></td>
                            <td><?php echo htmlspecialchars($item['type']); ?></td>
                            <td><?php echo htmlspecialchars($item['district']); ?></td>
                            <td><?php echo htmlspecialchars($item['difficulty_level'] ?? '-'); ?></td>
                            <td>₹<?php echo htmlspecialchars($item['price']); ?></td>
                            <td>
                                <a href="adventure-edit.php?id=<?php echo $item['id']; ?>" class="btn outline sm">Edit</a>
                                <form method="post" style="display:inline;" onsubmit="return confirm('Are you sure you want to delete this adventure?');">
                                    <input type="hidden" name="action" value="delete">
                                    <input type="hidden" name="id" value="<?php echo $item['id']; ?>">
                                    <button type="submit" class="btn outline danger sm">Delete</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </section>
<?php
}

include __DIR__ . '/partials/layout.php';
?>
