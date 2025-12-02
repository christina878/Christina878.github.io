// Open Library API Base URL
const OPEN_LIBRARY_BASE = 'https://openlibrary.org';
const COVER_BASE = 'https://covers.openlibrary.org';

/**
 * UTILITY: Renders a Bootstrap Card for a single book.
 * @param {object} book - A book object from the Open Library API (search result format).
 * @param {boolean} showAddButton - Whether to include the "Add to Library" button.
 * @returns {string} - The HTML string for the card.
 */
function renderBookCard(book, showAddButton = false) {
    // We use book.key (e.g., /works/OL12345W) as the unique identifier for linking and storage.
    const fullBookKey = book.key; 
    
    // Generate the cover URL (default to a placeholder if no cover ID)
    const coverId = book.cover_i;
    const coverUrl = coverId ? `${COVER_BASE}/b/id/${coverId}-M.jpg` : 'https://via.placeholder.com/180x270?text=No+Cover';
    
    // Safely determine the author and title
    const author = Array.isArray(book.author_name) ? book.author_name.join(', ') : (book.author_name || 'Unknown Author');
    const title = book.title || 'Untitled Book';

    let buttonHtml = '';
    if (showAddButton) {
        // The Add to Library button now uses the fullBookKey
        buttonHtml = `
            <button class="btn btn-sm btn-success mt-2" 
                    onclick="addToLibrary('${title}', '${author}', '${fullBookKey}')">
                Add to My Library
            </button>
        `;
    }

    return `
        <div class="col">
            <div class="card h-100 shadow-sm">
                <img src="${coverUrl}" class="card-img-top book-cover" alt="Cover of ${title}">
                <div class="card-body d-flex flex-column">
                    <a href="book-detail.html?key=${encodeURIComponent(fullBookKey)}" class="text-decoration-none">
                        <h5 class="card-title text-primary">${title}</h5>
                    </a>
                    <p class="card-text text-muted flex-grow-1">by ${author}</p>
                    ${buttonHtml}
                </div>
                <div class="card-footer">
                    <small class="text-muted">First Published: ${book.first_publish_year || 'N/A'}</small>
                </div>
            </div>
        </div>
    `;
}

// --- API INTEGRATION FUNCTIONS (EXISTING) ---

async function fetchNewBookSuggestions() {
    // ... (This function remains the same, calling renderBookCard)
    // (Ensure you include the full definition from the previous response)
    const container = document.getElementById('suggestions-container');
    container.innerHTML = '<p>Fetching latest reads...</p>';

    const url = `${OPEN_LIBRARY_BASE}/search.json?q=subject:fiction+or+subject:mystery&sort=new&limit=8`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API response status: ${response.status}`);
        }
        const data = await response.json();
        
        const booksHtml = data.docs
            .filter(book => book.cover_i && book.key)
            .slice(0, 8)
            .map(book => renderBookCard(book, false))
            .join('');

        container.innerHTML = booksHtml || '<p class="text-danger">No new book suggestions found.</p>';
    } catch (error) {
        console.error("Error fetching new books:", error);
        container.innerHTML = '<p class="text-danger">Failed to load books. Please check your network or API status.</p>';
    }
}


async function searchBooks(query) {
    // ... (This function remains the same, calling renderBookCard)
    // (Ensure you include the full definition from the previous response)
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '<p>Searching for books...</p>';

    const url = `${OPEN_LIBRARY_BASE}/search.json?q=${encodeURIComponent(query)}&limit=20`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API response status: ${response.status}`);
        }
        const data = await response.json();

        if (data.docs && data.docs.length > 0) {
            const booksHtml = data.docs
                .filter(book => book.cover_i && book.key)
                .map(book => renderBookCard(book, true))
                .join('');
            resultsContainer.innerHTML = `<div class="row row-cols-1 row-cols-md-4 g-4">${booksHtml}</div>`;
        } else {
            resultsContainer.innerHTML = '<p class="text-warning">No results found for your search query.</p>';
        }
    } catch (error) {
        console.error("Error during book search:", error);
        resultsContainer.innerHTML = '<p class="text-danger">An error occurred while fetching search results.</p>';
    }
}

// --- NEW API INTEGRATION 3 (for book-detail.html) ---

/**
 * NEW FUNCTION: Fetches and displays detailed information for a single book.
 */
