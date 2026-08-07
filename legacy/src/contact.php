<?php
require __DIR__ . '/config.php';

$sent = false;
$errors = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $name    = trim($_POST['c_name'] ?? '');
  $email   = trim($_POST['c_email'] ?? '');
  $subject = trim($_POST['c_subject'] ?? '');
  $message = trim($_POST['c_message'] ?? '');

  if ($name === '' || $email === '' || $message === '') {
    $errors[] = 'Name, email and message are required.';
  } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please enter a valid email address.';
  }

  if (!$errors) {
    // --- Send email to site admin (adjust address as needed) ---
    $to      = 'zzubizubi@gmail.com';
    $headers = 'From: '. $name .' <'. $email .">\r\n".
               'Reply-To: '. $email ."\r\n".
               'Content-Type: text/plain; charset=UTF-8';
    $body    = "You have received a new message from North East Connect contact form.\n\n" .
               "Name: $name\n" .
               "Email: $email\n" .
               "Subject: $subject\n" .
               "Message:\n$message\n";
    // Suppress errors in case mail() is disabled
    if (@mail($to, 'North East Connect Contact: ' . ($subject ?: 'New message'), $body, $headers)) {
      $sent = true;
    } else {
      $errors[] = 'Failed to send message. Please try again later.';
    }
  }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Us • Discover Assam</title>
  <link rel="stylesheet" href="/discoverassam/assets/css/main.css">
  <style>
    .hero { position:relative; min-height: 40vh; display:flex; align-items:center; justify-content:center; }
    .hero .bg { position:absolute; inset:0; }
    .hero .bg img { width:100%; height:100%; object-fit:cover; filter: brightness(0.6); }
    .hero .overlay { position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,.45), rgba(0,0,0,.35)); }
    .hero .inner { position:relative; z-index:1; text-align:center; padding: 0 16px; max-width: 900px; }
    .hero h1 { margin:0; color:#fff; font-size: clamp(30px, 6vw, 48px); font-weight:800; }
    .form-field { margin-bottom: 18px; }
    .input, .textarea { width:100%; border:1px solid #e5e7eb; border-radius:10px; padding:14px 16px; font-size:15px; }
    .input:focus, .textarea:focus { outline:none; border-color:#15803d; box-shadow:0 0 0 3px rgba(21,128,61,.15); }
    .textarea { min-height:160px; resize:vertical; }
    .btn-primary { background:#15803d; color:#fff; font-weight:600; padding:14px 28px; border-radius:12px; transition: background .25s; }
    .btn-primary:hover { background:#166534; }
    .alert { padding:12px 16px; border-radius:10px; margin-bottom:14px; }
    .alert.error { background:#fef2f2; color:#991b1b; }
    .alert.success { background:#ecfdf5; color:#14532d; }
  </style>
</head>
<body>
<?php if (file_exists(__DIR__ . '/includes/header.php')) { include __DIR__ . '/includes/header.php'; } ?>

<header class="hero">
  <div class="bg">
    <img src="/assets/images/hero.jpg" alt="North East Connect Hero">
  </div>
  <div class="overlay"></div>
  <div class="inner">
    <h1>Contact Us</h1>
  </div>
</header>

<section class="py-16 bg-gray-50 min-h-screen">
  <div class="container mx-auto px-4 max-w-2xl">
    <?php if ($sent): ?>
      <div class="alert success">Thank you! Your message has been sent.</div>
    <?php endif; ?>
    <?php foreach ($errors as $e): ?>
      <div class="alert error"><?php echo htmlspecialchars($e); ?></div>
    <?php endforeach; ?>

    <form method="post" class="bg-white p-8 rounded-2xl shadow-md">
      <div class="form-field">
        <label class="block font-semibold mb-2" for="c_name">Name</label>
        <input class="input" type="text" id="c_name" name="c_name" value="<?php echo htmlspecialchars($_POST['c_name'] ?? ''); ?>" required>
      </div>
      <div class="form-field">
        <label class="block font-semibold mb-2" for="c_email">Email</label>
        <input class="input" type="email" id="c_email" name="c_email" value="<?php echo htmlspecialchars($_POST['c_email'] ?? ''); ?>" required>
      </div>
      <div class="form-field">
        <label class="block font-semibold mb-2" for="c_subject">Subject</label>
        <input class="input" type="text" id="c_subject" name="c_subject" value="<?php echo htmlspecialchars($_POST['c_subject'] ?? ''); ?>">
      </div>
      <div class="form-field">
        <label class="block font-semibold mb-2" for="c_message">Message</label>
        <textarea class="textarea" id="c_message" name="c_message" required><?php echo htmlspecialchars($_POST['c_message'] ?? ''); ?></textarea>
      </div>
      <button class="btn-primary" type="submit">Send Message</button>
    </form>
  </div>
</section>

<?php if (file_exists(__DIR__ . '/includes/footer.php')) { include __DIR__ . '/includes/footer.php'; } ?>
</body>
</html>
