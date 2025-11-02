// public/js/recipe.js

// During dev we aggressively bust cache:
const bust = () => `?v=${Date.now()}`;

const FALLBACK = "/images/placeholder/fruitproj3jpg.jpg";

const DATA = [
    {
      title: "Apple Pie",
      image: "/images/recipes/apple-pie.jpg?v=1008",
      rating: 4.7, difficulty: "Easy", timeMins: 35, theme: "green"
    },
    {
      title: "French Apple Pie",
      image: "/images/recipes/tarte-tatin-pro.jpg?v=1008",
      rating: 4.9, difficulty: "Medium", timeMins: 50, theme: "amber"
    }
  ];
  

const icons = {
  star: `<svg viewBox="0 0 24 24"><path d="M12 17.3l-6.18 3.7 1.64-7.03L2 8.98l7.19-.62L12 1.8l2.81 6.56 7.19.62-5.46 4.99 1.64 7.03L12 17.3z" fill="currentColor"/></svg>`,
  chart: `<svg viewBox="0 0 24 24"><path d="M4 19h16M7 16v-6M12 16V8m5 8v-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  clock: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v6l4 2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`
};

function statPill(r){
  const amber = r.theme === "amber";
  return `
    <div class="stats ${amber ? "alt": ""}">
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
        <img src="${r.image}" alt="${r.title}" onerror="this.src='${FALLBACK}'"/>
      </div>
      ${statPill(r)}
    </article>`;
}

function render(list){ document.getElementById("cards").innerHTML = list.map(card).join(""); }

(function init(){
  // chip remove demo
  const row = document.getElementById("chipsRow");
  row.addEventListener("click", (e)=>{
    const btn = e.target.closest("button.chip"); if(!btn) return;
    btn.remove(); document.querySelector(".page-title").textContent = "Recipes";
  });
  render(DATA);
})();
