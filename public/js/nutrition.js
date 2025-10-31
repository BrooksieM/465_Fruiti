// Rotating hero & dynamic fruit content (5s interval) with fruit-specific farm images.
const FALLBACK = "../images/placeholder/fruitproj3jpg.jpg";

const FRUITS = [
  {
    id: "grapes",
    name: "Grapes",
    badge: "GRAPES",
    title: "Health Benefits of Grapes",
    intro: "Grapes are nature’s candy — bursting with antioxidants, vitamins, and hydration.",
    serving: "Per 100 g",
    stats: { calories: "69 kcal", carbs: "18.1 g", fiber: "0.9 g", sugar: "15.5 g", protein: "0.72 g", fat: "0.16 g" },
    note: "Grapes contain polyphenols such as resveratrol, which support heart and brain health.",
    factsTitle: "Grape Fun Facts",
    facts: [
      "About 80% water, naturally hydrating.",
      "Resveratrol is concentrated in red & purple grape skins.",
      "Over 8,000 named varieties worldwide.",
      "An average cluster has ~75 grapes.",
      "Farm microclimates strongly shape flavor.",
      "Seedless table grapes are bred for crisp sweetness.",
      "Vineyard trellis height affects sun exposure and tannins."
    ],
    hero: [
      "../images/grapes/grapes1.jpg",
      "../images/grapes/grapes2.jpg",
      "../images/grapes/grape-farm.jpg"        // grape farm / vineyard
    ],
    gallery: [
      "../images/grapes/grapes1.jpg",
      "../images/grapes/grapes2.jpg",
      "../images/grapes/grape-farm.jpg"
    ],
    pickerThumb: "../images/grapes/grapes1.jpg"
  },
  {
    id: "strawberries",
    name: "Strawberries",
    badge: "STRAWBERRIES",
    title: "Health Benefits of Strawberries",
    intro: "Strawberries are bright, sweet, and fiber-rich with a refreshing snap.",
    serving: "Per 100 g",
    stats: { calories: "32 kcal", carbs: "7.7 g", fiber: "2.0 g", sugar: "4.9 g", protein: "0.67 g", fat: "0.30 g" },
    note: "Naturally rich in anthocyanins and vitamin C to support immune health.",
    factsTitle: "Strawberry Fun Facts",
    facts: [
      "Technically an aggregate accessory fruit (seeds are achenes on the outside).",
      "Cool nights + sunny days amplify aroma compounds.",
      "Fragaria × ananassa is the common cultivated hybrid.",
      "Short shelf life — best eaten within a day or two.",
      "Raised-bed farms improve drainage and sweetness."
    ],
    hero: [
      "../images/strawberries/strawberry1.jpg",
      "../images/strawberries/strawberry2.jpg",
      "../images/strawberries/strawberry-farm.jpg" // fields / rows of strawberries
    ],
    gallery: [
      "../images/strawberries/strawberry1.jpg",
      "../images/strawberries/strawberry2.jpg",
      "../images/strawberries/strawberry-farm.jpg"
    ],
    pickerThumb: "../images/strawberries/strawberry1.jpg"
  },
  {
    id: "watermelon",
    name: "Watermelon",
    badge: "WATERMELON",
    title: "Health Benefits of Watermelon",
    intro: "Ultra-juicy and low-calorie; perfect for hot days and post-workout rehydration.",
    serving: "Per 100 g",
    stats: { calories: "30 kcal", carbs: "7.6 g", fiber: "0.4 g", sugar: "6.2 g", protein: "0.60 g", fat: "0.15 g" },
    note: "Contains lycopene and citrulline; excellent water content for hydration.",
    factsTitle: "Watermelon Fun Facts",
    facts: [
      "Over 90% water by weight.",
      "Seeded varieties often have firmer, sweeter flesh.",
      "Chilling too much can mute aroma — serve lightly chilled.",
      "Rind is edible when pickled or stir-fried.",
      "Sandy, warm farm soils yield sweeter melons."
    ],
    hero: [
      "../images/watermelon/watermelon1.jpg",
      "../images/watermelon/watermelon2.jpg",
      "../images/watermelon/watermelon-farm.jpg"  // melon fields / farm
    ],
    gallery: [
      "../images/watermelon/watermelon1.jpg",
      "../images/watermelon/watermelon2.jpg",
      "../images/watermelon/watermelon-farm.jpg"
    ],
    pickerThumb: "../images/watermelon/watermelon1.jpg"
  },
  {
    id: "pineapple",
    name: "Pineapple",
    badge: "PINEAPPLE",
    title: "Health Benefits of Pineapple",
    intro: "Sweet-tart and aromatic; contains bromelain enzymes and refreshing acidity.",
    serving: "Per 100 g",
    stats: { calories: "50 kcal", carbs: "13.1 g", fiber: "1.4 g", sugar: "9.9 g", protein: "0.54 g", fat: "0.12 g" },
    note: "Bromelain contributes to tenderizing effects; rinse mouth if sensitive.",
    factsTitle: "Pineapple Fun Facts",
    facts: [
      "Each plant grows a single pineapple at a time.",
      "Core and skin are great for infusions (tepache/agua fresca).",
      "Ripens from the inside out — smell near the base for aroma.",
      "Grilling deepens caramel notes and complexity.",
      "Tropical farm elevation affects acidity and sugar balance."
    ],
    hero: [
      "../images/pineapple/pineapple1.jpg",
      "../images/pineapple/pineapple2.jpg",
      "../images/pineapple/pineapple-farm.jpg"    // pineapple farm rows
    ],
    gallery: [
      "../images/pineapple/pineapple1.jpg",
      "../images/pineapple/pineapple2.jpg",
      "../images/pineapple/pineapple-farm.jpg"
    ],
    pickerThumb: "../images/pineapple/pineapple1.jpg"
  }
];

