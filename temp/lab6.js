async function getData() {
  try {
    const url = "https://brianobruno.github.io/cats.json";
    const response = await fetch(url);
    const data = await response.json();

    const facts = data.facts;
    facts.sort((a, b) => a.factId - b.factId);

    const table = document.getElementById("factTable");
    table.innerHTML = "<tr><th>factId</th><th>fact</th></tr>";

    for (let i = 0; i < facts.length; i++) {
      const row = table.insertRow();
      row.insertCell(0).textContent = facts[i].factId;
      row.insertCell(1).textContent = facts[i].text;  // changed from fact → text
    }

    document.getElementById("catImg").src = data.catPhoto;
  } catch (err) {
    console.error(err);
    alert("Error loading data: " + err.message);
  }
}

document.getElementById("loadBtn").addEventListener("click", getData);
