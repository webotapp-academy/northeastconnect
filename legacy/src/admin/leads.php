<?php
require __DIR__ . '/auth.php';
admin_require_auth();

$page_title = 'Leads';
$active = 'leads';

$pdo = db();
$messages = [];
$errors = [];

// Handle status update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'update_status') {
        $id = $_POST['id'] ?? 0;
        $status = $_POST['status'] ?? 'pending';
        
        if ($id) {
            try {
                $stmt = $pdo->prepare("UPDATE leads SET status = ?, updated_at = NOW() WHERE id = ?");
                $stmt->execute([$status, $id]);
                $messages[] = "Lead status updated successfully.";
            } catch (PDOException $e) {
                $errors[] = "Error updating status: " . $e->getMessage();
            }
        }
    } elseif ($_POST['action'] === 'delete') {
        $id = $_POST['id'] ?? 0;
        if ($id) {
            try {
                $stmt = $pdo->prepare("DELETE FROM leads WHERE id = ?");
                $stmt->execute([$id]);
                $messages[] = "Lead deleted successfully.";
            } catch (PDOException $e) {
                $errors[] = "Error deleting lead: " . $e->getMessage();
            }
        }
    } elseif ($_POST['action'] === 'add_note') {
        $id = $_POST['id'] ?? 0;
        $note = $_POST['note'] ?? '';
        
        if ($id && $note) {
            try {
                $stmt = $pdo->prepare("UPDATE leads SET notes = ?, updated_at = NOW() WHERE id = ?");
                $stmt->execute([$note, $id]);
                $messages[] = "Note added successfully.";
            } catch (PDOException $e) {
                $errors[] = "Error adding note: " . $e->getMessage();
            }
        }
    }
}

// Pagination
$perPage = 20;
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$offset = ($page - 1) * $perPage;

// Filters
$status_filter = $_GET['status'] ?? '';
$search = trim($_GET['s'] ?? '');

$where_conditions = [];
$params = [];

if ($status_filter) {
    $where_conditions[] = "l.status = :status";
    $params[':status'] = $status_filter;
}

if ($search) {
    $where_conditions[] = "(l.name LIKE :search OR l.mobile LIKE :search OR d.business_name LIKE :search)";
    $params[':search'] = "%$search%";
}

$where_clause = $where_conditions ? 'WHERE ' . implode(' AND ', $where_conditions) : '';

// Count total
$count_sql = "SELECT COUNT(*) FROM leads l LEFT JOIN directory d ON l.listing_id = d.id $where_clause";
$count_stmt = $pdo->prepare($count_sql);
$count_stmt->execute($params);
$total = $count_stmt->fetchColumn();
$totalPages = (int)ceil($total / $perPage);

// Fetch leads
$sql = "SELECT l.*, d.business_name, d.category 
        FROM leads l 
        LEFT JOIN directory d ON l.listing_id = d.id 
        $where_clause 
        ORDER BY l.timestamp DESC 
        LIMIT :limit OFFSET :offset";
$stmt = $pdo->prepare($sql);
foreach ($params as $k => $v) {
    $stmt->bindValue($k, $v);
}
$stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$leads = $stmt->fetchAll();

// Get status counts
$status_counts = [
    'all' => $pdo->query("SELECT COUNT(*) FROM leads")->fetchColumn(),
    'pending' => $pdo->query("SELECT COUNT(*) FROM leads WHERE status = 'pending'")->fetchColumn(),
    'contacted' => $pdo->query("SELECT COUNT(*) FROM leads WHERE status = 'contacted'")->fetchColumn(),
    'converted' => $pdo->query("SELECT COUNT(*) FROM leads WHERE status = 'converted'")->fetchColumn(),
    'not_interested' => $pdo->query("SELECT COUNT(*) FROM leads WHERE status = 'not_interested'")->fetchColumn(),
];

