<?php
// Basic admin layout partial. Usage:
// $page_title = 'Dashboard';
// $active = 'dashboard';
// include __DIR__ . '/layout.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?php echo isset($page_title) ? htmlspecialchars($page_title) . ' • ' : ''; ?>Admin • Discover Assam</title>
  <link rel="stylesheet" href="/admin/assets/css/admin.css" />
  <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
</head>
<body>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="brand">
        <div class="logo"></div>
        <div>
          <div class="name">Discover Assam</div>
          <div class="tag">Admin</div>
        </div>
      </div>
      <nav class="nav">
        <a href="dashboard.php" class="<?php echo ($active ?? '') === 'dashboard' ? 'active' : '';?>">🏠 Dashboard</a>
        <a href="news.php" class="<?php echo ($active ?? '') === 'news' ? 'active' : '';?>">📰 News</a>
        <a href="all-news.php" class="<?php echo ($active ?? '') === 'all-news' ? 'active' : '';?>">📋 All News</a>
        <a href="blogs.php" class="<?php echo ($active ?? '') === 'blogs' ? 'active' : '';?>">📝 Blogs</a>
        <a href="culture.php" class="<?php echo ($active ?? '') === 'culture' ? 'active' : '';?>">🎭 Culture</a>
        <a href="adventure.php" class="<?php echo ($active ?? '') === 'adventure' ? 'active' : '';?>">🏔️ Adventure</a>
        <a href="directory.php" class="<?php echo ($active ?? '') === 'directory' ? 'active' : '';?>">📇 Directory</a>

        <a href="leads.php" class="<?php echo ($active ?? '') === 'leads' ? 'active' : '';?>">📊 Leads</a>
        <a href="page-views.php" class="<?php echo ($active ?? '') === 'page-views' ? 'active' : '';?>">👁️ Page Views</a>

      </nav>
    </aside>

    <header class="topbar">
      <button class="btn outline menu-btn" data-menu-btn>☰</button>
      <div class="search">
        <input type="search" placeholder="Search in admin..." />
      </div>
      <div class="user">
        <span class="name" style="font-size:14px;color:var(--muted);">Admin</span>
        <div class="avatar"></div>
        <a class="btn outline" href="/admin/logout.php" style="margin-left:8px;">Logout</a>
      </div>
    </header>

    <main class="content">
      <?php if (!empty($page_title)) { ?>
        <div class="breadcrumbs">Admin / <?php echo htmlspecialchars($page_title); ?></div>
        <h1 class="page-title"><?php echo htmlspecialchars($page_title); ?></h1>
      <?php } ?>
      <?php if (function_exists('render_content')) { render_content(); } ?>
    </main>
  </div>

  <script src="/admin/assets/js/admin.js"></script>
</body>
</html>