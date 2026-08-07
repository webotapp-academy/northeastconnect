document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('search-suggestions');
    const searchButtons = document.querySelectorAll('button');

    // Get tag color based on category or location
    function getTagColor(category, location) {
        const categoryColors = {
            'Wildlife': 'bg-green-100 text-green-800',
            'Nature': 'bg-emerald-100 text-emerald-800',
            'Culture': 'bg-purple-100 text-purple-800',
            'Water Sports': 'bg-blue-100 text-blue-800',
            'Trekking': 'bg-yellow-100 text-yellow-800'
        };

        const locationColors = {
            'adventure': 'bg-orange-100 text-orange-800',
            'culture': 'bg-purple-100 text-purple-800',
            'directory': 'bg-gray-100 text-gray-800'
        };

        // Prioritize location color if it exists
        if (location && locationColors[location]) {
            return locationColors[location];
        }

        // Fallback to category color
        return categoryColors[category] || 'bg-gray-100 text-gray-800';
    }

    // Debounce function to limit API calls
    function debounce(func, delay) {
        let timeoutId;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    }

    // Fetch search suggestions
    async function fetchSuggestions(query) {
        console.log('Fetching suggestions for:', query);

        if (query.length < 1) {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.classList.add('hidden');
            return;
        }

        try {
            // Detect base path from current location
            let basePath = '/';
            const pathname = window.location.pathname;
            
            // If pathname is /northeastconnect/... (local dev), use that
            if (pathname.includes('/northeastconnect/')) {
                basePath = '/northeastconnect/';
            } else {
                // For production (domain root), use /
                basePath = '/';
            }
            
            const searchUrl = basePath + 'search.php?term=' + encodeURIComponent(query);
            console.log('Fetching from:', searchUrl);
            const response = await fetch(searchUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Raw response:', data);
            
            // Extract results array (handles both old format and new direct format)
            const suggestions = Array.isArray(data) ? data : (data.results || []);
            console.log('Suggestions to render:', suggestions);
            
            // Clear previous suggestions
            suggestionsContainer.innerHTML = '';

            if (!suggestions || suggestions.length === 0) {
                suggestionsContainer.classList.add('hidden');
                return;
            }

            // Create suggestion items
            suggestions.forEach(suggestion => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-start justify-between';

                // Main text
                const textDiv = document.createElement('div');
                textDiv.className = 'text-sm font-medium text-gray-800';
                textDiv.textContent = suggestion.label;

                // Tag
                const tagSpan = document.createElement('span');
                tagSpan.className = 'ml-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
                tagSpan.textContent = suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1);

                // Wrapper
                const wrapper = document.createElement('div');
                wrapper.className = 'flex items-center gap-2';
                wrapper.appendChild(textDiv);
                wrapper.appendChild(tagSpan);

                suggestionItem.appendChild(wrapper);

                // Redirect to result page on click
                suggestionItem.addEventListener('click', () => {
                    window.location.href = suggestion.url;
                });

                suggestionsContainer.appendChild(suggestionItem);
            });

            // Show suggestions container
            suggestionsContainer.classList.remove('hidden');
            console.log('Suggestions rendered');
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            suggestionsContainer.classList.add('hidden');
        }
    }

    // Attach debounced event listener
    const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);
    searchInput.addEventListener('input', function() {
        console.log('Input event triggered:', this.value);
        debouncedFetchSuggestions(this.value);
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', function(event) {
        if (!suggestionsContainer.contains(event.target) && event.target !== searchInput) {
            suggestionsContainer.classList.add('hidden');
        }
    });

    // Handle search button click
    searchButtons.forEach(button => {
        button.addEventListener('click', function() {
            const searchTerm = searchInput.value.trim();
            
            if (searchTerm) {
                window.location.href = `../search-results.php?term=${encodeURIComponent(searchTerm)}`;
            }
        });
    });
});