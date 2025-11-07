document.addEventListener("DOMContentLoaded", async () => {
  const sections = document.querySelectorAll(".homepage-images");
  if (sections.length < 2) return;

  try {
    const res = await fetch("/api/articles");
    const result = await res.json();

    if (!result.data || !Array.isArray(result.data)) {
      console.error("Invalid data format from /api/articles");
      return;
    }

    // randomize all articles
    const shuffled = result.data.sort(() => Math.random() - 0.5);

    // picking 4 random articles
    const selected = shuffled.slice(0, 5);

    const topRow = selected.slice(0, 2);
    const bottomRow = selected.slice(2, 4);

    const makeCard = (article) => `
      <div class="card-container">
        <div class="fruit-card">
          <a href="${article.hyperlink}" target="_blank" rel="noopener noreferrer">
            <img src="${article.thumbnail}" alt="${article.title}">
          </a>
          <p>${article.title}</p>
        </div>
      </div>
    `;

    // random cards into the hp
    sections[0].insertAdjacentHTML("beforeend", topRow.map(makeCard).join(""));
    sections[1].insertAdjacentHTML("beforeend", bottomRow.map(makeCard).join(""));

  } catch (err) {
    console.error("Error fetching articles:", err);
  }
});