async function fetchBookDetails() {
    const detailContainer = document.getElementById('detail-container');
    // 1. Get the book key from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const bookKey = urlParams.get('key'); // This should be like '/works/OL12345W'

    if (!bookKey) {
        detailContainer.innerHTML = '<p class="text-danger">Error: No book key provided in the URL.</p>';
        return;
    }

    // Endpoint: Open Library Works API to get rich detail (API Integration 2)
    const url = `${OPEN_LIBRARY_BASE}${bookKey}.json`;
    detailContainer.innerHTML = `<h4>Loading details for book ID: ${bookKey.replace('/works/', '')}...</h4>`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API response status: ${response.status}`);
        }
        const data = await response.json();

        // Safely extract data
        const title = data.title || 'Untitled Work';
        // The Works API often contains a description object
        const description = data.description ? 
            (typeof data.description === 'string' ? data.description : data.description.value) : 
            'No description available.';
        
        const subjects = data.subjects ? data.subjects.slice(0, 5).join(', ') : 'N/A';
        
        // Use a static cover for detail since the Work object doesn't always have a cover_i
        const coverUrl = `${COVER_BASE}/b/olid/${bookKey.replace('/works/', '')}-L.jpg`;

        // Render the detailed information using a card/jumbotron-style layout
        detailContainer.innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    <img src="${coverUrl}" class="img-fluid rounded shadow" alt="Large cover of ${title}">
                    <button class="btn btn-lg btn-success w-100 mt-3" 
                            onclick="addToLibrary('${title}', 'N/A', '${bookKey}')">
                        + Add to My Library
                    </button>
                </div>
                <div class="col-md-8">
                    <h1 class="display-4">${title}</h1>
                    <p class="lead"><strong>Subject Tags:</strong> ${subjects}</p>
                    <hr>
                    <h4 class="mt-4">Summary:</h4>
                    <p>${description}</p>
                    <p class="text-muted mt-4">Open Library ID: ${bookKey}</p>
                </div>
            </div>
        `;

    } catch (error) {
        console.error("Error fetching book details:", error);
        detailContainer.innerHTML = `<p class="text-danger">Failed to load details for this book. Error: ${error.message}</p>`;
    }
}

// --- PROFILE LOGIC (EXISTING, ensure key is saved correctly) ---

function addToLibrary(title, author, key) {
    const library = getLibrary();
    if (library.some(book => book.key === key)) {
        alert(`${title} is already in your library!`);
        return;
    }

    // Now uses the full key (e.g., /works/OL12345W)
    const newBook = { title, author, key, addedDate: new Date().toLocaleDateString() };

    library.push(newBook);
    localStorage.setItem('myLibrary', JSON.stringify(library));

    alert(`${title} has been added to your library!`);
}

function getLibrary() {
    const libraryJson = localStorage.getItem('myLibrary');
    return libraryJson ? JSON.parse(libraryJson) : [];
}

function renderLibrary() {
    const libraryContainer = document.getElementById('library-container');
    const library = getLibrary();

    if (!libraryContainer) return; 

    if (library.length === 0) {
        libraryContainer.innerHTML = '<p class="mt-4">Your library is empty! Search for some books to add.</p>';
        return;
    }

    // Render as a simple list for a student project
    const listHtml = library.map(book => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
                <a href="book-detail.html?key=${encodeURIComponent(book.key)}" class="text-decoration-none">
                    <strong>${book.title}</strong>
                </a> 
                by ${book.author}
                <small class="text-muted d-block">Added on: ${book.addedDate}</small>
            </div>
            <button class="btn btn-sm btn-outline-danger" onclick="removeBook('${book.key}')">Remove</button>
        </li>
    `).join('');

    libraryContainer.innerHTML = `<ul class="list-group list-group-flush">${listHtml}</ul>`;
}

function removeBook(key) {
    let library = getLibrary();
    library = library.filter(book => book.key !== key);
    localStorage.setItem('myLibrary', JSON.stringify(library));
    renderLibrary();
}

// Call functions specific to the page they are on (you put these in your HTML files)
// document.addEventListener('DOMContentLoaded', fetchNewBookSuggestions); // For index.html
// document.addEventListener('DOMContentLoaded', renderLibrary); // For profile.html
// document.addEventListener('DOMContentLoaded', fetchBookDetails); // For book-detail.html