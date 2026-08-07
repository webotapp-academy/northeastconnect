<!-- Google-style Search Bar -->
<div class="max-w-3xl mx-auto relative group">
    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
    </div>
    <input 
        type="search" 
        id="search-input"
        name="search_term"
        placeholder="Search destinations, experiences, or places to stay..." 
        class="w-full pl-12 pr-4 py-5 rounded-full text-lg border-2 border-transparent focus:border-assam-green-500 focus:outline-none shadow-2xl bg-white/95 backdrop-blur-sm transition duration-300"
    >
    <div class="absolute right-3 top-1/2 -translate-y-1/2 flex space-x-2">
        <button class="text-gray-500 hover:text-gray-700 p-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
            </svg>
        </button>
        <button class="bg-assam-green-700 text-white px-6 py-2 rounded-full hover:bg-assam-green-800 transition duration-300">
            Search
        </button>
    </div>

    <!-- Suggestions Container -->
    <div 
        id="search-suggestions" 
        class="absolute z-50 w-full bg-white shadow-lg rounded-lg mt-2 max-h-96 overflow-y-auto hidden"
    >
        <!-- Suggestions will be dynamically populated here -->
    </div>
</div>

<script src="assets/js/search.js?v=<?php echo time(); ?>"></script>
<link rel="stylesheet" href="assets/css/search.css">