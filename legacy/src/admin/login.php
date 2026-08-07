<?php
require __DIR__ . '/auth.php';

$errors = [];
$notice = null;

if (admin_is_logged_in()) {
  header('Location: /admin/dashboard.php');
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $email = trim($_POST['email'] ?? '');
  $password = $_POST['password'] ?? '';
  $remember = !empty($_POST['remember']);

  if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please enter a valid email address.';
  }
  if ($password === '') {
    $errors[] = 'Please enter your password.';
  }

  if (!$errors) {
    $result = admin_attempt_login($email, $password, $remember);
    if ($result['ok']) {
      header('Location: /admin/dashboard.php');
      exit;
    } else {
      $errors[] = $result['error'] ?? 'Login failed.';
    }
  }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Login • Discover Assam</title>
  <link rel="stylesheet" href="/admin/assets/css/admin.css" />
  <style>
    .auth-wrap { min-height: 100vh; display: grid; grid-template-columns: 1.1fr 1fr; background: var(--bg); }
    .auth-visual { display: none; background: linear-gradient(135deg, rgba(37,99,235,.1), rgba(29,78,216,.1)); border-right: 1px solid var(--border); padding: 40px; }
    .brand-lg { display:flex; align-items:center; gap:12px; }
    .brand-lg .logo { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--primary), var(--primary-600)); }
    .brand-lg .name { font-weight: 800; font-size: 20px; }
    .illustration { margin-top: 40px; border-radius: 16px; border: 1px dashed var(--border); padding: 20px; color: var(--muted); }
    .auth-form { display: flex; align-items: center; justify-content: center; padding: 24px; }
    .auth-card { width: 100%; max-width: 420px; background: var(--panel); border: 1px solid var(--border); border-radius: 16px; box-shadow: var(--shadow); padding: 24px; }
    .auth-header { text-align: center; margin-bottom: 16px; }
    .auth-header h1 { margin: 6px 0 4px; font-size: 22px; }
    .auth-header p { margin: 0; color: var(--muted); font-size: 14px; }
    .field { margin-top: 12px; }
    .field .label { display:block; margin-bottom: 6px; }
    .field .input { width: 100%; }
    .form .help { color: var(--muted); font-size: 12px; margin-top: 6px; }
    .meta { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; }
    .link { color: var(--primary); text-decoration: none; font-weight: 600; }
    .footer-note { text-align: center; color: var(--muted); font-size: 12px; margin-top: 16px; }
    .alert { padding: 10px 12px; border-radius: 10px; border:1px solid var(--border); background:#fff7ed; color:#9a3412; font-size:14px; }
    .alert + .alert { margin-top: 8px; }
    @media (min-width: 992px) { .auth-visual { display: block; } }
  </style>
</head>
<body>
  <div class="auth-wrap">
    <aside class="auth-visual">
      <div class="brand-lg">
        <div class="logo"></div>
        <div>
          <div class="name">Discover Assam </div>
          <div class="tag">Admin Panel</div>
        </div>
      </div>
      <div class="illustration">
        <p><strong>Welcome back!</strong></p>
        <p>Manage content for culture, directory, and news in a clean and modern interface.</p>
      </div>
    </aside>

    <main class="auth-form">
      <form class="auth-card form" method="post" action="/admin/login.php" novalidate>
        <div class="auth-header">
          <div class="brand"><div class="logo"></div><div class="name">Admin</div></div>
          <h1>Sign in</h1>
          <p>Use your admin credentials to continue</p>
        </div>

        <?php if (!empty($errors)): ?>
          <?php foreach ($errors as $e): ?>
            <div class="alert"><?php echo htmlspecialchars($e); ?></div>
          <?php endforeach; ?>
        <?php endif; ?>

        <?php if ($notice): ?>
          <div class="alert" style="background:#ecfeff;color:#155e75;"><?php echo htmlspecialchars($notice); ?></div>
        <?php endif; ?>

        <div class="field">
          <label class="label" for="email">Email</label>
          <input class="input" type="email" id="email" name="email" placeholder="you@example.com" value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>" required />
        </div>

        <div class="field">
          <label class="label" for="password">Password</label>
          <input class="input" type="password" id="password" name="password" placeholder="••••••••" required />
        </div>

        <div class="meta">
          <label style="display:flex; align-items:center; gap:8px; font-size: 14px; color: var(--muted);">
            <input type="checkbox" name="remember" <?php echo !empty($_POST['remember']) ? 'checked' : ''; ?> /> Remember me
          </label>
          <a class="link" href="#">Forgot password?</a>
        </div>

        <div class="actions mt-16">
          <button class="btn" type="submit">Sign in</button>
          <a class="btn outline" href="../index">Back to site</a>
        </div>

        <div class="footer-note">© <?php echo date('Y'); ?> Discover Assam. All rights reserved.</div>
      </form>
    </main>
  </div>

  <script src="/admin/assets/js/admin.js"></script>
</body>
</html>