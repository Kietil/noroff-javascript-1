import {
  clearCart,
  getCart,
  getCartTotal,
  removeFromCart,
  setLastOrder,
} from "../storage.js";

// Grab mount point from checkout/index.html.
const checkoutContainer = document.querySelector("#checkout");

// Format numbers like $19.99.
function formatMoney(amount) {
  const number = Number(amount ?? 0);
  return `$${number.toFixed(2)}`;
}

// Empty state.
function renderEmpty(container) {
  container.innerHTML = "";

  const p = document.createElement("p");
  p.textContent = "Your cart is empty.";

  const back = document.createElement("a");
  back.className = "games-link";
  back.href = "../index.html";
  back.textContent = "Back to store";

  container.appendChild(p);
  container.appendChild(back);
}

// Error state.
function renderError(container, message) {
  container.innerHTML = "";

  const p = document.createElement("p");
  p.className = "error";
  p.textContent = message;

  container.appendChild(p);
}

// Make cart card item.
function createCartCard(item, onRemove) {
  const card = document.createElement("article");
  card.className = "games-card";

  const img = document.createElement("img");
  img.src = item?.image?.url || "";
  img.alt = item?.image?.alt || item?.title || "Cart item";

  const info = document.createElement("div");
  info.className = "games-info";

  const title = document.createElement("h3");
  title.textContent = item?.title || "Untitled";

  const unitPrice = Number(item?.unitPrice ?? 0);
  const quantity = Number(item?.quantity ?? 0);
  const lineTotal = unitPrice * quantity;

  const meta = document.createElement("p");
  meta.textContent = `Qty: ${quantity} • Price: ${formatMoney(
    unitPrice
  )} • Total: ${formatMoney(lineTotal)}`;

  const actions = document.createElement("div");
  actions.className = "games-links";

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "games-link";
  removeButton.textContent = "Remove";
  // Remove item from cart, then re-render.
  removeButton.addEventListener("click", () => onRemove(item?.id));

  actions.appendChild(removeButton);

  info.appendChild(title);
  info.appendChild(meta);
  info.appendChild(actions);

  card.appendChild(img);
  card.appendChild(info);

  return card;
}

// Render cart items + total + place order.
function renderCheckout(container, cart) {
  container.innerHTML = "";

  if (!Array.isArray(cart) || cart.length === 0) {
    renderEmpty(container);
    return;
  }

  // List items.
  const grid = document.createElement("div");
  grid.className = "games-grid";

  // Re-render cart every time, so UI matches storage.
  const rerender = () => {
    renderCheckout(container, getCart());
  };

  for (const item of cart) {
    const card = createCartCard(item, (id) => {
      try {
        removeFromCart(id);
        rerender();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to remove item.";
        renderError(container, message);
      }
    });

    grid.appendChild(card);
  }

  // Total + place order.
  const summary = document.createElement("div");
  summary.className = "checkout-summary";

  const total = document.createElement("p");
  total.textContent = `Total: ${formatMoney(getCartTotal(cart))}`;

  const placeOrderButton = document.createElement("button");
  placeOrderButton.type = "button";
  placeOrderButton.className = "games-link";
  placeOrderButton.textContent = "Place order";
  placeOrderButton.addEventListener("click", () => {
    try {
      // Save order details for confirmation page.
      setLastOrder({
        createdAt: new Date().toISOString(),
        items: cart,
        total: getCartTotal(cart),
      });
      // Clear cart and go to confirmation page.
      clearCart();
      window.location.href = "./confirmation/index.html";
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to place order.";
      renderError(container, message);
    }
  });

  container.appendChild(grid);
  summary.appendChild(total);
  summary.appendChild(placeOrderButton);
  container.appendChild(summary);
}

// Checkout page entry point.
function initCheckoutPage() {
  if (!checkoutContainer) return;

  try {
    const cart = getCart();
    renderCheckout(checkoutContainer, cart);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load checkout.";
    renderError(checkoutContainer, message);
  }
}

initCheckoutPage();
