
const API_KEY = '6ddd0a78';
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultsDiv = document.getElementById('results');
const watchlistDiv = document.getElementById('watchlist');
const loadingDiv = document.getElementById('loading');
const viewWatchlistBtn = document.getElementById('view-watchlist-btn');
const paginationDiv = document.getElementById('pagination');
let currentPage = 1;

// Load watchlist from localStorage
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

// Store search results Array
let movies = [];

async function fetchMovies(searchTerm) {
    try {
        const response = await fetch(`http://www.omdbapi.com/?s=${encodeURIComponent(searchTerm)}&page=${currentPage}&apikey=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Search Results:', data);
        if (data.Response === 'False') {
            throw new Error(data.Error || 'No movies found');
        }
        paginationDiv.innerHTML = ''; // Clear previous pagination
        calculateTotalPages(data.totalResults);
        return data.Search;
    } catch (error) {
        console.error('Error fetching movies:', error);
        throw error;
    }
}

viewWatchlistBtn.addEventListener('click', () => {
    if (watchlist.length === 0) {
        alert('Your watchlist is empty');
        return;
    }
    // movies = [] // Clear search results when viewing watchlist
    clearResults();
    displayWatchlist();
});




// Event listeners
searchBtn.addEventListener('click', () => {
    currentPage = 1; // Reset to first page on new search
    handleSearch()
});
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        currentPage = 1; // Reset to first page on new search
        handleSearch();
    }
});

// Handle search
async function handleSearch() {
    const searchTerm = searchInput.value.trim();
    loadingDiv.style.display = 'block';
    if (!searchTerm) {
        alert('Please enter a movie title to search');
        loadingDiv.style.display = 'none';
        return;
    }

    try {
         movies = await fetchMovies(searchTerm);
        displayResults(movies);
    } catch (error) {
        resultsDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    } finally {
        loadingDiv.style.display = 'none';
    }
}

// Display search results
function displayResults(movies) {
    if (!movies || movies.length === 0) {
        resultsDiv.innerHTML = '<p>No movies found</p>';
        return;
    }

    resultsDiv.innerHTML = movies.map(movie => `
        <div class="movie-card">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${movie.Title} poster">
            <div class="movie-info">
                <h3>${movie.Title}</h3>
                <p>Year: ${movie.Year}</p>
                <p>Type: ${movie.Type}</p>
                <button class="add-btn" onclick="addToWatchlist('${movie.imdbID}')">Add to Watchlist</button>
            </div>
        </div>
    `).join('');
}

// Clear search results
function clearResults() {
    resultsDiv.innerHTML = '';
}

// Add movie to watchlist
async function addToWatchlist(imdbID) {
    if (watchlist.some(movie => movie.imdbID === imdbID)) {
        alert('Movie already in watchlist');
        return;
    }

    try {
        // Fetch full movie details
        const response = await fetch(`http://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}`);
        const movie = await response.json();

        if (movie.Response === 'False') {
            throw new Error(movie.Error);
        }

        watchlist.push(movie);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        displayWatchlist();
        alert('Movie added to watchlist!');
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        alert('Failed to add movie to watchlist');
    }
}

// Display watchlist
function displayWatchlist() {
    if (watchlist.length === 0) {
        watchlistDiv.innerHTML = '<p class="error-empty-watchlist">Your watchlist is empty</p>';
       viewWatchlistBtn.style.display = 'none';
        return;
    }

     if (movies.length !== 0) {
            viewWatchlistBtn.style.display = 'block';
    }

    watchlistDiv.innerHTML = `
        <h2>My Watchlist</h2>
        ${watchlist.map(movie => `
            <div class="movie-card">
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${movie.Title} poster">
                <div class="movie-info">
                    <h3>${movie.Title}</h3>
                    <p>Year: ${movie.Year}</p>
                    <p>Genre: ${movie.Genre}</p>
                    <p>Plot: ${movie.Plot}</p>
                    <button class="remove-btn" onclick="removeFromWatchlist('${movie.imdbID}')">Remove</button>
                </div>
            </div>
        `).join('')}
    `;
}

// Remove from watchlist
function removeFromWatchlist(imdbID) {
    watchlist = watchlist.filter(movie => movie.imdbID !== imdbID);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    displayWatchlist();
}

// Calculate total pages based on search results
function calculateTotalPages(totalResults) {
    console.log('Total Results:', Math.ceil(totalResults / 10));
    const totalPages = Math.ceil(totalResults / 10);
    createPagination(totalPages);
    
}

// pagination loop

function createPagination(totalPages) {
    let paginationHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        paginationHTML += `<button class="pagination-btn ${activeClass}" onclick="goToPage(${i})">${i}</button>`;
    }
    paginationDiv.innerHTML = paginationHTML;
}


// Pagination
function goToPage(page) {
    currentPage = page;
    handleSearch();
}
// Initialize watchlist display
displayWatchlist();