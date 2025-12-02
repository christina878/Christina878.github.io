// --- Global Exports for HTML Onclick Handlers ---
// CRITICAL FIX: Explicitly expose functions to the global scope (window)
// so that 'onclick="navigate(...)""' works in index.html.
window.navigate = navigate;
window.initializeApp = initializeApp;

// --- API Configuration ---
const OPEN_LIBRARY_API = "https://openlibrary.org";

// --- State Management ---
let currentPage = '/'; // Current route path
let currentSubject = 'software_engineering'; // Default subject for finder
let searchResults = []; // Cache search results
let currentBookKey = null; // Key for the currently viewed book details


// --- Utility Functions ---

/**
 * Simple router to change the page content.
 * @param {string} path - The new route path ('/', '/finder', '/details').
 * @param {string} [bookKey=null] - Optional book key for the details page.
 */
function navigate(path, bookKey = null) {
    currentPage = path;
    currentBookKey = bookKey;
    updateNavActive(path);
    renderPage();
    window.scrollTo(0, 0); // Scroll to top on navigation

    // Update URL hash for basic history/shareability
    if (bookKey) {
        window.location.hash = `details=${encodeURIComponent(bookKey)}`;
    } else if (path === '/finder') {
        window.location.hash = 'finder';
    } else {
        window.location.hash = '';
    }
}

/**
 * Updates the active class in the navigation bar.
 * @param {string} path - The current path.
 */
function updateNavActive(path) {
    // This runs immediately because the script is loaded as type="module"
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    if (path === '/') {
        const homeLink = document.getElementById('nav-home');
        if (homeLink) homeLink.classList.add('active');
    } else if (path === '/finder') {
        const finderLink = document.getElementById('nav-finder');
        if (finderLink) finderLink.classList.add('active');
    }
}


/**
 * Displays the loading spinner.
 */
function showLoading() {
    const appContent = document.getElementById('app-content');
    const loadingSpinner = document.getElementById('loading');
    if (appContent) appContent.innerHTML = '';
    if (loadingSpinner) loadingSpinner.style.display = 'block';
}

/**
 * Hides the loading spinner.
 */
function hideLoading() {
    const loadingSpinner = document.getElementById('loading');
    if (loadingSpinner) loadingSpinner.style.display = 'none';
}

/**
 * Fetches data from the Open Library API with simple exponential backoff for resilience.
 * @param {string} endpoint - The API endpoint path.
 * @param {number} retries - Number of retries remaining.
 * @returns {Promise<Object>} - The JSON response data.
 */
