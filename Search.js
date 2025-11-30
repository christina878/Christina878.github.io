document.getElementById("searchBtn").addEventListener("click", () => {
    const query = document.getElementById("searchInput").value.trim();
    const errorMsg = document.getElementById("errorMsg");
    const resultsDiv = document.getElementById("results");

    errorMsg.textContent = "";
    resultsDiv.innerHTML = "";

    if (!query) {
        errorMsg.textContent = "Please enter a search term.";
        return;
    }

    fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            if (!data.docs.length) {
                errorMsg.textContent = "No results found.";
                return;
            }

            data.docs.forEach(book => {
                const workID = book.key.replace("/works/", "");
                const coverID = book.cover_i;

                const coverURL = coverID
                    ? `https://covers.openlibrary.org/b/id/${coverID}-M.jpg`
                    : "https://via.placeholder.com/200x300?text=No+Cover";

                const card = `
                    <div class="col-md-4">
                        <div class="card h-100">
                            <img src="${coverURL}" class="card-img-top" alt="">
                            <div class="card-body">
                                <h5>${book.title}</h5>
                                <p class="text-muted">${book.author_name ? book.author_name.join(", ") : "Unknown Author"}</p>
                                <a href="book.html?id=${workID}" class="btn btn-primary">View Details</a>
                            </div>
                        </div>
                    </div>
                `;

                resultsDiv.innerHTML += card;
            });
        })
        .catch(() => {
            errorMsg.textContent = "Something went wrong. Try again.";
        });
});
