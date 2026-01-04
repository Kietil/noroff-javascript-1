import { fetchProducts } from "../api.js";
import { addToCart } from "../storage.js";

// Grab container from index.html.
const productsContainer = document.querySelector("#products");
let allProducts = [];

// Loading message for UI feedback "something is happening"
function renderLoading(container) {
  container.innerHTML = "";

  const p = document.createElement("p");
  p.className = "loading";
  p.textContent = "Loading products…";

  container.appendChild(p);
}

// If fetching API fails, show error message.
function renderError(container, message) {
  container.innerHTML = "";

  const p = document.createElement("p");
  p.className = "error";
  p.textContent = message;

  container.appendChild(p);
}

// Make product card
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "games-card";
  card.classList.add("is-clickable");

  const productHref = `./product/index.html?id=${encodeURIComponent(
    product.id
  )}`;

  // API returns image like: product.image.url and product.image.alt
  const img = document.createElement("img");
  img.src = product?.image?.url || "";
  img.alt = product?.image?.alt || product?.title || "Game cover";

  // Card elements
  const info = document.createElement("div");
  info.className = "games-info";

  const title = document.createElement("h3");
  title.textContent = product?.title || "Untitled";

  // Shorten description to avoid cards becoming too large.
  const description = document.createElement("p");
  const full = product?.description || "";
  description.textContent = full.length > 120 ? `${full.slice(0, 120)}…` : full;

  const links = document.createElement("div");
  links.className = "games-links";

  // "Add to cart" button on cards
  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "games-link";

  const addIcon = document.createElement("i");
  addIcon.className = "fas fa-shopping-cart";

  const addText = document.createElement("span");
  addText.textContent = "Add to cart";

  addButton.appendChild(addIcon);
  addButton.appendChild(addText);

  // UI feedback on card button click
  const status = document.createElement("span");

  addButton.addEventListener("click", () => {
    try {
      addToCart(product, 1);
      status.textContent = " Added.";
    } catch (error) {
      const message =
        error instanceof Error ? error.message : " Could not add to cart.";
      status.textContent = ` ${message}`;
    }
  });

  // Card as link, navigating to product page.
  card.dataset.href = productHref;

  card.addEventListener("click", (event) => {
    const clickedInteractive = event.target.closest("a, button");
    if (clickedInteractive) return;
    window.location.href = card.dataset.href;
  });

  links.appendChild(addButton);
  links.appendChild(status);

  info.appendChild(title);
  info.appendChild(description);
  info.appendChild(links);

  card.appendChild(img);
  card.appendChild(info);

  return card;
}

// Render product list.
function renderProducts(container, products) {
  container.innerHTML = "";

  if (!products.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "No products found.";
    container.appendChild(p);
    return;
  }

  for (const product of products) {
    container.appendChild(createProductCard(product));
  }
}

// Filter genre's
function getUniqueGenres(products) {
  const genres = new Set();
  for (const product of products) {
    const genre =
      typeof product?.genre === "string" ? product.genre.trim() : "";
    if (genre) genres.add(genre);
  }

  return Array.from(genres).sort((a, b) => a.localeCompare(b));
}

function renderGenreFilter(parent, products) {
  if (parent.querySelector("#genreFilter")) return;

  const bar = document.createElement("div");
  bar.className = "filter-bar";

  const label = document.createElement("label");
  label.htmlFor = "genreFilter";
  label.textContent = "Filter:";

  const select = document.createElement("select");
  select.id = "genreFilter";

  const allOption = document.createElement("option");
  allOption.value = "__all__";
  allOption.textContent = "All games";
  select.appendChild(allOption);

  const genres = getUniqueGenres(products);
  for (const genre of genres) {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    select.appendChild(option);
  }

  select.addEventListener("change", () => {
    const selected = select.value;
    const filtered =
      selected === "__all__"
        ? allProducts
        : allProducts.filter((p) => p?.genre === selected);

    renderProducts(productsContainer, filtered);
  });

  bar.appendChild(label);
  bar.appendChild(select);

  // Place filter above the grid.
  parent.insertBefore(bar, productsContainer);
}

// Home page entry point (fetch + render)
async function initHomePage() {
  if (!productsContainer) return;

  renderLoading(productsContainer);

  try {
    const products = await fetchProducts();
    allProducts = products;

    // Add genre dropdown (filter).
    renderGenreFilter(productsContainer.parentElement, products);

    // Render products into grid.
    renderProducts(productsContainer, products);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load products.";
    renderError(productsContainer, message);
  }
}

initHomePage();