async function fetchData(endpoint, retries = 3) {
    const url = `${OPEN_LIBRARY_API}${endpoint}`;
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                // If the error is not a 4xx client error, attempt a retry
                if (response.status < 400 || response.status >= 500) {
                    throw new Error(`Server error! Status: ${response.status}`);
                }
                // For client errors (4xx), stop trying
                console.warn(`Client error for ${url}. Not retrying.`);
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching data (Attempt ${i + 1}/${retries}):`, error);
            if (i < retries - 1) {
                const delay = Math.pow(2, i) * 1000; // Exponential backoff: 1s, 2s, 4s
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                return null; // All retries failed
            }
        }
    }
    return null;
}

/**
 * Renders a book card for display in lists.
 * @param {Object} book - Book object from API response.
 * @returns {string} - HTML string for the book card.
 */
function renderBookCard(book) {
    // Open Library uses 'key' as the unique ID for the work/edition.
    const bookKey = book.key || book.seed?.[0] || 'N/A';
    const title = book.title || 'Untitled Book';
    const authors = book.authors ? book.authors.map(a => a.name).join(', ') : 'Unknown Author';
    const coverId = book.cover_id || book.cover_i;
    // Use a placeholder if no cover ID is available
    const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : 'https://placehold.co/150x200/cccccc/333333?text=No+Cover';

    return `
        <div class="col-6 col-md-4 col-lg-3 mb-4">
            <div class="card h-100" onclick="navigate('/details', '${bookKey}')">
                <img src="${coverUrl}" class="card-img-top cover-img" alt="Cover of ${title}"
                     onerror="this.onerror=null; this.src='https://placehold.co/150x200/cccccc/333333?text=No+Cover';"
                >
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title text-truncate">${title}</h5>
                    <p class="card-text text-muted small">${authors}</p>
                    <p class="mt-auto mb-0"><a href="#" class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); navigate('/details', '${bookKey}')">View Details</a></p>
                </div>
            </div>
        </div>
    `;
}

// --- Page Rendering Functions ---

/**
 * Renders the Home Page content.
 */
async function renderHome() {
    showLoading();

    const contentDiv = document.getElementById('app-content');
    if (!contentDiv) return;

    // --- Home Page Structure (Static Content + Dynamic Suggestions) ---
    const homeTemplate = `
        <div class="jumbotron">
            <h1 class="display-5">Welcome to the Book Nook! 👋</h1>
            <p class="lead">
                Hey there! This is your go-to spot for finding academic resources, cool non-fiction,
                and books for that massive paper you've been putting off. We're using the Open Library API to
                pull real-time book data—think of it as our digital library card.
            </p>
            <hr class="my-4">
            <p>Ready to dig in? Use the **Book Finder** to search by subject, or check out our popular suggestions below!</p>
        </div>

        <h2 class="mb-4">🔥 Hot Topics: Suggested Reads</h2>
        <div id="suggested-books" class="row">
            </div>
    `;

    contentDiv.innerHTML = homeTemplate;

    // --- Dynamic API Call for Suggestions (Endpoint 1: Trending/Subject) ---
    const suggestedDiv = document.getElementById('suggested-books');
    const data = await fetchData(`/subjects/trending_reads.json?limit=8`);

    hideLoading();

    if (suggestedDiv) {
        if (data && data.works) {
            let html = '';
            data.works.forEach(book => {
                html += renderBookCard(book);
            });
            suggestedDiv.innerHTML = html;
        } else {
            suggestedDiv.innerHTML = '<p class="text-danger">Sorry, couldn\'t load suggested books right now. API might be napping!</p>';
        }
    }
}

/**
 * Renders the Book Finder (Search) Page content.
 */
function renderFinder() {
    hideLoading();
    const contentDiv = document.getElementById('app-content');
    if (!contentDiv) return;

    // --- Book Finder Structure (Search Bar + Results) ---
    const finderTemplate = `
        <h1 class="mb-4">Book Finder: Search by Subject</h1>
        <p class="lead">Need to find something specific for your classes? Enter a subject (e.g., *Physics*, *Fantasy*, *React*, *History*) to see what's trending!</p>

        <form id="search-form" class="mb-5">
            <div class="input-group input-group-lg shadow-sm">
                <input type="text" class="form-control" id="subject-input" placeholder="Enter a subject, like 'Psychology' or 'Calculus'" value="${currentSubject.replace(/_/g, ' ')}">
                <button class="btn btn-primary" type="submit">Search</button>
            </div>
        </form>

        <div id="search-results-section">
            <h2>Results for "${currentSubject.replace(/_/g, ' ')}"</h2>
            <div id="search-results" class="row">
                </div>
        </div>
    `;

    contentDiv.innerHTML = finderTemplate;

    // Attach event listener for the search form
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        // Need to explicitly define the handler function so it can be called
        searchForm.addEventListener('submit', handleSearchSubmit);
    }

    // Load initial search results (either cached or fresh)
    if (searchResults.length > 0) {
        displaySearchResults(searchResults);
    } else {
        performSearch(currentSubject);
    }
}

/**
 * Handles the form submission for the book search.
 * @param {Event} event - The form submission event.
 */
function handleSearchSubmit(event) {
    event.preventDefault();
    const inputElement = document.getElementById('subject-input');
    if (!inputElement) return;

    const input = inputElement.value.trim();
    if (input) {
        // Replace spaces with underscores for Open Library API format
        currentSubject = input.toLowerCase().replace(/\s+/g, '_');
        performSearch(currentSubject);
    }
}

/**
 * Performs the actual search against the Open Library Subject API.
 * @param {string} subject - The subject to search for.
 */
async function performSearch(subject) {
    showLoading();
    const resultsDiv = document.getElementById('search-results');
    const header = document.querySelector('#search-results-section h2');

    if (resultsDiv) resultsDiv.innerHTML = ''; // Clear previous results
    if (header) header.textContent = `Results for "${subject.replace(/_/g, ' ')}"`;

    // --- Dynamic API Call for Search (Endpoint 2: Subject Search) ---
    const data = await fetchData(`/subjects/${subject}.json?limit=12`);

    hideLoading();

    if (resultsDiv) {
        if (data && data.works) {
            searchResults = data.works;
            displaySearchResults(searchResults);
        } else {
            searchResults = [];
            resultsDiv.innerHTML = '<p class="text-center w-100 p-4">Sorry, no books found for that subject. Try something different!</p>';
            console.error(`API Response for search subject '${subject}' was empty or invalid.`);
        }
    }
}

/**
 * Displays the search results in the UI.
 * @param {Array<Object>} books - Array of book objects.
 */
function displaySearchResults(books) {
    const resultsDiv = document.getElementById('search-results');
    if (!resultsDiv) return;

    let html = '';
    if (books.length > 0) {
        books.forEach(book => {
            html += renderBookCard(book);
        });
        resultsDiv.innerHTML = html;
    } else {
        resultsDiv.innerHTML = '<p class="text-center w-100 p-4">No results to display.</p>';
    }
}

/**
 * Renders the Book Details Page content.
 */
async function renderDetails() {
    if (!currentBookKey) {
        navigate('/');
        return;
    }

    showLoading();
    const contentDiv = document.getElementById('app-content');
    if (!contentDiv) return;

    // --- Dynamic API Call for Details (Endpoint 3: Book Details) ---
    // Note: currentBookKey is in the format '/works/OL12345W' or '/books/OL12345M'
    const data = await fetchData(`${currentBookKey}.json`);

    hideLoading();

    if (data) {
        const title = data.title || 'Book Details Not Found';
        // Open Library descriptions can be objects, so we need to check the value property
        const description = data.description ? (typeof data.description === 'object' ? data.description.value : data.description) : 'No description available. Maybe this is a rare edition!';
        const subjects = data.subjects ? data.subjects.slice(0, 5).join(', ') : 'N/A';
        const firstPublishYear = data.first_publish_date || 'N/A';
        const revision = data.revision || 1; // Just a fun API metric

        const detailsTemplate = `
            <button class="btn btn-outline-secondary mb-4" onclick="navigate('/finder')">← Back to Search</button>

            <div class="card p-4 shadow-lg">
                <div class="row">
                    <div class="col-md-4 mb-4 mb-md-0 d-flex justify-content-center">
                        <img src="https://placehold.co/300x450/343a40/ffffff?text=Book+Key%0A${currentBookKey.split('/').pop()}"
                             class="img-fluid rounded shadow" alt="Detailed Cover Placeholder">
                    </div>
                    <div class="col-md-8">
                        <h1 class="display-6 fw-bold">${title}</h1>
                        <p class="lead text-muted">A deep dive into this resource.</p>
                        <hr>
                        <p><strong>First Published:</strong> <span class="badge bg-secondary">${firstPublishYear}</span></p>
                        <p><strong>Subjects:</strong> ${subjects}</p>
                        <p><strong>Revision Count (API internal):</strong> ${revision}</p>
                        <h4 class="mt-4">Summary</h4>
                        <blockquote class="blockquote border-start border-primary border-4 ps-3 py-1 bg-light p-3 rounded">
                            <p class="mb-0">${description}</p>
                        </blockquote>

                        <h4 class="mt-4">Need it for a paper?</h4>
                        <p>The Open Library key for this book is <code>${currentBookKey}</code>. You can often use this identifier to find the book in your local university library's catalog!</p>
                    </div>
                </div>
            </div>
        `;
        contentDiv.innerHTML = detailsTemplate;

    } else {
        contentDiv.innerHTML = `
            <div class="alert alert-warning">
                <h4 class="alert-heading">Whoops!</h4>
                <p>We hit a snag loading the details for book key <code>${currentBookKey}</code>. It might be a unique edition the API doesn't have much info on. Try navigating back and searching for another one!</p>
                <hr>
                <button class="btn btn-warning" onclick="navigate('/finder')">Go to Finder</button>
            </div>
        `;
    }
}


/**
 * Main function to route and render the correct page.
 */
function renderPage() {
    switch (currentPage) {
        case '/':
            renderHome();
            break;
        case '/finder':
            renderFinder();
            break;
        case '/details':
            renderDetails();
            break;
        default:
            // Fallback to home
            navigate('/');
    }
}

// --- Initialization ---

/**
 * Initializes the application after the DOM is loaded.
 */
function initializeApp() {
    // Check the URL hash for basic routing history simulation
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (hash.startsWith('details=')) {
            const key = decodeURIComponent(hash.substring(8));
            navigate('/details', key);
        } else if (hash === 'finder') {
            navigate('/finder');
        } else {
            navigate('/');
        }
    } else {
         navigate('/');
    }
}

// Start the application after the document is ready
window.onload = initializeApp;

// Simple hash change listener for back button functionality
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash.startsWith('details=')) {
        const key = decodeURIComponent(hash.substring(8));
        // Only navigate if the key is different to prevent infinite loops
        if (currentBookKey !== key) {
            navigate('/details', key);
        }
    } else if (hash === 'finder' && currentPage !== '/finder') {
        navigate('/finder');
    } else if (hash === '' && currentPage !== '/') {
        navigate('/');
    }
});