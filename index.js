
const API_KEY = '6ddd0a78';
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultsDiv = document.getElementById('results');
const watchlistDiv = document.getElementById('watchlist');

// Load watchlist from localStorage
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

async function fetchMovies(searchTerm) {
    try {
        const response = await fetch(`http://www.omdbapi.com/?s=${encodeURIComponent(searchTerm)}&apikey=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Search Results:', data);
        if (data.Response === 'False') {
            throw new Error(data.Error || 'No movies found');
        }

        return data.Search;
    } catch (error) {
        console.error('Error fetching movies:', error);
        throw error;
    }
}


// Event listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Handle search
async function handleSearch() {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
        alert('Please enter a movie title to search');
        return;
    }

    try {
        const movies = await fetchMovies(searchTerm);
        displayResults(movies);
    } catch (error) {
        resultsDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
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
        watchlistDiv.innerHTML = '<p>Your watchlist is empty</p>';
        return;
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

// Initialize watchlist display
displayWatchlist();