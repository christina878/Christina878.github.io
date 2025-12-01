function searchBooks() {
    const query = document.getElementById("searchInput").value.trim();
    const results = document.getElementById("results");

    if (!query) return;

    results.innerHTML = `<h4 class="text-center">Loading...</h4>`;

    fetch(`https://openlibrary.org/search.json?q=${query}`)
        .then(res => res.json())
        .then(data => {
            results.innerHTML = "";

            if (data.docs.length === 0) {
                results.innerHTML = `<h4 class="text-center text-danger">No results found.</h4>`;
                return;
            }

            data.docs.slice(0, 20).forEach(book => {
                const coverId = book.cover_i;
                const img = coverId
                    ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
                    : "https://via.placeholder.com/200x300?text=No+Cover";

                const workId = book.key.split("/works/")[1];

                results.innerHTML += `
                <div class="col-md-3">
                    <div class="card shadow h-100">
                        <img src="${img}" class="card-img-top">
                        <div class="card-body">
                            <h5 class="card-title">${book.title}</h5>
                            <p class="text-muted">${book.author_name ? book.author_name[0] : "Unknown Author"}</p>
                            <a href="book.html?id=${workId}" class="btn btn-dark w-100">View Details</a>
                        </div>
                    </div>
                </div>`;
            });
        });
}
