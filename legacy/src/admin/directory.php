<?php
require __DIR__ . '/auth.php';
admin_require_auth();

$page_title = 'Directory';
$active = 'directory';
$pdo = db();

// Pagination settings
$perPage = 20;
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$offset = ($page-1)*$perPage;

// Optional search
$search = trim($_GET['s'] ?? '');
$params = [];
$where = '';
if ($search !== '') {
    $where = "WHERE business_name LIKE :s OR category LIKE :s OR district LIKE :s";
    $params[':s'] = "%$search%";
}

// Count total
$countStmt = $pdo->prepare("SELECT COUNT(*) FROM directory $where");
$countStmt->execute($params);
$total = (int)$countStmt->fetchColumn();
$totalPages = (int)ceil($total/$perPage);

// Fetch page
$sql = "SELECT id, business_name, category, district, status, created_at FROM directory $where ORDER BY id DESC LIMIT :lim OFFSET :off";
$stm = $pdo->prepare($sql);
foreach($params as $k=>$v){ $stm->bindValue($k,$v); }
$stm->bindValue(':lim',$perPage,PDO::PARAM_INT);
$stm->bindValue(':off',$offset,PDO::PARAM_INT);
$stm->execute();
$rows = $stm->fetchAll(PDO::FETCH_ASSOC);

function render_content(){
    global $rows,$page,$totalPages,$search;
    ?>
    <div style="margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
        <form method="get" style="flex:1;min-width:220px;">
            <input type="text" name="s" placeholder="Search..." value="<?= htmlspecialchars($search) ?>" class="input" style="width:100%;"/>
        </form>
        <a href="/admin/directory-edit.php" class="btn">+ Add Business</a>
    </div>

    <style>
        .directory-table-wrapper {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }
        .directory-table-wrapper .table {
            min-width: 800px;
        }
        .directory-table-wrapper .table th,
        .directory-table-wrapper .table td {
            white-space: nowrap;
        }
        .directory-table-wrapper .table td:nth-child(2) {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    </style>

    <div class="panel directory-table-wrapper">
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>District</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th class="text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach($rows as $r): ?>
                <tr>
                    <td><?= $r['id'] ?></td>
                    <td><?= htmlspecialchars($r['business_name']) ?></td>
                    <td><?= htmlspecialchars($r['category']) ?></td>
                    <td><?= htmlspecialchars($r['district']) ?></td>
                    <td>
                        <span class="badge <?= 
                            $r['status'] === 'Active' ? 'bg-green-50 text-green-600' : 
                            ($r['status'] === 'Inactive' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600') 
                        ?>">
                            <?= htmlspecialchars($r['status']) ?>
                        </span>
                    </td>
                    <td><?= date('Y-m-d', strtotime($r['created_at'])) ?></td>
                    <td class="text-right">
                        <a href="/admin/directory-edit.php?id=<?= $r['id'] ?>" class="btn outline">
                            Edit
                        </a>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <?php if($totalPages>1): ?>
    <div style="margin-top:18px;display:flex;gap:6px;justify-content:center;">
        <?php if($page>1): ?><a class="btn outline" href="?<?= http_build_query(['page'=>$page-1,'s'=>$search]) ?>">Prev</a><?php endif; ?>
        <?php for($i=1;$i<=$totalPages;$i++): ?>
            <a class="btn <?= $i==$page?'':'outline' ?>" href="?<?= http_build_query(['page'=>$i,'s'=>$search]) ?>"><?= $i ?></a>
        <?php endfor; ?>
        <?php if($page<$totalPages): ?><a class="btn outline" href="?<?= http_build_query(['page'=>$page+1,'s'=>$search]) ?>">Next</a><?php endif; ?>
    </div>
    <?php endif; ?>
    <?php
}

include __DIR__ . '/partials/layout.php';
?>
