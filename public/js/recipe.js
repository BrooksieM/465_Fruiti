// public/js/recipe.js

// Bump when you actually replace the image files:
const VERSION = 3002;
const FALLBACK = "/images/placeholder/fruitproj3jpg.jpg";

const DATA = [
  {
    title: "Apple Pie",
    image: `/images/recipes/apple-pie.jpg?v=${VERSION}`,
    rating: 4.7, difficulty: "Easy", timeMins: 35, theme: "green"
  },
  {
    title: "French Apple Pie",
    image: `/images/recipes/tarte-tatin-pro.jpg?v=${VERSION}`,
    rating: 4.9, difficulty: "Medium", timeMins: 50, theme: "amber"
  }
];

const icons = {
  star: `<svg viewBox="0 0 24 24"><path d="M12 17.3l-6.18 3.7 1.64-7.03L2 8.98l7.19-.62L12 1.8l2.81 6.56 7.19.62-5.46 4.99 1.64 7.03L12 17.3z" fill="currentColor"/></svg>`,
  chart:`<svg viewBox="0 0 24 24"><path d="M4 19h16M7 16v-6M12 16V8m5 8v-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  clock:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v6l4 2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`
};

function statPill(r){
  const alt = r.theme === "amber" ? " alt" : "";
  return `
    <div class="stats${alt}">
      <div class="stat">${icons.star}<span>${r.rating.toFixed(1)}</span></div>
      <div class="stat">${icons.chart}<span>${r.difficulty}</span></div>
      <div class="stat">${icons.clock}<span>${r.timeMins} mins</span></div>
    </div>`;
}

function card(r){
  return `
    <article class="card">
      <h2>${r.title}</h2>
      <div class="media">
        <img class="card-img" data-src="${r.image}" alt="${r.title}">
      </div>
      ${statPill(r)}
    </article>`;
}

function wireImages(){
  document.querySelectorAll("img.card-img").forEach(img => {
    const src = img.getAttribute("data-src");
    img.onerror = function(){
      // prevent recursive errors
      this.onerror = null;
      this.src = FALLBACK;
    };
    img.src = src; // assign after onerror is set
  });
}

function render(list){
  document.getElementById("cards").innerHTML = list.map(card).join("");
  wireImages();
}

// chip demo (optional)
(function init(){
  const row = document.getElementById("chipsRow");
  if (row) {
    row.addEventListener("click",(e)=>{
      const btn = e.target.closest("button.chip"); if(!btn) return;
      btn.remove(); const h1 = document.querySelector(".page-title");
      if (h1) h1.textContent = "Recipes";
    });
  }
  render(DATA);
})();
