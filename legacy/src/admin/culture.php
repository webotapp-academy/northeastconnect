<?php
require __DIR__ . '/auth.php';
admin_require_auth();

$page_title = 'Culture';
$active = 'culture';

$pdo = db();
$messages = [];
$errors = [];

// Handle Delete
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete') {
    $id = $_POST['id'] ?? 0;
    if ($id) {
        try {
            $stmt = $pdo->prepare("DELETE FROM culture WHERE id = ?");
            $stmt->execute([$id]);
            $messages[] = "Item deleted successfully.";
        } catch (PDOException $e) {
            $errors[] = "Error deleting item: " . $e->getMessage();
        }
    }
}

// Fetch Items
try {
    $stmt = $pdo->query("SELECT * FROM culture ORDER BY start_date DESC");
    $items = $stmt->fetchAll();
} catch (PDOException $e) {
    $errors[] = "Error fetching items: " . $e->getMessage();
    $items = [];
}

function render_content() {
    global $items, $messages, $errors;
?>
    <div class="actions mb-4">
        <a href="culture-edit.php" class="btn">Add New Culture Event</a>
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
                    <th>Dates</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($items)): ?>
                    <tr><td colspan="5" class="text-center">No items found.</td></tr>
                <?php else: ?>
                    <?php foreach ($items as $item): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($item['name']); ?></td>
                            <td><?php echo htmlspecialchars($item['type']); ?></td>
                            <td><?php echo htmlspecialchars($item['district']); ?></td>
                            <td>
                                <?php 
                                    echo date('d M Y', strtotime($item['start_date'])); 
                                    if ($item['end_date']) {
                                        echo ' - ' . date('d M Y', strtotime($item['end_date']));
                                    }
                                ?>
                            </td>
                            <td>
                                <a href="culture-edit.php?id=<?php echo $item['id']; ?>" class="btn outline sm">Edit</a>
                                <form method="post" style="display:inline;" onsubmit="return confirm('Are you sure?');">
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
