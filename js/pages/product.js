import { fetchProduct } from "../api.js";
import { addToCart } from "../storage.js";

// Grab container in product/index.html
const productContainer = document.querySelector("#product");

// Read the product id from the URL
function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// UI state helpers (same as the home)
function renderLoading(container) {
  container.innerHTML = "";

  const p = document.createElement("p");
  p.className = "loading";
  p.textContent = "Loading product…";

  container.appendChild(p);
}

function renderError(container, message) {
  container.innerHTML = "";

  const p = document.createElement("p");
  p.className = "error";
  p.textContent = message;

  container.appendChild(p);
}

// Render product details
function renderProduct(container, product) {
  container.innerHTML = "";

  const wrapper = document.createElement("article");
  wrapper.className = "product-card";

  const img = document.createElement("img");
  img.className = "product-image";
  img.src = product?.image?.url || "";
  img.alt = product?.image?.alt || product?.title || "Game cover";

  const content = document.createElement("div");
  content.className = "product-content";

  const title = document.createElement("h2");
  title.textContent = product?.title || "Untitled";

  const meta = document.createElement("p");
  const parts = [product?.genre, product?.released, product?.ageRating].filter(
    Boolean
  );
  meta.textContent = parts.join(" • ");

  const description = document.createElement("p");
  description.textContent = product?.description || "";

  const price = document.createElement("p");
  const priceNumber = Number(product?.discountedPrice ?? product?.price ?? 0);
  price.textContent = `Price: $${priceNumber.toFixed(2)}`;

  // Add button that stores this product in localStorage (storage.js).
  const actions = document.createElement("div");

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "games-link";

  // Add icon to 'add to cart' button
  const addIcon = document.createElement("i");
  addIcon.className = "fas fa-shopping-cart";

  const addText = document.createElement("span");
  addText.textContent = "Add to Cart";

  addButton.appendChild(addIcon);
  addButton.appendChild(addText);

  // Status message update after clicking
  const status = document.createElement("p");

  const goToCheckout = document.createElement("a");
  goToCheckout.className = "back-link";
  goToCheckout.href = "../checkout/index.html";
  goToCheckout.textContent = "Go to Checkout";
  goToCheckout.style.display = "none";

  addButton.addEventListener("click", () => {
    try {
      addToCart(product, 1);
      status.textContent = "Added to cart.";
      goToCheckout.style.display = "inline-block";
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not add this product to the cart.";
      status.textContent = message;
      goToCheckout.style.display = "none";
    }
  });

  actions.appendChild(addButton);
  actions.appendChild(status);
  actions.appendChild(goToCheckout);

  content.appendChild(title);
  content.appendChild(meta);
  content.appendChild(price);
  content.appendChild(actions);
  content.appendChild(description);

  wrapper.appendChild(img);
  wrapper.appendChild(content);

  container.appendChild(wrapper);
}

// Main function. If the container is missing, don’t run.
async function initProductPage() {
  if (!productContainer) return;

  // Read id from URL
  const productId = getProductIdFromUrl();

  // If URL has no id, fetch fails
  if (!productId) {
    renderError(productContainer, "Missing product id in URL (?id=...).");
    return;
  }

  // Show loading immediately
  renderLoading(productContainer);

  // Fetch one product from the API
  try {
    const product = await fetchProduct(productId);

    // Render it.
    renderProduct(productContainer, product);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load product.";
    renderError(productContainer, message);
  }
}

initProductPage();
