// Open Library API Base URL
const OPEN_LIBRARY_BASE = 'https://openlibrary.org';
const COVER_BASE = 'https://covers.openlibrary.org';

/**
 * UTILITY: Renders a Bootstrap Card for a single book.
 * @param {object} book - A book object from the Open Library API.
 * @param {boolean} showAddButton - Whether to include the "Add to Library" button.
 * @returns {string} - The HTML string for the card.
 */
function renderBookCard(book, showAddButton = false) {
    // Determine the book key (OLID)
    const bookKey = book.key ? book.key.replace('/works/', '') : (book.cover_edition_key || 'N/A');

    // Generate the cover URL (default to a placeholder if no cover ID)
    const coverId = book.cover_i;
    const coverUrl = coverId ? `${COVER_BASE}/b/id/${coverId}-M.jpg` : 'https://via.placeholder.com/180x270?text=No+Cover';
    
    // Determine the author (safely handle missing data)
    const author = Array.isArray(book.author_name) ? book.author_name.join(', ') : (book.author_name || 'Unknown Author');
    const title = book.title || 'Untitled Book';

    let buttonHtml = '';
    if (showAddButton) {
        // IMPORTANT: The button calls a JS function with the book's details
        buttonHtml = `
            <button class="btn btn-sm btn-success mt-2" 
                    onclick="addToLibrary('${title}', '${author}', '${bookKey}')">
                Add to My Library
            </button>
        `;
    }

    return `
        <div class="col">
            <div class="card h-100 shadow-sm">
                <img src="${coverUrl}" class="card-img-top book-cover" alt="Cover of ${title}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${title}</h5>
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

/**
 * API INTEGRATION 1 (for index.html): Fetches "new" books using the Search API and sorts them.
 */
async function fetchNewBookSuggestions() {
    const container = document.getElementById('suggestions-container');
    container.innerHTML = '<p>Fetching latest reads...</p>';

    // Endpoint: Open Library Search API with a subject query and sorted by 'new'
    const url = `${OPEN_LIBRARY_BASE}/search.json?q=subject:fiction+or+subject:mystery&sort=new&limit=8`;

    try {
        const response = await fetch(url);
        // Error Handling: Check if the response status is OK (200-299)
        if (!response.ok) {
            throw new Error(`API response status: ${response.status}`);
        }
        const data = await response.json();
        
        // Filter and display the top 8 books
        const booksHtml = data.docs
            .filter(book => book.cover_i) // Only show books with a cover
            .slice(0, 8)
            .map(book => renderBookCard(book, false)) // No "Add" button on the Home Page
            .join('');

        container.innerHTML = booksHtml || '<p class="text-danger">No new book suggestions found.</p>';
    } catch (error) {
        console.error("Error fetching new books:", error);
        container.innerHTML = '<p class="text-danger">Failed to load books. Please check your network or API status.</p>';
    }
}

/**
 * API INTEGRATION 2 (for search.html): Handles the book search query.
 * @param {string} query - The search text entered by the user.
 */
async function searchBooks(query) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '<p>Searching for books...</p>';

    // Endpoint: Open Library Search API by general query
    const url = `${OPEN_LIBRARY_BASE}/search.json?q=${encodeURIComponent(query)}&limit=20`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API response status: ${response.status}`);
        }
        const data = await response.json();

        if (data.docs && data.docs.length > 0) {
            // Display books, including the "Add to Library" button
            const booksHtml = data.docs
                .filter(book => book.cover_i)
                .map(book => renderBookCard(book, true)) // Show the "Add" button
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

/**
 * PROFILE LOGIC 1 (for search.html/details): Adds a book to the client-side library.
 * @param {string} title - Book title.
 * @param {string} author - Book author.
 * @param {string} key - Open Library Work Key.
 */
function addToLibrary(title, author, key) {
    // 1. Get current library from localStorage
    const library = getLibrary();
    
    // 2. Check if the book is already in the library (to prevent duplicates)
    if (library.some(book => book.key === key)) {
        alert(`${title} is already in your library!`);
        return;
    }

    // 3. Create the new book object
    const newBook = { title, author, key, addedDate: new Date().toLocaleDateString() };

    // 4. Add the book to the array and save back to localStorage
    library.push(newBook);
    localStorage.setItem('myLibrary', JSON.stringify(library));

    alert(`${title} has been added to your library!`);
}

/**
 * PROFILE LOGIC 2 (for profile.html): Retrieves the entire library from localStorage.
 * @returns {Array} - The array of saved book objects.
 */
function getLibrary() {
    const libraryJson = localStorage.getItem('myLibrary');
    // If nothing is stored, return an empty array
    return libraryJson ? JSON.parse(libraryJson) : [];
}

/**
 * PROFILE LOGIC 3 (for profile.html): Renders the books saved in localStorage.
 */
function renderLibrary() {
    const libraryContainer = document.getElementById('library-container');
    const library = getLibrary();

    if (!libraryContainer) return; // Prevent errors if not on the profile page

    if (library.length === 0) {
        libraryContainer.innerHTML = '<p class="mt-4">Your library is empty! Search for some books to add.</p>';
        return;
    }

    // Render as a simple list for a student project
    const listHtml = library.map(book => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
                <strong>${book.title}</strong> by ${book.author}
                <small class="text-muted d-block">Added on: ${book.addedDate}</small>
            </div>
            <button class="btn btn-sm btn-outline-danger" onclick="removeBook('${book.key}')">Remove</button>
        </li>
    `).join('');

    libraryContainer.innerHTML = `
        <ul class="list-group list-group-flush">${listHtml}</ul>
    `;
}

/**
 * PROFILE LOGIC 4 (for profile.html): Removes a book from the client-side library.
 * @param {string} key - The Open Library Work Key of the book to remove.
 */
function removeBook(key) {
    let library = getLibrary();
    // Filter out the book with the matching key
    library = library.filter(book => book.key !== key);
    localStorage.setItem('myLibrary', JSON.stringify(library));
    // Re-render the library list immediately
    renderLibrary();
}

// You will need to add the specific calls to your other pages:
// For search.html, you will need a function to handle the search form submission.
// For profile.html, you will need to call renderLibrary() on load.