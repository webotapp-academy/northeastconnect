<?php
require __DIR__ . '/config.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms & Conditions • Discover Assam</title>
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
    <img src="/assets/images/hero.jpg" alt="Discover Assam Terms Hero">
  </div>
  <div class="overlay"></div>
  <div class="inner">
    <h1>Terms &amp; Conditions</h1>
  </div>
</header>

<section class="pt-32 pb-16 bg-gray-50 min-h-screen">
  <div class="container mx-auto px-4 max-w-3xl">
    <h1 class="text-3xl md:text-4xl font-bold mb-6 text-gray-800">Terms & Conditions</h1>

    <p class="mb-4 text-gray-700">Welcome to Discover Assam! These Terms & Conditions ("Terms") govern your use of our website located at <a href="/discoverassam" class="text-blue-600 underline">discoverassam</a> (the "Site"). By accessing or using the Site, you agree to be bound by these Terms. If you do not agree with any part of the Terms, you must not use the Site.</p>

    <h2 class="text-2xl font-semibold mt-8 mb-3 text-gray-800">1. Use of the Site</h2>
    <p class="mb-4 text-gray-700">You agree to use the Site only for lawful purposes and in a manner that does not infringe the rights of, restrict, or inhibit the use and enjoyment of this Site by any third party.</p>

    <h2 class="text-2xl font-semibold mt-8 mb-3 text-gray-800">2. Intellectual Property</h2>
    <p class="mb-4 text-gray-700">All content on this Site, including text, graphics, logos, icons, images, audio clips, digital downloads, and software, is the property of Discover Assam or its content suppliers and protected by international copyright laws.</p>

    <h2 class="text-2xl font-semibold mt-8 mb-3 text-gray-800">3. User-Generated Content</h2>
    <p class="mb-4 text-gray-700">If you submit or post any content to the Site, you grant Discover Assam a non-exclusive, royalty-free, perpetual, and worldwide license to use, reproduce, modify, adapt, publish, translate, distribute, and display such content.</p>

    <h2 class="text-2xl font-semibold mt-8 mb-3 text-gray-800">4. Disclaimer of Warranties</h2>
    <p class="mb-4 text-gray-700">The Site is provided on an "as is" and "as available" basis. Discover Assam makes no warranties, expressed or implied, about the accuracy or reliability of the content.</p>

    <h2 class="text-2xl font-semibold mt-8 mb-3 text-gray-800">5. Limitation of Liability</h2>
    <p class="mb-4 text-gray-700">Discover Assam will not be liable for any damages arising from the use of or inability to use the Site.</p>

    <h2 class="text-2xl font-semibold mt-8 mb-3 text-gray-800">6. Changes to These Terms</h2>
    <p class="mb-4 text-gray-700">We reserve the right, at our sole discretion, to modify or replace these Terms at any time. Any changes will be effective immediately upon posting.</p>

    <p class="mt-10 text-gray-600">If you have any questions about these Terms, please <a href="/discoverassam/contact.php" class="underline text-blue-600">contact us</a>.</p>
  </div>
</section>

<?php if (file_exists(__DIR__ . '/includes/footer.php')) { include __DIR__ . '/includes/footer.php'; } ?>
</body>
</html>
