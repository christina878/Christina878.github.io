function loadNewBooks() {
  let container = document.getElementById("newBooks");
  container.innerHTML = "Loading...";

  fetch("https://openlibrary.org/search.json?q=new&limit=6")
    .then(r => r.json())
    .then(data => {
      container.innerHTML = "";
      data.docs.forEach(book => {
        let title = book.title || "No Title";
        let cover = book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
          : "https://via.placeholder.com/150";

        container.innerHTML += `
          <div class="col-md-4">
            <div class="card p-3">
              <img src="${cover}" class="img-fluid mb-2">
              <h5>${title}</h5>
            </div>
          </div>
        `;
      });
    });
}

function searchBooks() {
  let q = document.getElementById("searchInput").value;
  let info = document.getElementById("searchInfo");
  let results = document.getElementById("searchResults");

  if (!q) return;

  info.innerHTML = "Searching...";
  results.innerHTML = "";

  fetch("https://openlibrary.org/search.json?q=" + encodeURIComponent(q) + "&limit=20")
    .then(r => r.json())
    .then(data => {
      info.innerHTML = `Found ${data.numFound} results`;

      results.innerHTML = "";
      data.docs.forEach(book => {
        let title = book.title || "No Title";
        let author = book.author_name ? book.author_name[0] : "Unknown";
        let year = book.first_publish_year || "N/A";
        let cover = book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
          : "https://via.placeholder.com/150";

        results.innerHTML += `
          <div class="col-md-4">
            <div class="card p-3">
              <img src="${cover}" class="img-fluid mb-2">
              <h5>${title}</h5>
              <p class="text-muted mb-1">Author: ${author}</p>
              <p class="text-muted mb-2">Year: ${year}</p>

              <button class="btn btn-primary btn-sm mb-2"
        onclick="viewDetails('${title}', '${author}', '${year}', '${cover}')">
  View Details
</button>

              <button class="btn btn-success btn-sm"
                      onclick="addFavorite('${title}')">
                Add to Favorites
              </button>
            </div>
          </div>
        `;
      });
    });
}
function viewDetails(title, author, year, cover) {
  // Encode for URL
  let url = "details.html?title=" + encodeURIComponent(title)
          + "&author=" + encodeURIComponent(author)
          + "&year=" + encodeURIComponent(year)
          + "&cover=" + encodeURIComponent(cover);

  window.location.href = url;
}

// DETAILS POPUP
function showDetails(title, author, year, cover) {
  alert(
    "Title: " + title +
    "\nAuthor: " + author +
    "\nYear: " + year
  );
}

// FAVORITES
function addFavorite(title) {
  let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  if (!favs.includes(title)) favs.push(title);
  localStorage.setItem("favorites", JSON.stringify(favs));
  alert("Added to favorites!");
}

function loadFavorites() {
  let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  let container = document.getElementById("favBooks");

  if (favs.length === 0) {
    container.innerHTML = "<p>No favorites yet.</p>";
    return;
  }

  container.innerHTML = "";
  favs.forEach((title, index) => {
    container.innerHTML += `
      <div class="col-md-4">
        <div class="card p-3">
          <h5>${title}</h5>
          <button class="btn btn-danger btn-sm" onclick="removeFavorite(${index})">
            Remove
          </button>
        </div>
      </div>
    `;
  });
}

function removeFavorite(i) {
  let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  favs.splice(i, 1);
  localStorage.setItem("favorites", JSON.stringify(favs));
  loadFavorites();
}
