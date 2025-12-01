function cleanText(text) {
    if (!text) return "No description available.";

    if (typeof text === "object" && text.value) {
        text = text.value;
    }

    // Remove markdown link format [text](link)
    text = text.replace(/\[.*?\]\(.*?\)/g, "");
    text = text.replace(/\[\d+\]/g, "");

    return text.trim();
}

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

fetch(`https://openlibrary.org/works/${id}.json`)
  .then(res => res.json())
  .then(book => {
    const details = document.getElementById("details");

    const cover = book.covers
      ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`
      : "https://via.placeholder.com/300x450?text=No+Cover";

    details.innerHTML = `
      <div class="row">
        <div class="col-md-4">
          <img class="img-fluid rounded shadow" src="${cover}">
        </div>

        <div class="col-md-8">
          <h2>${book.title}</h2>

          <p class="mt-3">${cleanText(book.description)}</p>

          <h4 class="mt-4">Subjects</h4>
          <div>
            ${book.subjects ? book.subjects.map(s => `<span class="badge bg-primary me-1">${s}</span>`).join("") : "No subjects available"}
          </div>

          <a href="index.html" class="btn btn-secondary mt-4">← Back</a>
        </div>
      </div>
    `;
  });
