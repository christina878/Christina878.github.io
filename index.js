// HOME PAGE
function loadNewBooks() {
  fetch("https://openlibrary.org/recentchanges.json?limit=5")
    .then(response => response.json())
    .then(data => {
      let container = document.getElementById("newBooks");
      container.innerHTML = "";

      data.forEach(item => {
        if (item.data && item.data.title) {
          container.innerHTML += `
            <div class="col-md-4 mb-3">
              <div class="card p-2">
                <h5>${item.data.title}</h5>
              </div>
            </div>
          `;
        }
      });
    });
}

// BOOKS SEARCH PAGE
function searchBooks() {
  let searchTerm = document.getElementById("searchInput").value;

  fetch("https://openlibrary.org/search.json?q=" + searchTerm)
    .then(response => response.json())
    .then(data => {
      let container = document.getElementById("searchResults");
      container.innerHTML = "";

      data.docs.forEach(book => {
        let title = book.title;
        container.innerHTML += `
          <div class="col-md-4 mb-3">
            <div class="card p-2">
              <h5>${title}</h5>
              <button class="btn btn-primary mt-2" onclick="addFavorite('${title}')">
                Add to Favorites
              </button>
            </div>
          </div>
        `;
      });
    });
}

// FAVORITES SYSTEM
function addFavorite(title) {
  let fav = JSON.parse(localStorage.getItem("favorites")) || [];
  fav.push(title);
  localStorage.setItem("favorites", JSON.stringify(fav));
  alert("Added to favorites!");
}

function loadFavorites() {
  let fav = JSON.parse(localStorage.getItem("favorites")) || [];
  let container = document.getElementById("favBooks");
  container.innerHTML = "";

  fav.forEach(title => {
    container.innerHTML += `
      <div class="col-md-4 mb-3">
        <div class="card p-2">
          <h5>${title}</h5>
        </div>
      </div>
    `;
  });
}