// Elements
const slidesEl = document.getElementById("heroSlides");
const badgeEl = document.getElementById("heroBadge");
const pageTitleEl = document.getElementById("pageTitle");
const introEl = document.getElementById("introCopy");

const fruitNameEl = document.getElementById("fruitName");
const servingEl = document.getElementById("serving");
const calsEl = document.getElementById("calories");
const carbsEl = document.getElementById("carbs");
const fiberEl = document.getElementById("fiber");
const sugarEl = document.getElementById("sugar");
const proteinEl = document.getElementById("protein");
const fatEl = document.getElementById("fat");
const noteEl = document.getElementById("note");

const factsTitleEl = document.getElementById("factsTitle");
const factsListEl = document.getElementById("factsList");
const galleryGridEl = document.getElementById("galleryGrid");
const pickerListEl = document.getElementById("pickerList");

let slideTimer = null;

function buildSlides(imgs) {
  slidesEl.innerHTML = "";
  imgs.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Hero";
    img.onerror = () => (img.src = FALLBACK);
    img.className = "hero-frame" + (i === 0 ? " show" : "");
    slidesEl.appendChild(img);
  });
}

function startSlideshow() {
  const frames = [...document.querySelectorAll(".hero-frame")];
  if (!frames.length) return;
  if (slideTimer) clearInterval(slideTimer);
  let i = 0;
  slideTimer = setInterval(() => {
    frames[i].classList.remove("show");
    i = (i + 1) % frames.length;
    frames[i].classList.add("show");
  }, 5000); // 5 seconds
}

function renderFruit(fruit) {
  badgeEl.textContent = fruit.badge;
  pageTitleEl.textContent = `Health Benefits of ${fruit.name}`;
  introEl.textContent = fruit.intro;

  fruitNameEl.textContent = fruit.name;
  servingEl.textContent = fruit.serving;
  calsEl.textContent = fruit.stats.calories;
  carbsEl.textContent = fruit.stats.carbs;
  fiberEl.textContent = fruit.stats.fiber;
  sugarEl.textContent = fruit.stats.sugar;
  proteinEl.textContent = fruit.stats.protein;
  fatEl.textContent = fruit.stats.fat;
  noteEl.textContent = fruit.note;

  factsTitleEl.textContent = `${fruit.name} Fun Facts`;
  factsListEl.innerHTML = "";
  fruit.facts.forEach(f => {
    const li = document.createElement("li");
    li.textContent = f;
    factsListEl.appendChild(li);
  });

  galleryGridEl.innerHTML = "";
  fruit.gallery.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = fruit.name;
    img.onerror = () => (img.src = FALLBACK);
    galleryGridEl.appendChild(img);
  });

  buildSlides(fruit.hero);
  startSlideshow();
}

function buildPicker() {
  pickerListEl.innerHTML = "";
  FRUITS.forEach((f, idx) => {
    const item = document.createElement("div");
    item.className = "picker-item" + (idx === 0 ? " active" : "");
    item.dataset.id = f.id;

    const img = document.createElement("img");
    img.className = "picker-thumb";
    img.src = f.pickerThumb || FALLBACK;
    img.alt = f.name;
    img.onerror = () => (img.src = FALLBACK);

    const name = document.createElement("div");
    name.className = "picker-name";
    name.textContent = f.name;

    item.appendChild(img);
    item.appendChild(name);
    item.addEventListener("click", () => {
      document.querySelectorAll(".picker-item").forEach(el => el.classList.remove("active"));
      item.classList.add("active");
      renderFruit(f);
    });
    pickerListEl.appendChild(item);
  });
}

// Init
(function init() {
  buildPicker();
  renderFruit(FRUITS[0]); // default to grapes
})();
