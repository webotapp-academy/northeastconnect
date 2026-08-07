<?php require_once 'config.php'; try { $pdo = get_db_connection(); echo 'Database connection successful'; } catch (Exception $e) { echo 'Database connection failed'; }
