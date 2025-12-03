function loadNewBooks() {
  let container = document.getElementById("newBooks");
  container.innerHTML = "Loading...";

  fetch("https://openlibrary.org/search.json?q=new&limit=6")
    .then(r => r.json())
    .then(data => {
      container.innerHTML = "";
      
      data.docs.forEach(book => {
        let title = book.title || "No Title";
        let author = book.author_name ? book.author_name[0] : "Unknown";
        let year = book.first_publish_year || "N/A";
        let workKey = book.key;  // IMPORTANT: example "/works/OL82563W"

        let cover = book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
          : "https://via.placeholder.com/150";

        // MAKE HOME PAGE BOOKS CLICKABLE → go to details.html
        let url = "details.html?title=" + encodeURIComponent(title)
                + "&author=" + encodeURIComponent(author)
                + "&year=" + encodeURIComponent(year)
                + "&cover=" + encodeURIComponent(cover)
                + "&work=" + encodeURIComponent(workKey);

        container.innerHTML += `
  <div class="col-md-4">
    <div class="card p-2 text-center" style="cursor:pointer" onclick="window.location.href='${url}'">
      <img src="${cover}"
           style="width:150px; height:220px; object-fit:cover; margin:auto; display:block;">
      <h5 class="mt-2">${title}</h5>
      <p class="text-muted">${author}</p>
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
      info.innerHTML = `Found ${data.docs.length} of ${data.numFound} results`;

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
    <div class="card p-3 text-center">
      <img src="${cover}"
           style="width:120px; height:180px; object-fit:cover; margin:auto; display:block;">
      <h5 class="mt-2">${title}</h5>
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

// DETAILS POPUP
function showDetails(title, author, year, cover) {
  alert(
    "Title: " + title +
    "\nAuthor: " + author +
    "\nYear: " + year
  );
}
function viewDetails(title, author, year, cover) {
  // Encode for URL
  let url = "details.html?title=" + encodeURIComponent(title)
          + "&author=" + encodeURIComponent(author)
          + "&year=" + encodeURIComponent(year)
          + "&cover=" + encodeURIComponent(cover);

  window.location.href = url;
}

// FAVORITES
function addFavoriteFromDetails() {
  let favs = JSON.parse(localStorage.getItem("favorites") || "[]");

  favs.push({
    title: window.currentBook.title,
    author: window.currentBook.author,
    year: window.currentBook.year,
    cover: window.currentBook.cover,
    work: window.currentBook.work  // SAVE WORK KEY
  });

  localStorage.setItem("favorites", JSON.stringify(favs));
  alert("Book added to favorites!");
}


function loadFavorites() {
  let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  let container = document.getElementById("favBooks");

  if (favs.length === 0) {
    container.innerHTML = "<p>No favorites yet.</p>";
    return;
  }

  container.innerHTML = "";

  favs.forEach((book, index) => {

    // Build URL for details page
    let url = "details.html?title=" + encodeURIComponent(book.title)
            + "&author=" + encodeURIComponent(book.author)
            + "&year=" + encodeURIComponent(book.year)
            + "&cover=" + encodeURIComponent(book.cover);

    container.innerHTML += `
      <div class="col-md-4">
        <div class="card p-3 text-center" style="cursor:pointer" onclick="window.location.href='${url}'">

          <img src="${book.cover}"
               style="width:150px; height:220px; object-fit:cover; margin:auto; display:block;">

          <h5 class="mt-2">${book.title}</h5>
          <p class="text-muted">by ${book.author}</p>
          <p class="text-muted">Published: ${book.year}</p>
        </div>

        <button class="btn btn-danger btn-sm mt-2 w-100" onclick="removeFavorite(${index})">
          Remove
        </button>
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
