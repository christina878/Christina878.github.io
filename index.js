function searchBooks() {
    const query = document.getElementById("searchInput").value;
    const results = document.getElementById("results");

    if (query === "") {
        results.innerHTML = "<p class='text-danger'>Please enter a title.</p>";
        return;
    }

    results.innerHTML = "<p>Loading...</p>";

    fetch("https://openlibrary.org/search.json?q=" + query)
        .then(response => response.json())
        .then(data => {
            results.innerHTML = "";

            let books = data.docs.slice(0, 12); 

            for (let i = 0; i < books.length; i++) {
                let book = books[i];
                let workId = book.key.split("/works/")[1];
                let cover = book.cover_i 
                    ? "https://covers.openlibrary.org/b/id/" + book.cover_i + "-M.jpg"
                    : "https://via.placeholder.com/150x220?text=No+Cover";

                results.innerHTML += `
                    <div class="col-md-3 mb-4">
                      <div class="card h-100">
                        <img src="${cover}" class="card-img-top" alt="Book Cover">
                        <div class="card-body">
                          <h5 class="card-title">${book.title}</h5>
                          <p class="card-text text-muted">${book.author_name ? book.author_name[0] : "Unknown Author"}</p>
                          <a href="book.html?id=${workId}" class="btn btn-dark w-100">View Details</a>
                        </div>
                      </div>
                    </div>
                `;
            }
        });
}
