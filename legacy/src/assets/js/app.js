// Discover Assam - Main Application Logic

// News Ticker Functionality
function initNewsTicker() {
    const tickerContent = document.querySelector('.ticker-content');
    const tickerItems = document.querySelectorAll('.ticker-item');

    // Clone ticker items to create continuous scroll effect
    tickerItems.forEach(item => {
        const clone = item.cloneNode(true);
        tickerContent.appendChild(clone);
    });
}

// Search Functionality
function initSearch() {
    const searchInput = document.getElementById('site-search');
    const searchButton = document.getElementById('search-button');

    function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            // TODO: Implement actual search logic
            console.log('Searching for:', query);
            
            // Placeholder search results display
            alert(`Searching for: ${query}\n\nFull search functionality coming soon!`);
        }
    }

    // Search on button click
    searchButton.addEventListener('click', performSearch);

    // Search on Enter key press
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Existing Functions
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');

    mobileMenuToggle.addEventListener('click', () => {
        mobileMenu.classList.remove('hidden');
        mobileMenu.classList.add('block');
    });

    mobileMenuClose.addEventListener('click', () => {
        mobileMenu.classList.remove('block');
        mobileMenu.classList.add('hidden');
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

// News API Integration (Placeholder)
async function fetchAssamNews() {
    try {
        // TODO: Implement Gemini API integration for news
        console.log('Fetching Assam news...');
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}

// Business Directory Functionality
function initBusinessDirectory() {
    // TODO: Implement business directory search and filter
    console.log('Initializing business directory...');
}

// Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSmoothScroll();
    initNewsTicker();
    initSearch();
    fetchAssamNews();
    initBusinessDirectory();
});