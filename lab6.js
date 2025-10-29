async function getData() {
  try {
    const url = "https://brianobruno.github.io/cats.json";
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    const facts = data.facts;

    // Sort by factId
    facts.sort((a, b) => a.factId - b.factId);

    // Build table
    const table = document.getElementById("factTable");
    table.innerHTML = "<tr><th>factId</th><th>fact</th></tr>";

    for (let i = 0; i < facts.length; i++) {
      const row = table.insertRow();
      const idCell = row.insertCell(0);
      const factCell = row.insertCell(1);

      idCell.textContent = facts[i].factId;
      factCell.textContent = facts[i].fact;
    }

    // Update cat image
    document.getElementById("catImg").src = data.catPhoto;
  } 
  catch (error) {
    alert("Error loading API data: " + error.message);
  }
}

document.getElementById("loadBtn").addEventListener("click", getData);
