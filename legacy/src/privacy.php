<?php
require __DIR__ . '/config.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy • Discover Assam</title>
  <link rel="stylesheet" href="/discoverassam/assets/css/main.css">
  <style>
    .hero { position:relative; min-height: 40vh; display:flex; align-items:center; justify-content:center; }
    .hero .bg { position:absolute; inset:0; }
    .hero .bg img { width:100%; height:100%; object-fit:cover; filter: brightness(0.6); }
    .hero .overlay { position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,.45), rgba(0,0,0,.35)); }
    .hero .inner { position:relative; z-index:1; text-align:center; padding: 0 16px; max-width: 900px; }
    .hero h1 { margin:0; color:#fff; font-size: clamp(30px, 6vw, 48px); font-weight:800; }
  </style>
</head>
<body>
<?php if (file_exists(__DIR__ . '/includes/header.php')) { include __DIR__ . '/includes/header.php'; } ?>

<header class="hero">
  <div class="bg">
    <img src="/assets/images/hero.jpg" alt="Discover Assam Privacy Hero">
  </div>
  <div class="overlay"></div>
  <div class="inner">
    <h1>Privacy Policy</h1>
  </div>
</header>

<section class="pt-32 pb-16 bg-gray-50 min-h-screen">
  <div class="container mx-auto px-4 max-w-3xl">
    <h1 class="text-3xl md:text-4xl font-bold mb-6 text-gray-800">Privacy Policy</h1>

    <p class="mb-4 text-gray-700">Your privacy is important to us. It is Discover Assam's policy to respect your privacy regarding any information we may collect from you across our website, <a href="/discoverassam" class="text-blue-600 underline">discoverassam</a>, and other sites we own and operate.</p>

    <h2 class="text-2xl font-semibold mt-8 mb-3 text-gray-800">1. Information We Collect</h2>
    <p class="mb-4 text-gray-700">• Log data such as your IP address, browser type, pages visited.<br>• Personal information you voluntarily provide (e.g., name, email) when subscribing or submitting forms.</p>

    <h2 class="text-2xl font-semibold mt-8 mb-3 text-gray-800">2. How We Use Information</h2>
    <p class="mb-4 text-gray-700">We use the information to operate and improve our Site, send newsletters, respond to inquiries, and personalise content.</p>

    <h2 class="text-2xl font-semibold mt-8 mb-3 text-gray-800">3. Cookies</h2>
    <p class="mb-4 text-gray-700">We use “cookies” to collect information about you and your activity across our Site to remember your preferences.</p>

    <h2 class="text-2xl font-semibold mt-8 mb-3 text-gray-800">4. Third-Party Services</h2>
    <p class="mb-4 text-gray-700">We employ third-party services (e.g., analytics) that may collect information used to identify you. We do not control these services and are not responsible for their privacy policies.</p>

    <h2 class="text-2xl font-semibold mt-8 mb-3 text-gray-800">5. Your Rights & Choices</h2>
    <p class="mb-4 text-gray-700">You may request access to the personal data we hold about you or ask us to erase your information.</p>

    <h2 class="text-2xl font-semibold mt-8 mb-3 text-gray-800">6. Changes to This Policy</h2>
    <p class="mb-4 text-gray-700">We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>

    <p class="mt-10 text-gray-600">If you have any questions about this Privacy Policy, please <a href="/contact/" class="underline text-blue-600">contact us</a>.</p>
  </div>
</section>

<?php
include __DIR__ . '/includes/footer.php';
?>
