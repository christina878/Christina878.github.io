async function getData() {
  const url = "https://brianobruno.github.io/cats.json";
  const response = await fetch(url);
  const data = await response.json();

  const facts = data.facts;
  facts.sort(function(a, b) {
    return a.factId - b.factId;
  });

  const table = document.getElementById("factTable");
  table.innerHTML = "<tr><th>factId</th><th>fact</th></tr>";

  for (let i = 0; i < facts.length; i++) {
    const row = table.insertRow();
    const idCell = row.insertCell(0);
    const factCell = row.insertCell(1);
    idCell.textContent = facts[i].factId;
    factCell.textContent = facts[i].fact;
  }

  document.getElementById("catImg").src = data.catPhoto;
}

document.getElementById("loadBtn").addEventListener("click", getData);
