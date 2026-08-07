<?php
// Configuration and session management can be added here
if($site_title_1 == ''){
    $site_title = "North East Connect - Explore the Jewel of Northeast India";
}else{
    $site_title = $site_title_1;
}
$current_page = basename($_SERVER['PHP_SELF']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $site_title; ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/main.css">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        'sans': ['Poppins', 'ui-sans-serif', 'system-ui'],
                    },
                    colors: {
                        'assam-green': {
                            50: '#f0fdf4',
                            100: '#dcfce7',
                            500: '#22c55e',
                            700: '#15803d',
                            900: '#14532d'
                        }
                    }
                }
            }
        }
    </script>
    <style>
        /* Desktop menu hidden on mobile */
        @media (max-width: 767px) {
            .md\:flex { display: none !important; }
            .mobile-menu-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0,0,0,0.8);
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .mobile-menu-overlay.open {
                opacity: 1;
                visibility: visible;
            }
            .mobile-menu-popup {
                background: white;
                width: 92vw;
                max-width: 370px;
                border-radius: 18px;
                padding: 36px 20px 28px 20px;
                transform: scale(0.7);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                position: relative;
                text-align: center;
            }
            .mobile-menu-overlay.open .mobile-menu-popup {
                transform: scale(1);
                opacity: 1;
            }
            .mobile-menu-popup .menu-title {
                font-size: 1.6rem;
                font-weight: 700;
                margin-bottom: 22px;
                color: #1f2937;
            }
            .mobile-menu-popup .menu-links {
                display: flex;
                flex-direction: column;
                gap: 16px;
                margin-bottom: 8px;
            }
            .mobile-menu-popup .menu-links a {
                text-align: center;
                padding: 13px 0;
                background-color: #f3f4f6;
                color: #111827;
                text-decoration: none;
                border-radius: 10px;
                font-weight: 500;
                font-size: 1.1rem;
                letter-spacing: 0.01em;
                transition: background-color 0.2s, color 0.2s, transform 0.1s;
            }
            .mobile-menu-popup .menu-links a:hover {
                background-color: #e5e7eb;
                color: #2563eb;
            }
            .mobile-menu-popup .menu-links a:active {
                transform: scale(0.98);
            }
            .mobile-menu-popup .close-btn {
                position: absolute;
                top: 18px;
                right: 18px;
                cursor: pointer;
                color: #6b7280;
                background: none;
                border: none;
                font-size: 2rem;
                transition: color 0.2s;
            }
            .mobile-menu-popup .close-btn:hover {
                color: #2563eb;
            }
        }
        /* Hide mobile menu on desktop */
        @media (min-width: 768px) {
            .mobile-menu-overlay { display: none !important; }
        }
    </style>
    
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9957106792444386"
     crossorigin="anonymous"></script>
</head>
<body class="bg-white text-gray-900 font-sans antialiased">
    <!-- Minimal Navigation -->
    <nav class="absolute top-0 left-0 right-0 z-50 px-4 py-6">
        <div class="container mx-auto flex justify-between items-center">
            <a href="https://northeastconnect.in/" class="text-xl font-semibold text-white flex items-center space-x-2">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zm0 12l-10-5 10 5 10-5v7l-10 5z"/>
                </svg>
                <span>North East Connect</span>
            </a>
            
            <!-- Desktop Menu -->
            <div class="hidden md:flex space-x-8">
                <a href="https://northeastconnect.in/culture" class="text-white hover:text-gray-200 transition">Culture</a>
                <a href="https://northeastconnect.in/wildlife" class="text-white hover:text-gray-200 transition">Wildlife</a>
                <a href="https://northeastconnect.in/adventure" class="text-white hover:text-gray-200 transition">Adventure</a>
                <a href="https://northeastconnect.in/directory" class="text-white hover:text-gray-200 transition">Directory</a>
                <a href="https://northeastconnect.in/news" class="text-white hover:text-gray-200 transition">News</a>
            </div>

            <!-- Mobile Menu Toggle -->
            <button class="md:hidden hamburger cursor-pointer" id="mobileHamburger" aria-label="Open menu" type="button">
                <span class="block w-6 h-0.5 bg-white my-1"></span>
                <span class="block w-6 h-0.5 bg-white my-1"></span>
                <span class="block w-6 h-0.5 bg-white my-1"></span>
            </button>

            <!-- Mobile Menu Overlay -->
            <div class="mobile-menu-overlay" role="dialog" aria-modal="true">
                <div class="mobile-menu-popup relative">
                    <button class="close-btn" onclick="toggleMobileMenu()" aria-label="Close menu">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                    <div class="menu-title">Menu</div>
                    <div class="menu-links">
                        <a href="https://northeastconnect.in/">Home</a>
                        <a href="https://northeastconnect.in/culture">Culture</a>
                        <a href="https://northeastconnect.in/wildlife">Wildlife</a>
                        <a href="https://northeastconnect.in/adventure">Adventure</a>
                        <a href="https://northeastconnect.in/directory">Directory</a>
                        <a href="https://northeastconnect.in/news">News</a>
                        
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <script>
    function toggleMobileMenu() {
        var overlay = document.querySelector('.mobile-menu-overlay');
        if (!overlay) return;
        overlay.classList.toggle('open');
        if (overlay.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    // Mobile Menu Toggle
    (function() {
        var hamburger = document.getElementById('mobileHamburger');
        if (hamburger) {
            hamburger.addEventListener('click', toggleMobileMenu);
        }

        // Close menu when a link is clicked
        var mobileLinks = document.querySelectorAll('.mobile-menu-popup .menu-links a');
        mobileLinks.forEach(function(link) {
            link.addEventListener('click', toggleMobileMenu);
        });

        // Close menu when clicking outside popup
        var overlay = document.querySelector('.mobile-menu-overlay');
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) toggleMobileMenu();
            });
        }
    })();
    </script>
</body>
</html>