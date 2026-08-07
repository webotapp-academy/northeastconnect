<?php
require __DIR__ . '/auth.php';
admin_logout();
header('Location: /admin/login.php');
exit;