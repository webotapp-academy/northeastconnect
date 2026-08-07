<?php
// Admin auth utilities
// Usage: require __DIR__ . '/auth.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function db() {
    // expects $pdo from config.php
    static $pdoInstance;
    if (!$pdoInstance) {
        require __DIR__ . '/../config.php'; // provides $pdo
        if (!isset($pdo) || !($pdo instanceof PDO)) {
            throw new RuntimeException('Database connection ($pdo) not initialized.');
        }
        $pdoInstance = $pdo;
    }
    return $pdoInstance;
}

function admin_is_logged_in(): bool {
    return !empty($_SESSION['admin_user']);
}

function admin_current_user() {
    return $_SESSION['admin_user'] ?? null;
}

function admin_require_auth() {
    if (!admin_is_logged_in()) {
        header('Location: /admin/login.php');
        exit;
    }
}

function admin_attempt_login(string $email, string $password, bool $remember = false): array {
    $pdo = db();
    $stmt = $pdo->prepare('SELECT * FROM admin_users WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    $ok = false;
    $error = null;

    if (!$user) {
        $error = 'Invalid credentials';
    } elseif ($user['status'] !== 'active') {
        $error = 'Account disabled';
    } elseif (!password_verify($password, $user['password_hash'])) {
        $error = 'Invalid credentials';
    } else {
        $ok = true;
        // record last_login_at
        $pdo->prepare('UPDATE admin_users SET last_login_at = NOW() WHERE id = :id')->execute([':id' => $user['id']]);
        // set session
        $_SESSION['admin_user'] = [
            'id' => (int)$user['id'],
            'name' => $user['name'] ?? 'Admin',
            'email' => $user['email'],
            'role' => $user['role'] ?? 'editor',
        ];
        // remember me cookie (simple token storage)
        if ($remember) {
            $token = bin2hex(random_bytes(32));
            $pdo->prepare('UPDATE admin_users SET remember_token = :t WHERE id = :id')->execute([':t' => $token, ':id' => $user['id']]);
            setcookie('admin_remember', $token, [
                'expires' => time() + 60*60*24*30, // 30 days
                'path' => '/',
                'secure' => isset($_SERVER['HTTPS']),
                'httponly' => true,
                'samesite' => 'Lax',
            ]);
        }
    }

    return ['ok' => $ok, 'error' => $error];
}

function admin_logout() {
    // clear remember token
    if (!empty($_SESSION['admin_user']['id'])) {
        $pdo = db();
        $pdo->prepare('UPDATE admin_users SET remember_token = NULL WHERE id = :id')->execute([':id' => $_SESSION['admin_user']['id']]);
    }
    setcookie('admin_remember', '', time() - 3600, '/');
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
}