function render_content() {
    global $leads, $messages, $errors, $page, $totalPages, $search, $status_filter, $status_counts;
?>
    <style>
        .leads-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 12px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: var(--panel);
            border: 2px solid var(--border);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
        }
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .stat-card.active {
            border-color: var(--primary);
            background: rgba(37, 99, 235, 0.05);
        }
        .stat-card .label {
            font-size: 12px;
            color: var(--muted);
            text-transform: uppercase;
            margin-bottom: 8px;
        }
        .stat-card .value {
            font-size: 24px;
            font-weight: 700;
            color: var(--text);
        }
        
        .lead-row.status-pending { background: #fff; }
        .lead-row.status-contacted { background: #fef3c7; }
        .lead-row.status-converted { background: #d1fae5; }
        .lead-row.status-not_interested { background: #fee2e2; }
        
        .status-badge {
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-pending { background: #e0e7ff; color: #3730a3; }
        .status-contacted { background: #fef3c7; color: #92400e; }
        .status-converted { background: #d1fae5; color: #065f46; }
        .status-not_interested { background: #fee2e2; color: #991b1b; }
        
        .quick-actions {
            display: flex;
            gap: 4px;
        }
        .quick-action-btn {
            padding: 4px 8px;
            font-size: 11px;
            border-radius: 6px;
            border: 1px solid var(--border);
            background: white;
            cursor: pointer;
            transition: all 0.2s;
        }
        .quick-action-btn:hover {
            background: var(--bg);
        }
        .quick-action-btn.success { border-color: #10b981; color: #10b981; }
        .quick-action-btn.warning { border-color: #f59e0b; color: #f59e0b; }
        .quick-action-btn.danger { border-color: #ef4444; color: #ef4444; }
        
        .notes-cell {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 12px;
            color: var(--muted);
        }
        
        .leads-table-wrapper {
            width: 100%;
            overflow-x: auto;
        }
        .leads-table-wrapper .table {
            min-width: 1000px;
        }
    </style>

    <?php foreach ($messages as $m): ?><div class="alert" style="background:#d1fae5;color:#065f46;margin-bottom:12px;">✓ <?php echo htmlspecialchars($m); ?></div><?php endforeach; ?>
    <?php foreach ($errors as $e): ?><div class="alert" style="background:#fee2e2;color:#991b1b;margin-bottom:12px;">✗ <?php echo htmlspecialchars($e); ?></div><?php endforeach; ?>

    <!-- Stats Cards -->
    <div class="leads-stats">
        <a href="?status=" class="stat-card <?php echo $status_filter === '' ? 'active' : ''; ?>">
            <div class="label">All Leads</div>
            <div class="value"><?php echo $status_counts['all']; ?></div>
        </a>
        <a href="?status=pending" class="stat-card <?php echo $status_filter === 'pending' ? 'active' : ''; ?>">
            <div class="label">Pending</div>
            <div class="value"><?php echo $status_counts['pending']; ?></div>
        </a>
        <a href="?status=contacted" class="stat-card <?php echo $status_filter === 'contacted' ? 'active' : ''; ?>">
            <div class="label">Contacted</div>
            <div class="value"><?php echo $status_counts['contacted']; ?></div>
        </a>
        <a href="?status=converted" class="stat-card <?php echo $status_filter === 'converted' ? 'active' : ''; ?>">
            <div class="label">Converted</div>
            <div class="value"><?php echo $status_counts['converted']; ?></div>
        </a>
        <a href="?status=not_interested" class="stat-card <?php echo $status_filter === 'not_interested' ? 'active' : ''; ?>">
            <div class="label">Not Interested</div>
            <div class="value"><?php echo $status_counts['not_interested']; ?></div>
        </a>
    </div>

    <!-- Search and Filters -->
    <div style="margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
        <form method="get" style="flex:1;min-width:220px;display:flex;gap:8px;">
            <input type="text" name="s" placeholder="Search by name, mobile, or business..." value="<?= htmlspecialchars($search) ?>" class="input" style="flex:1;"/>
            <?php if ($status_filter): ?>
                <input type="hidden" name="status" value="<?= htmlspecialchars($status_filter) ?>">
            <?php endif; ?>
            <button type="submit" class="btn">Search</button>
        </form>
        <?php if ($search || $status_filter): ?>
            <a href="leads.php" class="btn outline">Clear Filters</a>
        <?php endif; ?>
    </div>

    <!-- Leads Table -->
    <div class="panel leads-table-wrapper">
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Business</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Notes</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($leads)): ?>
                    <tr><td colspan="9" style="text-align:center;padding:40px;color:var(--muted);">No leads found.</td></tr>
                <?php else: ?>
                    <?php foreach ($leads as $lead): ?>
                        <tr class="lead-row status-<?= htmlspecialchars($lead['status'] ?? 'pending') ?>">
                            <td><?= $lead['id'] ?></td>
                            <td><strong><?= htmlspecialchars($lead['name']) ?></strong></td>
                            <td>
                                <a href="tel:<?= htmlspecialchars($lead['mobile']) ?>" style="color:var(--primary);">
                                    <?= htmlspecialchars($lead['mobile']) ?>
                                </a>
                            </td>
                            <td><?= htmlspecialchars($lead['business_name'] ?? 'N/A') ?></td>
                            <td><?= htmlspecialchars($lead['category'] ?? '-') ?></td>
                            <td>
                                <span class="status-badge status-<?= htmlspecialchars($lead['status'] ?? 'pending') ?>">
                                    <?= htmlspecialchars($lead['status'] ?? 'pending') ?>
                                </span>
                            </td>
                            <td style="white-space:nowrap;"><?= date('d M Y', strtotime($lead['timestamp'])) ?></td>
                            <td class="notes-cell" title="<?= htmlspecialchars($lead['notes'] ?? '') ?>">
                                <?= htmlspecialchars($lead['notes'] ?? '-') ?>
                            </td>
                            <td>
                                <div class="quick-actions">
                                    <form method="post" style="display:inline;">
                                        <input type="hidden" name="action" value="update_status">
                                        <input type="hidden" name="id" value="<?= $lead['id'] ?>">
                                        <input type="hidden" name="status" value="contacted">
                                        <button type="submit" class="quick-action-btn warning" title="Mark as Contacted">📞</button>
                                    </form>
                                    <form method="post" style="display:inline;">
                                        <input type="hidden" name="action" value="update_status">
                                        <input type="hidden" name="id" value="<?= $lead['id'] ?>">
                                        <input type="hidden" name="status" value="converted">
                                        <button type="submit" class="quick-action-btn success" title="Mark as Converted">✓</button>
                                    </form>
                                    <button onclick="showNoteModal(<?= $lead['id'] ?>, '<?= htmlspecialchars($lead['notes'] ?? '', ENT_QUOTES) ?>')" class="quick-action-btn" title="Add/Edit Note">📝</button>
                                    <form method="post" style="display:inline;" onsubmit="return confirm('Delete this lead?');">
                                        <input type="hidden" name="action" value="delete">
                                        <input type="hidden" name="id" value="<?= $lead['id'] ?>">
                                        <button type="submit" class="quick-action-btn danger" title="Delete">🗑️</button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    <?php if ($totalPages > 1): ?>
        <div style="margin-top:18px;display:flex;gap:6px;justify-content:center;">
            <?php if ($page > 1): ?>
                <a class="btn outline" href="?<?= http_build_query(['page' => $page-1, 's' => $search, 'status' => $status_filter]) ?>">Prev</a>
            <?php endif; ?>
            <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                <a class="btn <?= $i == $page ? '' : 'outline' ?>" href="?<?= http_build_query(['page' => $i, 's' => $search, 'status' => $status_filter]) ?>"><?= $i ?></a>
            <?php endfor; ?>
            <?php if ($page < $totalPages): ?>
                <a class="btn outline" href="?<?= http_build_query(['page' => $page+1, 's' => $search, 'status' => $status_filter]) ?>">Next</a>
            <?php endif; ?>
        </div>
    <?php endif; ?>

    <!-- Note Modal -->
    <div id="noteModal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;align-items:center;justify-content:center;">
        <div style="background:white;padding:24px;border-radius:12px;max-width:500px;width:90%;">
            <h3 style="margin:0 0 16px;">Add/Edit Note</h3>
            <form method="post">
                <input type="hidden" name="action" value="add_note">
                <input type="hidden" name="id" id="noteLeadId">
                <textarea name="note" id="noteText" class="textarea" rows="4" placeholder="Enter notes about this lead..."></textarea>
                <div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;">
                    <button type="button" onclick="closeNoteModal()" class="btn outline">Cancel</button>
                    <button type="submit" class="btn">Save Note</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        function showNoteModal(leadId, currentNote) {
            document.getElementById('noteLeadId').value = leadId;
            document.getElementById('noteText').value = currentNote;
            document.getElementById('noteModal').style.display = 'flex';
        }
        
        function closeNoteModal() {
            document.getElementById('noteModal').style.display = 'none';
        }
        
        // Close modal on outside click
        document.getElementById('noteModal').addEventListener('click', function(e) {
            if (e.target === this) closeNoteModal();
        });
    </script>
<?php
}

include __DIR__ . '/partials/layout.php';
?>
