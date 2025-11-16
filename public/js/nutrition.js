// public/js/nutrition.js

// Base URL for your Supabase bucket (nutrition-images)
const BUCKET_BASE =
  "https://ckbweuckrdyfqwqnwrbw.supabase.co/storage/v1/object/public/nutrition-images";

// Fallback image if any image fails to load
const FALLBACK = `${BUCKET_BASE}/placeholder/fruit-placeholder.jpg`;

// All fruits and their data (text + image paths)
const FRUITS = [
  {
    id: "grapes",
    name: "Grapes",
    badge: "GRAPES",
    title: "Health Benefits of Grapes",
    intro:
      "Grapes are small, juicy fruits rich in antioxidants and natural sugars.",
    serving: "Per 100 g",
    stats: {
      calories: "69 kcal",
      carbs: "18.1 g",
      fiber: "0.9 g",
      sugar: "15.5 g",
      protein: "0.72 g",
      fat: "0.16 g"
    },
    note: "Grapes contain polyphenols such as resveratrol that may support heart health.",
    factsTitle: "Grape Facts",
    facts: [
      "Grapes are about 80% water.",
      "Red and purple grapes are especially rich in antioxidants.",
      "Grapes can be eaten fresh, dried (raisins), or juiced."
    ],
    // Hero images for the top slideshow
    hero: [
      `${BUCKET_BASE}/grapes/grapes1.jpg`,
      `${BUCKET_BASE}/grapes/grapes-farm.jpg`,
      `${BUCKET_BASE}/grapes/grapes2.jpg`
    ],
    // Images shown in the gallery grid
    gallery: [
      `${BUCKET_BASE}/grapes/grapes1.jpg`,
      `${BUCKET_BASE}/grapes/grapes-farm.jpg`,
      `${BUCKET_BASE}/grapes/grapes2.jpg`
    ],
    // Small thumbnail in the right-side picker
    pickerThumb: `${BUCKET_BASE}/grapes/grapes1.jpg`
  },
  {
    id: "strawberries",
    name: "Strawberries",
    badge: "STRAWBERRIES",
    title: "Health Benefits of Strawberries",
    intro:
      "Strawberries are bright, sweet berries loaded with vitamin C and fiber.",
    serving: "Per 100 g",
    stats: {
      calories: "32 kcal",
      carbs: "7.7 g",
      fiber: "2.0 g",
      sugar: "4.9 g",
      protein: "0.67 g",
      fat: "0.30 g"
    },
    note: "Their red color comes from antioxidant compounds called anthocyanins.",
    factsTitle: "Strawberry Facts",
    facts: [
      "The tiny dots on the outside are actually fruits called achenes.",
      "Strawberries are best eaten soon after harvest.",
      "They grow close to the ground on low plants."
    ],
    hero: [
      `${BUCKET_BASE}/strawberries/strawberries1.jpg`,
      `${BUCKET_BASE}/strawberries/strawberries-farm.jpg`,
      `${BUCKET_BASE}/strawberries/strawberries2.jpg`
    ],
    gallery: [
      `${BUCKET_BASE}/strawberries/strawberries1.jpg`,
      `${BUCKET_BASE}/strawberries/strawberries-farm.jpg`,
      `${BUCKET_BASE}/strawberries/strawberries2.jpg`
    ],
    pickerThumb: `${BUCKET_BASE}/strawberries/strawberries1.jpg`
  },
  {
    id: "watermelon",
    name: "Watermelon",
    badge: "WATERMELON",
    title: "Health Benefits of Watermelon",
    intro:
      "Watermelon is extremely hydrating and naturally sweet, perfect for hot days.",
    serving: "Per 100 g",
    stats: {
      calories: "30 kcal",
      carbs: "7.6 g",
      fiber: "0.4 g",
      sugar: "6.2 g",
      protein: "0.60 g",
      fat: "0.15 g"
    },
    note: "Watermelon is over 90% water and contains lycopene, a red antioxidant pigment.",
    factsTitle: "Watermelon Facts",
    facts: [
      "Watermelons originate from Africa.",
      "The rind is edible and can be pickled or stir-fried.",
      "Lycopene is concentrated in the red flesh."
    ],
    hero: [
      `${BUCKET_BASE}/watermelon/watermelon1.jpg`,
      `${BUCKET_BASE}/watermelon/watermelon-farm.jpg`,
      `${BUCKET_BASE}/watermelon/watermelon2.jpg`
    ],
    gallery: [
      `${BUCKET_BASE}/watermelon/watermelon1.jpg`,
      `${BUCKET_BASE}/watermelon/watermelon-farm.jpg`,
      `${BUCKET_BASE}/watermelon/watermelon2.jpg`
    ],
    pickerThumb: `${BUCKET_BASE}/watermelon/watermelon1.jpg`
  },
  {
    id: "pineapple",
    name: "Pineapple",
    badge: "PINEAPPLE",
    title: "Health Benefits of Pineapple",
    intro:
      "Pineapple is a tropical fruit that is sweet, tangy, and rich in vitamin C.",
    serving: "Per 100 g",
    stats: {
      calories: "50 kcal",
      carbs: "13.1 g",
      fiber: "1.4 g",
      sugar: "9.9 g",
      protein: "0.54 g",
      fat: "0.12 g"
    },
    note: "Pineapple contains bromelain, an enzyme mix that may help with digestion.",
    factsTitle: "Pineapple Facts",
    facts: [
      "Pineapples grow on low plants, not trees.",
      "Each pineapple is made from many fused flowers.",
      "They prefer warm, sunny climates."
    ],
    hero: [
      `${BUCKET_BASE}/pineapple/pineapple1.jpg`,
      `${BUCKET_BASE}/pineapple/pineapple-farm.jpg`,
      `${BUCKET_BASE}/pineapple/pineapple2.jpg`
    ],
    gallery: [
      `${BUCKET_BASE}/pineapple/pineapple1.jpg`,
      `${BUCKET_BASE}/pineapple/pineapple-farm.jpg`,
      `${BUCKET_BASE}/pineapple/pineapple2.jpg`
    ],
    pickerThumb: `${BUCKET_BASE}/pineapple/pineapple1.jpg`
  },
  {
    id: "banana",
    name: "Banana",
    badge: "BANANA",
    title: "Health Benefits of Bananas",
    intro:
      "Bananas are a convenient snack, high in potassium and quick-digesting carbs.",
    serving: "Per 100 g",
    stats: {
      calories: "89 kcal",
      carbs: "22.8 g",
      fiber: "2.6 g",
      sugar: "12.2 g",
      protein: "1.1 g",
      fat: "0.3 g"
    },
    note: "Potassium in bananas supports normal muscle function and blood pressure.",
    factsTitle: "Banana Facts",
    facts: [
      "Bananas grow in large hanging clusters.",
      "Most bananas sold are the Cavendish variety.",
      "Green bananas are firmer and less sweet."
    ],
    hero: [
      `${BUCKET_BASE}/banana/banana1.jpg`,
      `${BUCKET_BASE}/banana/banana-farm.jpg`,
      `${BUCKET_BASE}/banana/banana2.jpg`
    ],
    gallery: [
      `${BUCKET_BASE}/banana/banana1.jpg`,
      `${BUCKET_BASE}/banana/banana-farm.jpg`,
      `${BUCKET_BASE}/banana/banana2.jpg`
    ],
    pickerThumb: `${BUCKET_BASE}/banana/banana1.jpg`
  },
  {
    id: "blueberries",
    name: "Blueberries",
    badge: "BLUEBERRIES",
    title: "Health Benefits of Blueberries",
    intro:
      "Blueberries are small, dark berries known for their antioxidant content.",
    serving: "Per 100 g",
    stats: {
      calories: "57 kcal",
      carbs: "14.5 g",
      fiber: "2.4 g",
      sugar: "10.0 g",
      protein: "0.7 g",
      fat: "0.3 g"
    },
    note: "They are often studied for potential benefits to brain and heart health.",
    factsTitle: "Blueberry Facts",
    facts: [
      "Blueberries grow on bushes.",
      "They freeze well and keep their structure.",
      "Their blue color comes from anthocyanins."
    ],
    hero: [
      `${BUCKET_BASE}/blueberries/blueberries1.jpg`,
      `${BUCKET_BASE}/blueberries/blueberries-farm.jpg`,
      `${BUCKET_BASE}/blueberries/blueberries2.jpg`
    ],
    gallery: [
      `${BUCKET_BASE}/blueberries/blueberries1.jpg`,
      `${BUCKET_BASE}/blueberries/blueberries-farm.jpg`,
      `${BUCKET_BASE}/blueberries/blueberries2.jpg`
    ],
    pickerThumb: `${BUCKET_BASE}/blueberries/blueberries1.jpg`
  },
  {
    id: "orange",
    name: "Orange",
    badge: "ORANGE",
    title: "Health Benefits of Oranges",
    intro:
      "Oranges are citrus fruits packed with vitamin C and refreshing juice.",
    serving: "Per 100 g",
    stats: {
      calories: "47 kcal",
      carbs: "11.8 g",
      fiber: "2.4 g",
      sugar: "9.4 g",
      protein: "0.9 g",
      fat: "0.1 g"
    },
    note: "Vitamin C contributes to normal immune function and collagen formation.",
    factsTitle: "Orange Facts",
    facts: [
      "Oranges are hybrids of pomelo and mandarin.",
      "Navel and Valencia are popular varieties.",
      "The white pith is bitter but rich in fiber."
    ],
    hero: [
      `${BUCKET_BASE}/orange/orange1.jpg`,
      `${BUCKET_BASE}/orange/orange-farm.jpg`,
      `${BUCKET_BASE}/orange/orange2.jpg`
    ],
    gallery: [
      `${BUCKET_BASE}/orange/orange1.jpg`,
      `${BUCKET_BASE}/orange/orange-farm.jpg`,
      `${BUCKET_BASE}/orange/orange2.jpg`
    ],
    pickerThumb: `${BUCKET_BASE}/orange/orange1.jpg`
  },
  {
    id: "apple",
    name: "Apple",
    badge: "APPLE",
    title: "Health Benefits of Apples",
    intro:
      "Apples are crisp fruits that provide fiber and a range of plant compounds.",
    serving: "Per 100 g",
    stats: {
      calories: "52 kcal",
      carbs: "13.8 g",
      fiber: "2.4 g",
      sugar: "10.4 g",
      protein: "0.3 g",
      fat: "0.2 g"
    },
    note: "Most of the fiber and some antioxidants are in or near the peel.",
    factsTitle: "Apple Facts",
    facts: [
      "Apples belong to the rose family.",
      "There are thousands of apple varieties.",
      "They store well in cool, humid environments."
    ],
    hero: [
      `${BUCKET_BASE}/apple/apple1.jpg`,
      `${BUCKET_BASE}/apple/apple-farm.jpg`,
      `${BUCKET_BASE}/apple/apple2.jpg`
    ],
    gallery: [
      `${BUCKET_BASE}/apple/apple1.jpg`,
      `${BUCKET_BASE}/apple/apple-farm.jpg`,
      `${BUCKET_BASE}/apple/apple2.jpg`
    ],
    pickerThumb: `${BUCKET_BASE}/apple/apple1.jpg`
  },
  {
    id: "mango",
    name: "Mango",
    badge: "MANGO",
    title: "Health Benefits of Mangoes",
    intro:
      "Mangoes are sweet, rich fruits that provide vitamin A, vitamin C, and fiber.",
    serving: "Per 100 g",
    stats: {
      calories: "60 kcal",
      carbs: "15.0 g",
      fiber: "1.6 g",
      sugar: "13.7 g",
      protein: "0.8 g",
      fat: "0.4 g"
    },
    note: "Mangoes are a good source of beta-carotene, which the body can convert to vitamin A.",
    factsTitle: "Mango Facts",
    facts: [
      "Often called the king of fruits in some regions.",
      "Different varieties have different aromas and sweetness.",
      "Green mangoes are used in pickles and salads."
    ],
    hero: [
      `${BUCKET_BASE}/mango/mango1.jpg`,
      `${BUCKET_BASE}/mango/mango-farm.jpg`,
      `${BUCKET_BASE}/mango/mango2.jpg`
    ],
    gallery: [
      `${BUCKET_BASE}/mango/mango1.jpg`,
      `${BUCKET_BASE}/mango/mango-farm.jpg`,
      `${BUCKET_BASE}/mango/mango2.jpg`
    ],
    pickerThumb: `${BUCKET_BASE}/mango/mango1.jpg`
  },
  {
    id: "kiwi",
    name: "Kiwi",
    badge: "KIWI",
    title: "Health Benefits of Kiwi",
    intro:
      "Kiwi has a tangy flavor and is very high in vitamin C and dietary fiber.",
    serving: "Per 100 g",
    stats: {
      calories: "61 kcal",
      carbs: "14.7 g",
      fiber: "3.0 g",
      sugar: "9.0 g",
      protein: "1.1 g",
      fat: "0.5 g"
    },
    note: "Kiwis contain both soluble and insoluble fiber, supporting digestion.",
    factsTitle: "Kiwi Facts",
    facts: [
      "Originally called Chinese gooseberries.",
      "The fuzzy skin is edible when washed.",
      "Golden kiwis are smoother and usually sweeter."
    ],
    hero: [
      `${BUCKET_BASE}/kiwi/kiwi1.jpg`,
      `${BUCKET_BASE}/kiwi/kiwi-farm.jpg`,
      `${BUCKET_BASE}/kiwi/kiwi2.jpg`
    ],
    gallery: [
      `${BUCKET_BASE}/kiwi/kiwi1.jpg`,
      `${BUCKET_BASE}/kiwi/kiwi-farm.jpg`,
      `${BUCKET_BASE}/kiwi/kiwi2.jpg`
    ],
    pickerThumb: `${BUCKET_BASE}/kiwi/kiwi1.jpg`
  },
  {
    id: "peach",
    name: "Peach",
    badge: "PEACH",
    title: "Health Benefits of Peaches",
    intro:
      "Peaches are juicy stone fruits that provide vitamins A and C plus hydration.",
    serving: "Per 100 g",
    stats: {
      calories: "39 kcal",
      carbs: "9.5 g",
      fiber: "1.5 g",
      sugar: "8.4 g",
      protein: "0.9 g",
      fat: "0.3 g"
    },
    note: "Their soft flesh and aroma make them popular in desserts and snacks.",
    factsTitle: "Peach Facts",
    facts: [
      "Peaches have fuzzy skin; nectarines are smooth.",
      "They are native to Northwest China.",
      "White peaches are often sweeter and less acidic."
    ],
    hero: [
      `${BUCKET_BASE}/peach/peach1.jpg`,
      `${BUCKET_BASE}/peach/peach-farm.jpg`,
      `${BUCKET_BASE}/peach/peach2.jpg`
    ],
    gallery: [
      `${BUCKET_BASE}/peach/peach1.jpg`,
      `${BUCKET_BASE}/peach/peach-farm.jpg`,
      `${BUCKET_BASE}/peach/peach2.jpg`
    ],
    pickerThumb: `${BUCKET_BASE}/peach/peach1.jpg`
  },
  {
    id: "cherry",
    name: "Cherry",
    badge: "CHERRY",
    title: "Health Benefits of Cherries",
    intro:
      "Cherries are sweet-tart stone fruits rich in polyphenols and vitamin C.",
    serving: "Per 100 g",
    stats: {
      calories: "63 kcal",
      carbs: "16.0 g",
      fiber: "2.1 g",
      sugar: "12.8 g",
      protein: "1.1 g",
      fat: "0.2 g"
    },
    note: "Tart cherries are often studied for potential sleep and recovery benefits.",
    factsTitle: "Cherry Facts",
    facts: [
      "There are sweet and tart cherry varieties.",
      "Cherry blossoms are celebrated worldwide.",
      "Birds love cherries, so trees are often netted."
    ],
    hero: [
      `${BUCKET_BASE}/cherry/cherry1.jpg`,
      `${BUCKET_BASE}/cherry/cherry-farm.jpg`,
      `${BUCKET_BASE}/cherry/cherry2.jpg`
    ],
    gallery: [
      `${BUCKET_BASE}/cherry/cherry1.jpg`,
      `${BUCKET_BASE}/cherry/cherry-farm.jpg`,
      `${BUCKET_BASE}/cherry/cherry2.jpg`
    ],
    pickerThumb: `${BUCKET_BASE}/cherry/cherry1.jpg`
  },
  {
    id: "pomegranate",
    name: "Pomegranate",
    badge: "POMEGRANATE",
    title: "Health Benefits of Pomegranates",
    intro:
      "Pomegranate arils are rich in vitamin C, fiber, and colorful antioxidants.",
    serving: "Per 100 g (arils)",
    stats: {
      calories: "83 kcal",
      carbs: "18.7 g",
      fiber: "4.0 g",
      sugar: "13.7 g",
      protein: "1.7 g",
      fat: "1.2 g"
    },
    note: "Their deep red pigments (punicalagins) have strong antioxidant activity.",
    factsTitle: "Pomegranate Facts",
    facts: [
      "A single fruit can contain hundreds of arils.",
      "Pomegranates have been symbols of abundance.",
      "They are often juiced or used in sauces and salads."
    ],
    hero: [
      `${BUCKET_BASE}/pomegranate/pomegranate1.jpg`,
      `${BUCKET_BASE}/pomegranate/pomegranate-farm.jpg`,
      `${BUCKET_BASE}/pomegranate/pomegranate2.jpg`
    ],
    gallery: [
      `${BUCKET_BASE}/pomegranate/pomegranate1.jpg`,
      `${BUCKET_BASE}/pomegranate/pomegranate-farm.jpg`,
      `${BUCKET_BASE}/pomegranate/pomegranate2.jpg`
    ],
    pickerThumb: `${BUCKET_BASE}/pomegranate/pomegranate1.jpg`
  },
  {
    id: "avocado",
    name: "Avocado",
    badge: "AVOCADO",
    title: "Health Benefits of Avocados",
    intro:
      "Avocados are creamy fruits rich in healthy fats, fiber, and potassium.",
    serving: "Per 100 g",
    stats: {
      calories: "160 kcal",
      carbs: "8.5 g",
      fiber: "6.7 g",
      sugar: "0.7 g",
      protein: "2.0 g",
      fat: "14.7 g"
    },
    note: "Most of the fat in avocado is monounsaturated, similar to olive oil.",
    factsTitle: "Avocado Facts",
    facts: [
      "Avocados grow on evergreen trees.",
      "They are technically berries with one large seed.",
      "They are popular in salads, toast, and guacamole."
    ],
    hero: [
      `${BUCKET_BASE}/avocado/avocado1.jpg`,
      `${BUCKET_BASE}/avocado/avocado-farm.jpg`,
      `${BUCKET_BASE}/avocado/avocado2.jpg`
    ],
    gallery: [
      `${BUCKET_BASE}/avocado/avocado1.jpg`,
      `${BUCKET_BASE}/avocado/avocado-farm.jpg`,
      `${BUCKET_BASE}/avocado/avocado2.jpg`
    ],
    pickerThumb: `${BUCKET_BASE}/avocado/avocado1.jpg`
  }
];

