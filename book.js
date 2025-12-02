function searchBooks() {
    const query = document.getElementById("searchInput").value;
    const results = document.getElementById("results");

    if (query === "") {
        results.innerHTML = "<p class='text-danger'>Please type something to search.</p>";
        return;
    }

    results.innerHTML = "<p>Loading...</p>";

    fetch("https://openlibrary.org/search.json?q=" + query)
        .then(r => r.json())
        .then(data => {
            results.innerHTML = "";
            let books = data.docs.slice(0, 12);

            books.forEach(b => {
                let id = b.key.split("/works/")[1];
                let cover = b.cover_i
                    ? "https://covers.openlibrary.org/b/id/" + b.cover_i + "-M.jpg"
                    : "https://via.placeholder.com/150x220?text=No+Cover";

                results.innerHTML += `
                <div class="col-md-3 mb-4">
                  <div class="card h-100">
                    <img src="${cover}" class="card-img-top">
                    <div class="card-body">
                      <h5>${b.title}</h5>
                      <p class="text-muted">${b.author_name ? b.author_name[0] : "Unknown"}</p>
                      <a href="book.html?id=${id}" class="btn btn-dark w-100">View Details</a>
                    </div>
                  </div>
                </div>`;
            });
        });
}