// Get references to all the DOM elements we update
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

// Timer for the hero slideshow
let slideTimer = null;

// Build the hero slideshow for a specific fruit
function buildSlides(imgs) {
  slidesEl.innerHTML = "";
  imgs.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Fruit hero image";
    img.onerror = () => {
      img.src = FALLBACK;
    };
    // First image is visible ("show" class), others are hidden
    img.className = "hero-frame" + (i === 0 ? " show" : "");
    slidesEl.appendChild(img);
  });
  startSlideshow();
}

// Start rotating between hero images every 5 seconds
function startSlideshow() {
  if (slideTimer) clearInterval(slideTimer);

  slideTimer = setInterval(() => {
    const frames = slidesEl.querySelectorAll(".hero-frame");
    if (!frames.length) return;

    let current = -1;
    frames.forEach((frame, index) => {
      if (frame.classList.contains("show")) current = index;
    });

    const next = (current + 1) % frames.length;

    frames.forEach(f => f.classList.remove("show"));
    frames[next].classList.add("show");
  }, 5000);
}

// Render all text and images for the selected fruit
function renderFruit(fruit) {
  // Top hero area
  badgeEl.textContent = fruit.badge;
  pageTitleEl.textContent = fruit.title || `Health Benefits of ${fruit.name}`;
  introEl.textContent = fruit.intro;

  // Stats card
  fruitNameEl.textContent = fruit.name;
  servingEl.textContent = fruit.serving;
  calsEl.textContent = fruit.stats.calories;
  carbsEl.textContent = fruit.stats.carbs;
  fiberEl.textContent = fruit.stats.fiber;
  sugarEl.textContent = fruit.stats.sugar;
  proteinEl.textContent = fruit.stats.protein;
  fatEl.textContent = fruit.stats.fat;
  noteEl.textContent = fruit.note;

  // Facts list
  factsTitleEl.textContent = fruit.factsTitle;
  factsListEl.innerHTML = "";
  fruit.facts.forEach(fact => {
    const li = document.createElement("li");
    li.textContent = fact;
    factsListEl.appendChild(li);
  });

  // Gallery images
  galleryGridEl.innerHTML = "";
  fruit.gallery.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `${fruit.name} gallery image`;
    img.onerror = () => {
      img.src = FALLBACK;
    };
    galleryGridEl.appendChild(img);
  });

  // Rebuild hero slideshow for this fruit
  buildSlides(fruit.hero);
}

// Build the right-side list of fruits (picker)
function buildPicker() {
  pickerListEl.innerHTML = "";

  FRUITS.forEach((fruit, index) => {
    const item = document.createElement("div");
    // First fruit is active by default
    item.className = "picker-item" + (index === 0 ? " active" : "");

    const thumb = document.createElement("img");
    thumb.className = "picker-thumb";
    thumb.src = fruit.pickerThumb;
    thumb.alt = `${fruit.name} thumbnail`;
    thumb.onerror = () => {
      thumb.src = FALLBACK;
    };

    const name = document.createElement("span");
    name.className = "picker-name";
    name.textContent = fruit.name;

    item.appendChild(thumb);
    item.appendChild(name);

    // When you click a fruit in the picker, update the page for that fruit
    item.addEventListener("click", () => {
      document
        .querySelectorAll(".picker-item")
        .forEach(el => el.classList.remove("active"));
      item.classList.add("active");
      renderFruit(fruit);
    });

    pickerListEl.appendChild(item);
  });
}

// Initialize the Nutrition page when it loads
(function init() {
  // Safety: don't run if this script is included on another page
  if (!slidesEl) return;

  buildPicker();        // Build the fruit picker list
  renderFruit(FRUITS[0]); // Show the first fruit by default
})();
